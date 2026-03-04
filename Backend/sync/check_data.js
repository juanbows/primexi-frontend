require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const teams = await supabase.from('teams').select('*', { count: 'exact', head: true });
    const elements = await supabase.from('elements').select('*', { count: 'exact', head: true });
    const events = await supabase.from('events').select('*', { count: 'exact', head: true });
    const fixtures = await supabase.from('fixtures').select('*', { count: 'exact', head: true });
    const history = await supabase.from('element_history').select('*', { count: 'exact', head: true });

    console.log('--- Stats ---');
    console.log('Teams:', teams.count);
    console.log('Elements:', elements.count);
    console.log('Events:', events.count);
    console.log('Fixtures:', fixtures.count);
    console.log('History:', history.count);
    console.log('--- Errors ---');
    if (teams.error) console.log('Teams Error:', teams.error.message);
    if (elements.error) console.log('Elements Error:', elements.error.message);
    if (events.error) console.log('Events Error:', events.error.message);
    if (fixtures.error) console.log('Fixtures Error:', fixtures.error.message);
}
check();
