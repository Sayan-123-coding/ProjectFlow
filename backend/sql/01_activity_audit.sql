-- PHASE 8: Activity / Audit History (Option A)

-- 1. Schema Modifications to preserve deleted activities
-- Add workspace_id to activities (useful for workspace-level audits and preserving access after project deletion)
ALTER TABLE public.activities 
ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Update existing activities to have the correct workspace_id (if any exist)
UPDATE public.activities a
SET workspace_id = p.workspace_id
FROM public.projects p
WHERE a.project_id = p.id;

-- Make project_id nullable and change to SET NULL
ALTER TABLE public.activities ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE public.activities DROP CONSTRAINT activities_project_id_fkey;
ALTER TABLE public.activities ADD CONSTRAINT activities_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

-- Change task_id to SET NULL
ALTER TABLE public.activities DROP CONSTRAINT activities_task_id_fkey;
ALTER TABLE public.activities ADD CONSTRAINT activities_task_id_fkey 
    FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;

-- 2. Add Action Enum Validation
ALTER TABLE public.activities ADD CONSTRAINT activities_action_check CHECK (
    action IN (
        'project_created', 'project_updated', 'project_deleted',
        'task_created', 'task_updated', 'task_status_changed', 
        'task_priority_changed', 'task_assigned', 'task_deleted',
        'project_member_added', 'project_member_removed', 'project_member_role_changed'
    )
);

-- 3. Update Activity RLS Policy
DROP POLICY IF EXISTS "Project members can view activities" ON public.activities;

CREATE POLICY "Users can view activities"
ON public.activities
FOR SELECT
TO authenticated
USING (
    (project_id IS NOT NULL AND public.get_project_role(project_id, auth.uid()) IS NOT NULL)
    OR
    (workspace_id IS NOT NULL AND public.get_workspace_role(workspace_id, auth.uid()) IN ('OWNER', 'MANAGER'))
);

-- 4. Internal Insert Function
CREATE OR REPLACE FUNCTION public.log_activity(
    p_workspace_id uuid,
    p_project_id uuid,
    p_task_id uuid,
    p_action text,
    p_metadata jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id uuid;
BEGIN
    v_actor_id := auth.uid();
    
    -- Silently abort if there is no authenticated user (prevents NOT NULL constraint errors)
    IF v_actor_id IS NULL THEN
        RETURN;
    END IF;

    INSERT INTO public.activities (workspace_id, project_id, task_id, action, metadata, actor_id, created_at)
    VALUES (p_workspace_id, p_project_id, p_task_id, p_action, p_metadata, v_actor_id, now());
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_activity(uuid, uuid, uuid, text, jsonb) FROM PUBLIC, anon, authenticated;

-- 5. Projects Audit Trigger
CREATE OR REPLACE FUNCTION public.trg_projects_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_activity(
            NEW.workspace_id,
            NEW.id,
            NULL,
            'project_created',
            jsonb_build_object('project_name', NEW.name)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.name IS DISTINCT FROM OLD.name OR NEW.description IS DISTINCT FROM OLD.description THEN
            PERFORM public.log_activity(
                NEW.workspace_id,
                NEW.id,
                NULL,
                'project_updated',
                jsonb_build_object(
                    'old_name', OLD.name,
                    'new_name', NEW.name,
                    'old_description', OLD.description,
                    'new_description', NEW.description
                )
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Fire before delete so OLD.id is captured. ON DELETE SET NULL will handle nullifying it in the table.
        PERFORM public.log_activity(
            OLD.workspace_id,
            OLD.id, 
            NULL,
            'project_deleted',
            jsonb_build_object('project_id', OLD.id, 'project_name', OLD.name)
        );
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_audit_trigger ON public.projects;
CREATE TRIGGER projects_audit_trigger
BEFORE INSERT OR UPDATE OR DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.trg_projects_audit();

-- 6. Tasks Audit Trigger
CREATE OR REPLACE FUNCTION public.trg_tasks_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workspace_id uuid;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        SELECT workspace_id INTO v_workspace_id FROM public.projects WHERE id = NEW.project_id;
    ELSE
        SELECT workspace_id INTO v_workspace_id FROM public.projects WHERE id = OLD.project_id;
    END IF;

    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_activity(
            v_workspace_id,
            NEW.project_id,
            NEW.id,
            'task_created',
            jsonb_build_object('task_title', NEW.title)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            PERFORM public.log_activity(
                v_workspace_id, NEW.project_id, NEW.id, 'task_status_changed',
                jsonb_build_object('from', OLD.status, 'to', NEW.status, 'task_title', NEW.title)
            );
        END IF;
        IF NEW.priority IS DISTINCT FROM OLD.priority THEN
            PERFORM public.log_activity(
                v_workspace_id, NEW.project_id, NEW.id, 'task_priority_changed',
                jsonb_build_object('from', OLD.priority, 'to', NEW.priority, 'task_title', NEW.title)
            );
        END IF;
        IF NEW.assignee_id IS DISTINCT FROM OLD.assignee_id THEN
            PERFORM public.log_activity(
                v_workspace_id, NEW.project_id, NEW.id, 'task_assigned',
                jsonb_build_object('old_assignee', OLD.assignee_id, 'new_assignee', NEW.assignee_id, 'task_title', NEW.title)
            );
        END IF;
        IF NEW.title IS DISTINCT FROM OLD.title OR NEW.description IS DISTINCT FROM OLD.description OR NEW.due_date IS DISTINCT FROM OLD.due_date THEN
            PERFORM public.log_activity(
                v_workspace_id, NEW.project_id, NEW.id, 'task_updated',
                jsonb_build_object('task_title', NEW.title)
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_activity(
            v_workspace_id,
            OLD.project_id,
            OLD.id,
            'task_deleted',
            jsonb_build_object('task_id', OLD.id, 'task_title', OLD.title)
        );
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tasks_audit_trigger ON public.tasks;
CREATE TRIGGER tasks_audit_trigger
BEFORE INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.trg_tasks_audit();

-- 7. Project Members Audit Trigger
CREATE OR REPLACE FUNCTION public.trg_project_members_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workspace_id uuid;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        SELECT workspace_id INTO v_workspace_id FROM public.projects WHERE id = NEW.project_id;
    ELSE
        SELECT workspace_id INTO v_workspace_id FROM public.projects WHERE id = OLD.project_id;
    END IF;

    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_activity(
            v_workspace_id, NEW.project_id, NULL, 'project_member_added',
            jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            PERFORM public.log_activity(
                v_workspace_id, NEW.project_id, NULL, 'project_member_role_changed',
                jsonb_build_object('user_id', NEW.user_id, 'from', OLD.role, 'to', NEW.role)
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_activity(
            v_workspace_id, OLD.project_id, NULL, 'project_member_removed',
            jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role)
        );
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS project_members_audit_trigger ON public.project_members;
CREATE TRIGGER project_members_audit_trigger
BEFORE INSERT OR UPDATE OR DELETE ON public.project_members
FOR EACH ROW EXECUTE FUNCTION public.trg_project_members_audit();
