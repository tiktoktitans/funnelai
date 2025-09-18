const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use the correct Supabase credentials
const supabaseUrl = 'https://eqbinweqqfnobxepkuyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('Creating FunnelAI database tables...');

  // Read the SQL file
  const sqlPath = path.join(__dirname, '..', 'packages', 'database', 'create-tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split SQL into individual statements and execute
  const statements = sql.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (!statement.trim()) continue;

    try {
      // Use Supabase's rpc method to execute raw SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      });

      if (error) {
        // Try alternative approach - direct query
        console.log('Trying direct query approach...');
        // Note: Supabase doesn't have direct SQL execution via JS client
        // We'll need to use the SQL editor in the dashboard
        console.log('Statement needs to be run in Supabase SQL Editor');
      }
    } catch (err) {
      console.log('Statement requires manual execution');
    }
  }

  // Since direct SQL execution isn't available, let's create tables using Supabase client
  console.log('\nTo complete setup, please:');
  console.log('1. Go to: https://supabase.com/dashboard/project/eqbinweqqfnobxepkuyp/editor');
  console.log('2. Click "New Query"');
  console.log('3. Copy and paste the SQL from: /root/funnelai/packages/database/create-tables.sql');
  console.log('4. Click "Run"\n');

  // Output the SQL for easy copying
  console.log('Here is the SQL to copy:\n');
  console.log('=' .repeat(60));
  console.log(sql);
  console.log('=' .repeat(60));
}

createTables().catch(console.error);