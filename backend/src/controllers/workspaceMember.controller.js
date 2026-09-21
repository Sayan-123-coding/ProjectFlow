const getMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const { data, error } = await req.supabase
      .from('workspace_members')
      .select(`
        id,
        workspace_id,
        user_id,
        role,
        joined_at:created_at,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('workspace_id', workspaceId);

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
    const { workspaceId } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }
    if (role === 'OWNER') {
      return res.status(400).json({ error: 'Cannot assign OWNER role' });
    }
    if (role !== 'MANAGER' && role !== 'MEMBER') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data: myMember, error: myMemberError } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', req.user.id)
      .single();

    if (myMemberError || !myMember) {
      return res.status(404).json({ error: 'Workspace not found or inaccessible' });
    }

    if (myMember.role !== 'OWNER' && myMember.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Not permitted to add members' });
    }

    const { data: profile, error: profileError } = await req.supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const { data, error } = await req.supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        role: role,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { 
        return res.status(409).json({ error: 'User is already a member' });
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
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    if (role !== 'MANAGER' && role !== 'MEMBER') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data: myMember, error: myMemberError } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', req.user.id)
      .single();

    if (myMemberError || !myMember || myMember.role !== 'OWNER') {
      return res.status(403).json({ error: 'Not permitted to change member roles' });
    }

    const { data: targetMember } = await req.supabase
      .from('workspace_members')
      .select('user_id')
      .eq('id', memberId)
      .single();
      
    if (targetMember && targetMember.user_id === req.user.id) {
       return res.status(400).json({ error: 'Owner cannot change their own role' });
    }

    const { data, error } = await req.supabase
      .from('workspace_members')
      .update({ role })
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ member: data });
  } catch (err) {
    console.error('updateMemberRole error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const { data: myMember, error: myMemberError } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', req.user.id)
      .single();

    if (myMemberError || !myMember || myMember.role !== 'OWNER') {
      return res.status(403).json({ error: 'Not permitted to remove members' });
    }

    const { data: targetMember } = await req.supabase
      .from('workspace_members')
      .select('user_id')
      .eq('id', memberId)
      .single();

    if (targetMember && targetMember.user_id === req.user.id) {
      return res.status(400).json({ error: 'Owner cannot remove themselves' });
    }

    const { error } = await req.supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId)
      .eq('workspace_id', workspaceId);

    if (error) {
      return res.status(400).json({ error: error.message });
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
