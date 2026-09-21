const isValidUUID = (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

const checkProjectAdminAccess = async (req, projectId) => {
  const { data: project } = await req.supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', projectId)
    .single();

  if (!project) return false;

  const { data: wsMember } = await req.supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', project.workspace_id)
    .eq('user_id', req.user.id)
    .single();

  if (wsMember && (wsMember.role === 'OWNER' || wsMember.role === 'MANAGER')) {
    return { hasAccess: true, wsRole: wsMember.role, workspaceId: project.workspace_id };
  }

  const { data: prjMember } = await req.supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', req.user.id)
    .single();

  if (prjMember && prjMember.role === 'MANAGER') {
    return { hasAccess: true, wsRole: null, workspaceId: project.workspace_id };
  }

  return false;
};

const getMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!isValidUUID(projectId)) return res.status(400).json({ error: 'Invalid project ID' });

    const { data, error } = await req.supabase
      .from('project_members')
      .select(`
        id,
        project_id,
        user_id,
        role,
        joined_at,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('project_id', projectId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const members = data.map(m => ({
      id: m.id,
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
      fullName: m.profiles.full_name,
      avatarUrl: m.profiles.avatar_url
    }));

    return res.status(200).json({ members });
  } catch (err) {
    console.error('getMembers error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!isValidUUID(projectId) || !isValidUUID(userId)) return res.status(400).json({ error: 'Invalid IDs' });
    if (!role || (role !== 'MANAGER' && role !== 'MEMBER')) return res.status(400).json({ error: 'Invalid role' });

    const authCheck = await checkProjectAdminAccess(req, projectId);
    if (!authCheck || !authCheck.hasAccess) {
      return res.status(403).json({ error: 'Not permitted to add project members' });
    }

    const { data: wsTargetMember, error: targetMemberError } = await req.supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', authCheck.workspaceId)
      .eq('user_id', userId)
      .single();

    if (targetMemberError || !wsTargetMember) {
      return res.status(400).json({ error: 'User is not a member of the workspace' });
    }

    const { data, error } = await req.supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { 
        return res.status(409).json({ error: 'User is already a project member' });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ member: data });
  } catch (err) {
    console.error('addMember error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    if (!isValidUUID(projectId) || !isValidUUID(memberId)) return res.status(400).json({ error: 'Invalid IDs' });
    if (role !== 'MANAGER' && role !== 'MEMBER') return res.status(400).json({ error: 'Invalid role' });

    const authCheck = await checkProjectAdminAccess(req, projectId);
    if (!authCheck || !authCheck.hasAccess) {
      return res.status(403).json({ error: 'Not permitted to access project' });
    }

    if (authCheck.wsRole === null) { 
      return res.status(403).json({ error: 'Project MANAGERs cannot change member roles' });
    }

    const { data, error } = await req.supabase
      .from('project_members')
      .update({ role })
      .eq('id', memberId)
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    if (!data) {
       return res.status(404).json({ error: 'Member not found or not permitted to update by RLS policy' });
    }

    return res.status(200).json({ member: data });
  } catch (err) {
    console.error('updateMemberRole error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    if (!isValidUUID(projectId) || !isValidUUID(memberId)) return res.status(400).json({ error: 'Invalid IDs' });

    const { data: targetMember, error: memberError } = await req.supabase
       .from('project_members')
       .select('*')
       .eq('id', memberId)
       .eq('project_id', projectId)
       .single();

    if (memberError || !targetMember) {
        return res.status(404).json({ error: 'Member not found or inaccessible' });
    }

    const { error } = await req.supabase
      .from('project_members')
      .delete()
      .eq('id', memberId)
      .eq('project_id', projectId);

    if (error) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('removeMember error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember
};
