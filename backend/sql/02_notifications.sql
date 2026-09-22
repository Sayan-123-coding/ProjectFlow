-- 02_notifications.sql
-- Run this script to create the notifications system

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('TASK_OVERDUE', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_DUE_SOON')),
  title text NOT NULL,
  message text NOT NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Idempotency constraint: Prevent duplicate notifications of the same type for a task and recipient
CREATE UNIQUE INDEX idx_notifications_idempotency 
ON public.notifications (task_id, recipient_id, type);

-- Add index for querying recipient's notifications quickly
CREATE INDEX idx_notifications_recipient 
ON public.notifications (recipient_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (recipient_id = auth.uid());

-- Allow backend service to insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow users to delete their own notifications (optional)
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (recipient_id = auth.uid());
