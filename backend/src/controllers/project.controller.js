const isValidUUID = (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    if (!isValidUUID(workspaceId)) return res.status(400).json({ error: 'Invalid workspace ID' });
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { data: member, error: memberError } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !member || (member.role !== 'OWNER' && member.role !== 'MANAGER')) {
      return res.status(403).json({ error: 'Not permitted to create projects in this workspace' });
    }

    const { data: project, error: projectError } = await req.supabase
      .from('projects')
      .insert({
        workspace_id: workspaceId,
        name,
        description,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (projectError) {
      return res.status(400).json({ error: projectError.message });
    }

    const { error: projectMemberError } = await req.supabase
      .from('project_members')
      .insert({
        project_id: project.id,
        user_id: req.user.id,
        role: 'MANAGER',
        joined_at: new Date().toISOString()
      });

    if (projectMemberError) {
      console.error('Failed to auto-assign project manager role:', projectMemberError);
      return res.status(500).json({ 
        error: 'Project created, but failed to assign manager role to creator.',
        details: projectMemberError.message
      });
    }

    return res.status(201).json({ project });
  } catch (err) {
    console.error('createProject error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (!isValidUUID(workspaceId)) return res.status(400).json({ error: 'Invalid workspace ID' });

    // Verify workspace access
    const { data: wsMember, error: wsMemberError } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', req.user.id)
      .single();

    if (wsMemberError || !wsMember) {
      return res.status(403).json({ error: 'Not permitted to access projects in this workspace' });
    }

    const { data, error } = await req.supabase
      .from('projects')
      .select(`
        *,
        tasks (
          id,
          status
        )
      `)
      .eq('workspace_id', workspaceId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const projectsWithProgress = data.map(project => {
      const tasks = project.tasks || [];
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Remove tasks array from response to keep payload small
      delete project.tasks;
      
      return {
        ...project,
        totalTasks,
        completedTasks,
        completionPercentage
      };
    });

    return res.status(200).json({ projects: projectsWithProgress });
  } catch (err) {
    console.error('getProjects error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!isValidUUID(projectId)) return res.status(400).json({ error: 'Invalid project ID' });

    const { data, error } = await req.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Project not found or inaccessible' });
    }

    return res.status(200).json({ project: data });
  } catch (err) {
    console.error('getProject error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    if (!isValidUUID(projectId)) return res.status(400).json({ error: 'Invalid project ID' });

    const { data: project, error: getError } = await req.supabase
      .from('projects')
      .select('workspace_id')
      .eq('id', projectId)
      .single();

    if (getError || !project) {
      return res.status(404).json({ error: 'Project not found or inaccessible' });
    }

    let canUpdate = false;
    const { data: wsMember } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', project.workspace_id)
      .eq('user_id', req.user.id)
      .single();

    if (wsMember && (wsMember.role === 'OWNER' || wsMember.role === 'MANAGER')) {
      canUpdate = true;
    } else {
      const { data: prjMember } = await req.supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', req.user.id)
        .single();

      if (prjMember && prjMember.role === 'MANAGER') {
        canUpdate = true;
      }
    }

    if (!canUpdate) {
      return res.status(403).json({ error: 'Not permitted to update project' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const { data, error } = await req.supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ project: data });
  } catch (err) {
    console.error('updateProject error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!isValidUUID(projectId)) return res.status(400).json({ error: 'Invalid project ID' });

    const { data: project, error: getError } = await req.supabase
      .from('projects')
      .select('workspace_id')
      .eq('id', projectId)
      .single();

    if (getError || !project) {
      return res.status(404).json({ error: 'Project not found or inaccessible' });
    }

    const { data: wsMember } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', project.workspace_id)
      .eq('user_id', req.user.id)
      .single();

    if (!wsMember || wsMember.role !== 'OWNER') {
      return res.status(403).json({ error: 'Not permitted to delete project. Only Workspace OWNER allowed.' });
    }

    const { error } = await req.supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('deleteProject error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
};
