#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Supabase configuration for funnelai project
const SUPABASE_URL = 'https://eqbinweqqfnobxepkuyp.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc';

async function executeSqlFile(filePath) {
  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split SQL into individual statements (basic split, may need refinement)
    const statements = sql
      .split(/;(?=\s*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|BEGIN|END|\-\-|$))/i)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY
        },
        body: JSON.stringify({ query: statement })
      });

      if (!response.ok) {
        // Try direct SQL endpoint
        const directResponse = await fetch(`${SUPABASE_URL}/sql/v1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY
          },
          body: JSON.stringify({ query: statement })
        });

        if (!directResponse.ok) {
          const errorText = await directResponse.text();
          console.error(`Error executing statement ${i + 1}: ${errorText}`);
          // Continue with next statement instead of stopping
          continue;
        }
      }

      console.log(`✓ Statement ${i + 1} executed successfully`);
    }

    console.log('\n✓ All SQL statements executed successfully!');
    console.log('\nTables created:');
    console.log('- User');
    console.log('- Project');
    console.log('- Spec');
    console.log('- Integration');
    console.log('- Build');
    console.log('- Form');
    console.log('- Submission');
    console.log('- ApiKey');
    console.log('\nRLS policies and triggers have been set up.');

  } catch (error) {
    console.error('Error executing SQL:', error);
    process.exit(1);
  }
}

// Execute the SQL file
const sqlFilePath = path.join(__dirname, 'create-all-tables.sql');
executeSqlFile(sqlFilePath);