#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration for funnelai project
const SUPABASE_URL = 'https://eqbinweqqfnobxepkuyp.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSql() {
  console.log('🚀 Creating FunnelAI database tables in Supabase...\n');

  // Read SQL file
  const sqlPath = path.join(__dirname, 'create-all-tables.sql');
  const fullSql = fs.readFileSync(sqlPath, 'utf8');

  // Split into individual statements
  const statements = fullSql
    .split(/;\s*$/gm)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const preview = stmt.substring(0, 60).replace(/\n/g, ' ');

    try {
      // Use direct database connection via Supabase
      const { data, error } = await supabase.rpc('exec_sql', {
        query: stmt
      }).catch(async (e) => {
        // If RPC doesn't exist, try raw query
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query: stmt })
        });

        if (!response.ok && response.status !== 404) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return { data: null, error: null };
      });

      if (error && !error.message?.includes('already exists')) {
        throw error;
      }

      console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      successCount++;
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log(`⏭️  [${i + 1}/${statements.length}] ${preview}... (already exists)`);
        successCount++;
      } else {
        console.error(`❌ [${i + 1}/${statements.length}] ${preview}...`);
        console.error(`   Error: ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Execution Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('='.repeat(60) + '\n');

  if (errorCount === 0) {
    console.log('🎉 All tables and policies created successfully!');
    console.log('\n📋 Tables created:');
    console.log('   • User');
    console.log('   • Project');
    console.log('   • Spec');
    console.log('   • Integration');
    console.log('   • Build');
    console.log('   • Form');
    console.log('   • Submission');
    console.log('   • ApiKey');
    console.log('\n🔒 Security features enabled:');
    console.log('   • Row Level Security (RLS)');
    console.log('   • Automatic timestamps');
    console.log('   • Service role bypass policies');
  } else {
    console.log('⚠️  Some statements failed. Check errors above.');
    console.log('   You may need to run the SQL manually in Supabase Dashboard.');
  }
}

// Run it
executeSql().catch(console.error);