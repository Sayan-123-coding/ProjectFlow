const isValidUUID = (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

const checkAccess = async (req, projectId) => {
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

  if (wsMember) {
    if (wsMember.role === 'OWNER' || wsMember.role === 'MANAGER') {
      return { hasAccess: true, isManager: true, isMember: true, workspaceId: project.workspace_id };
    }
  }

  const { data: prjMember } = await req.supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', req.user.id)
    .single();

  if (prjMember) {
    const isManager = prjMember.role === 'MANAGER';
    return { hasAccess: true, isManager, isMember: true, workspaceId: project.workspace_id };
  }

  return { hasAccess: false };
};

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!isValidUUID(projectId)) return res.status(400).json({ error: 'Invalid project ID' });

    let { title, description, priority, assignee_id, due_date } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }
    title = title.trim();

    if (priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    if (due_date && isNaN(Date.parse(due_date))) {
      return res.status(400).json({ error: 'Invalid due_date format' });
    }

    const access = await checkAccess(req, projectId);
    if (!access.hasAccess) {
      return res.status(403).json({ error: 'Not permitted to create tasks in this project' });
    }

    if (assignee_id) {
      if (!isValidUUID(assignee_id)) return res.status(400).json({ error: 'Invalid assignee ID' });
      
      const { data: targetMember } = await req.supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', assignee_id)
        .single();
        
      if (!targetMember) {
        return res.status(400).json({ error: 'Assignee is not a member of this project' });
      }
    }

    const insertData = {
      project_id: projectId,
      title,
      description,
      priority: priority || 'MEDIUM',
      status: 'TODO',
      creator_id: req.user.id,
      assignee_id: assignee_id || null,
      due_date: due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: task, error } = await req.supabase
      .from('tasks')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ task });
  } catch (err) {
    console.error('createTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!isValidUUID(projectId)) return res.status(400).json({ error: 'Invalid project ID' });

    let query = req.supabase.from('tasks').select('*', { count: 'exact' }).eq('project_id', projectId);

    const { search, status, priority, assignee_id, sortBy, sortOrder, page, limit } = req.query;

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (status) {
      if (['TODO', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        query = query.eq('status', status);
      } else {
         return res.status(400).json({ error: 'Invalid status filter' });
      }
    }

    if (priority) {
      if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
        query = query.eq('priority', priority);
      } else {
        return res.status(400).json({ error: 'Invalid priority filter' });
      }
    }

    if (assignee_id) {
      if (!isValidUUID(assignee_id)) return res.status(400).json({ error: 'Invalid assignee ID filter' });
      query = query.eq('assignee_id', assignee_id);
    }

    const pageNum = parseInt(page) || 1;
    let limitNum = parseInt(limit) || 10;
    if (limitNum > 50) limitNum = 50;

    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const allowedSortFields = ['created_at', 'updated_at', 'due_date', 'priority', 'title', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const isAsc = sortOrder && sortOrder.toLowerCase() === 'asc';

    query = query.order(sortField, { ascending: isAsc });

    const { data: tasks, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });

  } catch (err) {
    console.error('getProjectTasks error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!isValidUUID(taskId)) return res.status(400).json({ error: 'Invalid task ID' });

    const { data: task, error } = await req.supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !task) {
      return res.status(404).json({ error: 'Task not found or inaccessible' });
    }

    return res.status(200).json({ task });
  } catch (err) {
    console.error('getTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!isValidUUID(taskId)) return res.status(400).json({ error: 'Invalid task ID' });

    const { data: task, error: getError } = await req.supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (getError || !task) {
      return res.status(404).json({ error: 'Task not found or inaccessible' });
    }

    const access = await checkAccess(req, task.project_id);
    if (!access.hasAccess) {
      return res.status(403).json({ error: 'Not permitted to access this project' });
    }

    const isManager = access.isManager;
    const isAssignee = task.assignee_id === req.user.id;

    if (!isManager && !isAssignee) {
      return res.status(403).json({ error: 'Not permitted to update this task' });
    }

    const updates = { updated_at: new Date().toISOString() };
    const { title, description, status, priority, assignee_id, due_date } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title must be a non-empty string' });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (status !== undefined) {
      if (!['TODO', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.status = status;
    }

    if (priority !== undefined) {
      if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority' });
      }
      updates.priority = priority;
    }

    if (due_date !== undefined) {
      if (due_date !== null && isNaN(Date.parse(due_date))) {
        return res.status(400).json({ error: 'Invalid due_date format' });
      }
      updates.due_date = due_date;
    }

    if (assignee_id !== undefined) {
      if (!isManager) {
        return res.status(403).json({ error: 'Only managers can reassign tasks' });
      }
      
      if (assignee_id !== null) {
        if (!isValidUUID(assignee_id)) return res.status(400).json({ error: 'Invalid assignee ID' });
        
        const { data: targetMember } = await req.supabase
          .from('project_members')
          .select('id')
          .eq('project_id', task.project_id)
          .eq('user_id', assignee_id)
          .single();
          
        if (!targetMember) {
          return res.status(400).json({ error: 'Assignee is not a member of this project' });
        }
      }
      updates.assignee_id = assignee_id;
    }

    const { data: updatedTask, error: updateError } = await req.supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    return res.status(200).json({ task: updatedTask });
  } catch (err) {
    console.error('updateTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!isValidUUID(taskId)) return res.status(400).json({ error: 'Invalid task ID' });

    const { data: task, error: getError } = await req.supabase
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();

    if (getError || !task) {
      return res.status(404).json({ error: 'Task not found or inaccessible' });
    }

    const access = await checkAccess(req, task.project_id);
    if (!access.isManager) {
      return res.status(403).json({ error: 'Only managers can delete tasks' });
    }

    const { error } = await req.supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('deleteTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask
};
