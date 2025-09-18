const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabase() {
  console.log('🔍 Verifying FunnelAI database tables...\n');

  const tablesToCheck = ['User', 'Project', 'Spec', 'Build', 'Form', 'Submission'];
  const results = [];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          results.push({ table, status: '❌', message: 'Table does not exist' });
        } else {
          results.push({ table, status: '⚠️', message: `Error: ${error.message}` });
        }
      } else {
        results.push({ table, status: '✅', message: 'Table exists and accessible' });
      }
    } catch (err) {
      results.push({ table, status: '❌', message: `Connection error: ${err.message}` });
    }
  }

  // Display results
  console.log('Database Table Status:');
  console.log('=====================');

  let allGood = true;
  results.forEach(({ table, status, message }) => {
    console.log(`${status} ${table.padEnd(12)} - ${message}`);
    if (status !== '✅') allGood = false;
  });

  console.log('\n' + '='.repeat(50));

  if (allGood) {
    console.log('🎉 All database tables are properly set up!');
    console.log('✅ FunnelAI database is ready to use.');
  } else {
    console.log('❌ Some tables are missing or inaccessible.');
    console.log('📋 Please run the SQL script manually in Supabase dashboard.');
    console.log('📄 See: /root/funnelai/scripts/manual-database-setup.md');
  }

  // Check demo user
  try {
    const { data, error } = await supabase
      .from('User')
      .select('email, name')
      .eq('email', 'demo@funnelai.com')
      .single();

    if (data) {
      console.log(`\n👤 Demo user found: ${data.name} (${data.email})`);
    } else {
      console.log('\n⚠️  Demo user not found - this is expected if tables were just created');
    }
  } catch (err) {
    console.log('\n⚠️  Could not check for demo user');
  }
}

verifyDatabase().catch(console.error);