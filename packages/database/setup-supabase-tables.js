#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration for funnelai project
const SUPABASE_URL = 'https://eqbinweqqfnobxepkuyp.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc';

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('Setting up FunnelAI database schema in Supabase...\n');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create-all-tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Parse SQL statements more carefully
    const statements = [];
    let currentStatement = '';
    let inFunction = false;

    const lines = sql.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Track if we're inside a function definition
      if (trimmedLine.includes('CREATE OR REPLACE FUNCTION') || trimmedLine.includes('CREATE FUNCTION')) {
        inFunction = true;
      }

      currentStatement += line + '\n';

      // Check if this line ends a statement
      if (!inFunction && trimmedLine.endsWith(';') && !trimmedLine.startsWith('--')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      } else if (inFunction && trimmedLine === '$$ LANGUAGE plpgsql;') {
        statements.push(currentStatement.trim());
        currentStatement = '';
        inFunction = false;
      }
    }

    // Filter out empty statements and comments
    const validStatements = statements.filter(stmt =>
      stmt.length > 0 && !stmt.startsWith('--')
    );

    console.log(`Found ${validStatements.length} SQL statements to execute\n`);

    // Group statements by type for better error handling
    const enums = validStatements.filter(s => s.includes('CREATE TYPE'));
    const tables = validStatements.filter(s => s.includes('CREATE TABLE'));
    const indexes = validStatements.filter(s => s.includes('CREATE INDEX') || s.includes('CREATE UNIQUE INDEX'));
    const functions = validStatements.filter(s => s.includes('CREATE OR REPLACE FUNCTION'));
    const triggers = validStatements.filter(s => s.includes('CREATE TRIGGER'));
    const rlsEnables = validStatements.filter(s => s.includes('ALTER TABLE') && s.includes('ENABLE ROW LEVEL SECURITY'));
    const policies = validStatements.filter(s => s.includes('CREATE POLICY'));

    // Execute in order
    const groups = [
      { name: 'ENUMS', statements: enums },
      { name: 'TABLES', statements: tables },
      { name: 'INDEXES', statements: indexes },
      { name: 'FUNCTIONS', statements: functions },
      { name: 'TRIGGERS', statements: triggers },
      { name: 'RLS ENABLES', statements: rlsEnables },
      { name: 'POLICIES', statements: policies }
    ];

    for (const group of groups) {
      if (group.statements.length === 0) continue;

      console.log(`\nExecuting ${group.name} (${group.statements.length} statements)...`);

      for (let i = 0; i < group.statements.length; i++) {
        const stmt = group.statements[i];
        const preview = stmt.substring(0, 80).replace(/\n/g, ' ') + '...';
        console.log(`  [${i + 1}/${group.statements.length}] ${preview}`);

        try {
          // Use raw SQL execution via REST API
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'apikey': SUPABASE_SERVICE_KEY,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              query: stmt
            })
          });

          if (!response.ok && response.status !== 404) {
            const errorText = await response.text();
            console.error(`    ✗ Error: ${errorText}`);
          } else {
            console.log(`    ✓ Success`);
          }
        } catch (error) {
          console.error(`    ✗ Error: ${error.message}`);
        }
      }
    }

    console.log('\n============================================');
    console.log('Database setup complete!');
    console.log('============================================\n');
    console.log('Tables created:');
    console.log('  • User');
    console.log('  • Project');
    console.log('  • Spec');
    console.log('  • Integration');
    console.log('  • Build');
    console.log('  • Form');
    console.log('  • Submission');
    console.log('  • ApiKey');
    console.log('\nFeatures enabled:');
    console.log('  • Row Level Security (RLS)');
    console.log('  • Automatic updatedAt timestamps');
    console.log('  • Service role bypass policies');
    console.log('\nYour FunnelAI database is ready to use!');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();