const isValidUUID = (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

const checkProjectAccess = async (req, projectId) => {
  const { data: project } = await req.supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', projectId)
    .single();

  if (!project) return { hasAccess: false };

  const { data: wsMember } = await req.supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', project.workspace_id)
    .eq('user_id', req.user.id)
    .single();

  if (wsMember && (wsMember.role === 'OWNER' || wsMember.role === 'MANAGER')) {
    return { hasAccess: true };
  }

  const { data: prjMember } = await req.supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', req.user.id)
    .single();

  if (prjMember) {
    return { hasAccess: true };
  }

  return { hasAccess: false };
};

const getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!isValidUUID(projectId)) return res.status(400).json({ error: 'Invalid project ID' });

    const access = await checkProjectAccess(req, projectId);
    if (!access.hasAccess) {
      return res.status(403).json({ error: 'Not permitted to access this project' });
    }

    let query = req.supabase.from('activities').select('*', { count: 'exact' }).eq('project_id', projectId);

    const { task_id, page, limit } = req.query;

    if (task_id) {
      if (!isValidUUID(task_id)) return res.status(400).json({ error: 'Invalid task ID filter' });
      query = query.eq('task_id', task_id);
    }

    const pageNum = parseInt(page) || 1;
    let limitNum = parseInt(limit) || 20;
    if (limitNum > 50) limitNum = 50;

    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: activities, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });

  } catch (err) {
    console.error('getProjectActivities error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProjectActivities
};
