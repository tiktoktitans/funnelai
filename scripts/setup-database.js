const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey || !databaseUrl) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or DATABASE_URL in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Use the pooled database URL for better connectivity
const pgClient = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  console.log('Setting up FunnelAI database tables...');

  try {
    // Connect to PostgreSQL
    await pgClient.connect();
    console.log('Connected to PostgreSQL database');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'packages', 'database', 'create-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Loaded SQL script from:', sqlFilePath);
    console.log('Executing complete SQL script...');

    // Execute the entire SQL script
    await pgClient.query(sqlContent);

    // Verify tables were created by checking one of them
    const result = await pgClient.query('SELECT COUNT(*) FROM "User"');
    console.log(`✅ User table exists with ${result.rows[0].count} records`);

    console.log('✅ Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error.message);

    // Try to check if tables exist using supabase client
    try {
      console.log('Checking if tables already exist...');
      const { data, error: checkError } = await supabase
        .from('User')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        console.log('❌ Tables do not exist. Please create them manually in Supabase dashboard.');
        console.log('📋 Copy the SQL from /root/funnelai/packages/database/create-tables.sql');
        process.exit(1);
      } else if (checkError) {
        console.log('⚠️  Connection error:', checkError.message);
        process.exit(1);
      } else {
        console.log('✅ Tables appear to exist already!');
      }
    } catch (connectionError) {
      console.error('❌ Failed to connect to database:', connectionError.message);
      process.exit(1);
    }
  } finally {
    // Close the PostgreSQL connection
    try {
      await pgClient.end();
      console.log('Database connection closed');
    } catch (closeError) {
      console.warn('Warning closing database connection:', closeError.message);
    }
  }
}

setupDatabase().catch(console.error);