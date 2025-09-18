#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Supabase configuration for funnelai project
const SUPABASE_PROJECT_ID = 'eqbinweqqfnobxepkuyp';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc';

async function executeSQL() {
  console.log('🚀 Creating FunnelAI database tables in Supabase...\n');
  console.log('📝 Note: Since direct SQL execution via API is limited,');
  console.log('   we\'ll output the SQL for you to run in the Supabase Dashboard.\n');

  const sqlPath = path.join(__dirname, 'create-all-tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('=' .repeat(70));
  console.log('COPY AND PASTE THE FOLLOWING SQL INTO SUPABASE DASHBOARD:');
  console.log('=' .repeat(70));
  console.log('\n📍 Go to: https://app.supabase.com/project/' + SUPABASE_PROJECT_ID + '/sql/new\n');
  console.log('=' .repeat(70));
  console.log('\n' + sql + '\n');
  console.log('=' .repeat(70));

  console.log('\n📋 Steps:');
  console.log('1. Copy the SQL above');
  console.log('2. Go to: https://app.supabase.com/project/' + SUPABASE_PROJECT_ID + '/sql/new');
  console.log('3. Paste the SQL');
  console.log('4. Click "Run" or press Cmd/Ctrl + Enter');
  console.log('\n✅ This will create all tables, indexes, and RLS policies!');

  // Also save to a file for convenience
  const outputPath = path.join(__dirname, 'ready-to-execute.sql');
  fs.writeFileSync(outputPath, sql);
  console.log('\n💾 SQL also saved to: ' + outputPath);

  // Try to open in browser
  const openCommand = process.platform === 'darwin' ? 'open' :
                     process.platform === 'win32' ? 'start' : 'xdg-open';

  const dashboardUrl = `https://app.supabase.com/project/${SUPABASE_PROJECT_ID}/sql/new`;

  require('child_process').exec(`${openCommand} "${dashboardUrl}"`, (err) => {
    if (!err) {
      console.log('\n🌐 Opened Supabase Dashboard in your browser!');
    }
  });
}

executeSQL().catch(console.error);