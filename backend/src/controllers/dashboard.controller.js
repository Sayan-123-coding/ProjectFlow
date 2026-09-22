const isValidUUID = (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

const getWorkspaceDashboard = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (!isValidUUID(workspaceId)) return res.status(400).json({ error: 'Invalid workspace ID' });

    // 1. Verify workspace access
    const { data: wsMember, error: wsMemberError } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', req.user.id)
      .single();

    if (wsMemberError || !wsMember) {
      return res.status(403).json({ error: 'Not permitted to access this workspace' });
    }

    const isWsAdmin = wsMember.role === 'OWNER' || wsMember.role === 'MANAGER';

    // 2. Fetch user's project roles if they are just a workspace member
    let prjRoleMap = {};
    if (!isWsAdmin) {
      const { data: prjMembers } = await req.supabase
        .from('project_members')
        .select('project_id, role')
        .eq('user_id', req.user.id);
      if (prjMembers) {
        prjMembers.forEach(pm => { prjRoleMap[pm.project_id] = pm.role; });
      }
    }

    // 3. Fetch Projects and their Tasks in a single nested query
    const { data: allProjectsData, error: projectsError } = await req.supabase
      .from('projects')
      .select(`
        id,
        name,
        tasks (
          id,
          status,
          due_date,
          assignee_id
        )
      `)
      .eq('workspace_id', workspaceId);

    if (projectsError) {
      return res.status(400).json({ error: projectsError.message });
    }

    // Filter projects based on roles
    let projectsData = [];
    let visibleTaskIds = new Set();
    
    if (isWsAdmin) {
      projectsData = allProjectsData;
      projectsData?.forEach(p => {
        p.tasks?.forEach(t => visibleTaskIds.add(t.id));
      });
    } else {
      projectsData = (allProjectsData || []).filter(p => prjRoleMap[p.id]);
      
      // Filter tasks within those projects
      projectsData = projectsData.map(p => {
        const role = prjRoleMap[p.id];
        if (role === 'MEMBER') {
           const userTasks = p.tasks.filter(t => t.assignee_id === req.user.id);
           userTasks.forEach(t => visibleTaskIds.add(t.id));
           return { ...p, tasks: userTasks };
        } else {
           p.tasks?.forEach(t => visibleTaskIds.add(t.id));
           return p;
        }
      });
    }

    // 4. Process aggregates in memory
    let totalProjects = projectsData ? projectsData.length : 0;
    let globalTotalTasks = 0;
    let globalCompletedTasks = 0;
    let globalInProgressTasks = 0;
    let globalTodoTasks = 0;
    let globalOverdueTasks = 0;

    const now = new Date();

    const projectsList = (projectsData || []).map(project => {
      const tasks = project.tasks || [];
      const totalTasks = tasks.length;
      let completedTasks = 0;

      tasks.forEach(task => {
        globalTotalTasks++;
        if (task.status === 'COMPLETED') {
          completedTasks++;
          globalCompletedTasks++;
        } else if (task.status === 'IN_PROGRESS') {
          globalInProgressTasks++;
        } else if (task.status === 'TODO') {
          globalTodoTasks++;
        }

        if (task.status !== 'COMPLETED' && task.due_date) {
          const dueDate = new Date(task.due_date);
          if (dueDate < now) {
            globalOverdueTasks++;
          }
        }
      });

      let completionPercentage = 0;
      if (totalTasks > 0) {
        completionPercentage = parseFloat(((completedTasks / totalTasks) * 100).toFixed(1));
      }

      return {
        id: project.id,
        name: project.name,
        totalTasks,
        completedTasks,
        completionPercentage
      };
    });

    let globalCompletionPercentage = 0;
    if (globalTotalTasks > 0) {
      globalCompletionPercentage = parseFloat(((globalCompletedTasks / globalTotalTasks) * 100).toFixed(1));
    }

    // 5. Fetch Recent Activity
    let activities = [];
    const projectIds = (projectsData || []).map(p => p.id);
    
    if (projectIds.length > 0) {
      const { data: acts, error: activitiesError } = await req.supabase
        .from('activities')
        .select(`
          id,
          actor_id,
          project_id,
          task_id,
          action,
          metadata,
          created_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(30); // Fetch more to safely filter in memory

      if (activitiesError) {
        return res.status(400).json({ error: activitiesError.message });
      }
      activities = acts;
    }

    let recentActivity = (activities || []).map(act => ({
      id: act.id,
      actor_id: act.actor_id,
      actor_name: act.profiles ? act.profiles.full_name : null,
      actor_avatar: act.profiles ? act.profiles.avatar_url : null,
      project_id: act.project_id,
      task_id: act.task_id,
      action: act.action,
      metadata: act.metadata,
      created_at: act.created_at
    }));

    if (!isWsAdmin) {
      recentActivity = recentActivity.filter(act => {
        const role = prjRoleMap[act.project_id];
        if (role === 'MANAGER') return true;
        if (role === 'MEMBER') {
          return act.task_id === null || visibleTaskIds.has(act.task_id);
        }
        return false;
      });
    }

    recentActivity = recentActivity.slice(0, 10);

    // Build the final response
    return res.status(200).json({
      summary: {
        totalProjects,
        totalTasks: globalTotalTasks,
        completedTasks: globalCompletedTasks,
        inProgressTasks: globalInProgressTasks,
        todoTasks: globalTodoTasks,
        overdueTasks: globalOverdueTasks,
        completionPercentage: globalCompletionPercentage
      },
      projects: projectsList,
      recentActivity
    });

  } catch (err) {
    console.error('getWorkspaceDashboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getWorkspaceDashboard
};
