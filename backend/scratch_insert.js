const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('activities').insert({
    action: 'test_action',
    metadata: { test: true }
  }).select();
  
  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log("Insert success:", data);
  }
}

test();
