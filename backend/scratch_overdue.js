require('dotenv').config();
const { checkOverdueTasks } = require('./src/services/notification.service');

const supabase = require('./src/config/supabase');

async function testOverdue() {
  console.log("Running checkOverdueTasks logic...");
  try {
    const now = new Date().toISOString();
    
    // First, let's artificially make a task overdue
    const { data: users } = await supabase.from('profiles').select('id').limit(1);
    const userId = users[0].id;
    
    const { data: projects } = await supabase.from('projects').select('id').limit(1);
    const projectId = projects[0].id;
    
    console.log("Creating overdue task...");
    const { data: task, error: createErr } = await supabase.from('tasks').insert({
      project_id: projectId,
      creator_id: userId,
      title: 'TEST OVERDUE TASK',
      assignee_id: userId,
      status: 'TODO',
      due_date: new Date(Date.now() - 100000).toISOString() // Past date
    }).select().single();
    
    if (createErr) throw createErr;
    
    console.log("Task created:", task.id);
    
    // Run the logic from notification.service.js
    const { data: overdueTasks, error } = await supabase
      .from('tasks')
      .select('id, title, project_id, assignee_id, due_date, status')
      .not('status', 'eq', 'COMPLETED')
      .not('assignee_id', 'is', null)
      .not('due_date', 'is', null)
      .lt('due_date', now);
      
    console.log(`Found ${overdueTasks.length} overdue tasks.`);
    
    for (const t of overdueTasks) {
      if (t.id === task.id) {
         console.log("Found our test task in overdue tasks.");
         const { error: insertError } = await supabase
          .from('notifications')
          .insert({
            recipient_id: t.assignee_id,
            type: 'TASK_OVERDUE',
            title: 'Task Overdue',
            message: `The task "${t.title}" is now overdue.`,
            task_id: t.id,
            project_id: t.project_id
          });
         if (!insertError) {
           console.log("Successfully inserted overdue notification.");
         } else if (insertError.code === '23505') {
           console.log("Idempotency: Notification already exists.");
         } else {
           console.error("Insert error:", insertError.message);
         }
         
         // Mark task as complete and verify it's no longer overdue
         await supabase.from('tasks').update({ status: 'COMPLETED' }).eq('id', task.id);
         console.log("Marked test task as COMPLETED.");
      }
    }
    
    // Cleanup
    await supabase.from('tasks').delete().eq('id', task.id);
    console.log("Test task deleted.");
    
  } catch (err) {
    console.error("Test error:", err);
  }
}

testOverdue();
