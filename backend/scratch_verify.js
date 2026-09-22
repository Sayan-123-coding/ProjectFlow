const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const http = require('http');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("=== Database Integration Tests ===");

  // 1. Get a test user
  const { data: users, error: err1 } = await supabase.from('profiles').select('*').limit(1);
  if (err1 || !users || users.length === 0) {
    console.error("Failed to fetch test user:", err1);
    return;
  }
  const testUser = users[0];
  console.log("Test user:", testUser.email);

  // 2. Fetch a project and task, or create a dummy task just for testing overdue
  const { data: tasks, error: err2 } = await supabase.from('tasks').select('*').limit(1);
  let testTask = tasks ? tasks[0] : null;
  if (!testTask) {
    console.log("No tasks found, unable to fully test idempotency without a task.");
  } else {
    console.log("Test task ID:", testTask.id);
  }

  // 3. Test Notification Table / RLS
  console.log("Testing Notification Table Insert (Service Policy)...");
  const dummyTaskId = testTask ? testTask.id : '00000000-0000-0000-0000-000000000000';
  
  // Try inserting a notification
  const { error: insErr1 } = await supabase.from('notifications').insert({
    recipient_id: testUser.id,
    type: 'TASK_ASSIGNED',
    title: 'Test',
    message: 'Test message',
    task_id: testTask ? testTask.id : null // task_id is FK, must be null or valid
  });
  
  if (insErr1) {
    console.error("Insert failed:", insErr1.message);
  } else {
    console.log("Insert succeeded.");
    
    // Test idempotency (should fail on duplicate type + recipient + task)
    if (testTask) {
      console.log("Testing Idempotency Constraint...");
      const { error: insErr2 } = await supabase.from('notifications').insert({
        recipient_id: testUser.id,
        type: 'TASK_ASSIGNED',
        title: 'Test 2',
        message: 'Test message 2',
        task_id: testTask.id
      });
      if (insErr2 && insErr2.code === '23505') {
        console.log("Idempotency working (duplicate rejected with 23505).");
      } else if (insErr2) {
        console.error("Unexpected error on duplicate:", insErr2.message);
      } else {
        console.error("ERROR: Idempotency failed! Duplicate allowed.");
      }
    }
  }

  // Cleanup the test notification
  if (testTask) {
    await supabase.from('notifications').delete().eq('recipient_id', testUser.id).eq('type', 'TASK_ASSIGNED');
  }

  console.log("Done.");
}

runTests();
