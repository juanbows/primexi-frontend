require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function preview() {
    const { data, error } = await supabase.from('elements').select('web_name, team_id, now_cost').limit(5);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.table(data);
    }
}
preview();
