const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eqbinweqqfnobxepkuyp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function executeSql() {
  console.log('Creating FunnelAI database tables...\n');

  const tables = [
    {
      name: 'User',
      sql: `CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`
    },
    {
      name: 'Project',
      sql: `CREATE TABLE IF NOT EXISTS "Project" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'DRAFT' NOT NULL CHECK (status IN ('DRAFT', 'GENERATING', 'BUILDING', 'LIVE', 'ERROR')),
        "brandColors" JSONB DEFAULT '{}' NOT NULL,
        "deployUrl" TEXT,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE RESTRICT ON UPDATE CASCADE
      )`
    },
    {
      name: 'Spec',
      sql: `CREATE TABLE IF NOT EXISTS "Spec" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "projectId" TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('LANDING', 'VSL', 'WEBINAR', 'EMAILS', 'THANKYOU', 'APPLICATION')),
        input JSONB DEFAULT '{}' NOT NULL,
        content JSONB DEFAULT '{}' NOT NULL,
        structure JSONB DEFAULT '{}' NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "Spec_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE("projectId", type)
      )`
    },
    {
      name: 'Build',
      sql: `CREATE TABLE IF NOT EXISTS "Build" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "projectId" TEXT NOT NULL,
        version TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'BUILDING', 'SUCCESS', 'FAILED')),
        "deployUrl" TEXT,
        metadata JSONB DEFAULT '{}' NOT NULL,
        "startedAt" TIMESTAMP(3),
        "completedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "Build_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE ON UPDATE CASCADE
      )`
    },
    {
      name: 'Form',
      sql: `CREATE TABLE IF NOT EXISTS "Form" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "projectId" TEXT NOT NULL,
        name TEXT NOT NULL,
        kind TEXT NOT NULL CHECK (kind IN ('OPTIN', 'APPLICATION', 'CONTACT')),
        destination JSONB DEFAULT '{}' NOT NULL,
        fields JSONB DEFAULT '[]' NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "Form_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE ON UPDATE CASCADE
      )`
    },
    {
      name: 'Submission',
      sql: `CREATE TABLE IF NOT EXISTS "Submission" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "formId" TEXT NOT NULL,
        "projectId" TEXT NOT NULL,
        data JSONB DEFAULT '{}' NOT NULL,
        source TEXT,
        ip TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "Submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Submission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE ON UPDATE CASCADE
      )`
    }
  ];

  // Execute each table creation
  for (const table of tables) {
    console.log(`Creating table: ${table.name}...`);

    // Try to execute SQL - Supabase client doesn't support direct SQL execution
    // We need to use the SQL editor in the dashboard
    try {
      const { data, error } = await supabase.rpc('query', {
        query_text: table.sql
      });

      if (error) {
        console.log(`Note: Direct SQL execution not available via client. Table ${table.name} needs manual creation.`);
      } else {
        console.log(`✓ Table ${table.name} created successfully`);
      }
    } catch (err) {
      // Expected - direct SQL execution is not available through the client
      console.log(`Note: Table ${table.name} needs to be created in SQL Editor`);
    }
  }

  // Insert demo user
  console.log('\nInserting demo user...');
  const { data: user, error: userError } = await supabase
    .from('User')
    .upsert({
      email: 'demo@funnelai.com',
      name: 'Demo User'
    }, {
      onConflict: 'email',
      ignoreDuplicates: true
    })
    .select()
    .single();

  if (userError) {
    console.log('Demo user might need manual insertion:', userError.message);
  } else {
    console.log('✓ Demo user created/exists');
  }

  // Verify tables exist
  console.log('\nVerifying tables...');
  const tablesToCheck = ['User', 'Project', 'Spec', 'Build', 'Form', 'Submission'];

  for (const tableName of tablesToCheck) {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`✗ Table ${tableName}: NOT FOUND`);
    } else {
      console.log(`✓ Table ${tableName}: EXISTS`);
    }
  }
}

executeSql().catch(console.error);