const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
// Using the anon key directly simulates an unauthenticated or generic client, but let's see if we can read profiles.
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', 'testuser89232@gmail.com');
  if (error) {
    console.error("Profiles error:", error.message);
  } else {
    console.log("Found profile (anon):", data);
  }
}

test();
