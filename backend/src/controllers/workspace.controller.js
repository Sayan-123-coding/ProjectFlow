const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { data: workspace, error: workspaceError } = await req.supabase
      .from('workspaces')
      .insert({
        name,
        description,
        owner_id: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (workspaceError) {
      return res.status(400).json({ error: workspaceError.message });
    }

    const { error: memberError } = await req.supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: req.user.id,
        role: 'OWNER',
        created_at: new Date().toISOString()
      });

    if (memberError) {
      console.error('Failed to create owner membership:', memberError);
      return res.status(500).json({ 
        error: 'Workspace created, but failed to assign owner role.',
        details: memberError.message 
      });
    }

    return res.status(201).json({ workspace });
  } catch (err) {
    console.error('createWorkspace error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('workspaces')
      .select('*');
      
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ workspaces: data });
  } catch (err) {
    console.error('getWorkspaces error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
      return res.status(400).json({ error: 'Invalid workspace ID format' });
    }

    const { data, error } = await req.supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Workspace not found or inaccessible' });
    }

    return res.status(200).json({ workspace: data });
  } catch (err) {
    console.error('getWorkspace error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    const { data: member, error: memberError } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !member) {
      return res.status(404).json({ error: 'Workspace not found or inaccessible' });
    }

    if (member.role !== 'OWNER' && member.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Not permitted to update workspace' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const { data, error } = await req.supabase
      .from('workspaces')
      .update(updates)
      .eq('id', workspaceId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ workspace: data });
  } catch (err) {
    console.error('updateWorkspace error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const { data: member, error: memberError } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !member) {
      return res.status(404).json({ error: 'Workspace not found or inaccessible' });
    }

    if (member.role !== 'OWNER') {
      return res.status(403).json({ error: 'Not permitted to delete workspace' });
    }

    const { error } = await req.supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Workspace deleted successfully' });
  } catch (err) {
    console.error('deleteWorkspace error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace
};
