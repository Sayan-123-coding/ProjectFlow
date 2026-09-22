const supabase = require('../config/supabase');

const checkOverdueTasks = async () => {
  try {
    const now = new Date().toISOString();
    
    // Fetch all incomplete tasks that have a due date in the past and are assigned
    const { data: overdueTasks, error } = await supabase
      .from('tasks')
      .select('id, title, project_id, assignee_id, due_date, status')
      .not('status', 'eq', 'COMPLETED')
      .not('assignee_id', 'is', null)
      .not('due_date', 'is', null)
      .lt('due_date', now);

    if (error) {
      console.error('Error fetching overdue tasks:', error.message);
      return;
    }

    if (!overdueTasks || overdueTasks.length === 0) return;

    for (const task of overdueTasks) {
      // Try to insert notification. Idempotency is handled by the unique index on (task_id, recipient_id, type)
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: task.assignee_id,
          type: 'TASK_OVERDUE',
          title: 'Task Overdue',
          message: `The task "${task.title}" is now overdue.`,
          task_id: task.id,
          project_id: task.project_id
        });
      
      // 23505 is the Postgres error code for unique violation. We ignore it because it just means
      // we already created an overdue notification for this task and user.
      if (insertError && insertError.code !== '23505') {
        console.error(`Error creating notification for task ${task.id}:`, insertError.message);
      }
    }
  } catch (err) {
    console.error('checkOverdueTasks unexpected error:', err);
  }
};

const startOverdueTaskChecker = () => {
  // Check every 1 minute
  setInterval(checkOverdueTasks, 60 * 1000);
  
  // Also run once immediately on startup
  setTimeout(checkOverdueTasks, 5000);
  console.log('Overdue task background checker started.');
};

module.exports = {
  startOverdueTaskChecker
};
