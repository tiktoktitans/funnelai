# 📊 FunnelAI Supabase Database Setup

## Quick Setup Options

### Option 1: Manual Setup via Supabase Dashboard (Recommended)

1. **Go to SQL Editor**
   - Navigate to: https://app.supabase.com/project/eqbinweqqfnobxepkuyp/sql
   - Or go to your Supabase Dashboard → SQL Editor

2. **Execute the SQL**
   - Copy the entire contents of `packages/database/create-all-tables.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press `Cmd/Ctrl + Enter`

3. **Verify Tables Created**
   - Go to Table Editor in Supabase Dashboard
   - You should see these tables:
     - User
     - Project
     - Spec
     - Integration
     - Build
     - Form
     - Submission
     - ApiKey

### Option 2: Using Provided Scripts

```bash
# Navigate to database directory
cd packages/database

# Option A: Using bash script (requires curl)
chmod +x create-tables-via-api.sh
./create-tables-via-api.sh

# Option B: Using Node.js script
node setup-supabase-tables.js
```

### Option 3: Using Prisma Migrate

```bash
# Set environment variables
export DATABASE_URL="postgresql://postgres.eqbinweqqfnobxepkuyp:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc@db.eqbinweqqfnobxepkuyp.supabase.co:5432/postgres"

# Run Prisma migration
cd packages/database
npx prisma migrate deploy
```

## Database Schema Overview

### Tables

1. **User** - Stores user accounts
   - `id` (UUID, primary key)
   - `email` (unique)
   - `name`, `avatarUrl`
   - `createdAt`, `updatedAt`

2. **Project** - Marketing funnel projects
   - `id` (UUID, primary key)
   - `userId` (foreign key to User)
   - `name`, `slug` (unique)
   - `templateKey`, `templateVersion`
   - `status` (DRAFT, BUILDING, DEPLOYED, FAILED)
   - `repoUrl`, `vercelUrl`
   - `brandColors` (JSON)

3. **Spec** - AI-generated content specifications
   - `id` (UUID, primary key)
   - `projectId` (foreign key)
   - `type` (LANDING, WEBINAR, VSL, etc.)
   - `input`, `content`, `structure` (JSON)

4. **Integration** - Third-party service configs
   - `id` (UUID, primary key)
   - `projectId` (foreign key)
   - `provider` (CALENDLY, RESEND, etc.)
   - `config` (JSON)

5. **Build** - Deployment build records
   - `id` (UUID, primary key)
   - `projectId` (foreign key)
   - `status` (QUEUED, RUNNING, SUCCESS, etc.)
   - `commitSha`, `vercelDeployUrl`
   - `logs`, `error`

6. **Form** - Form configurations
   - `id` (UUID, primary key)
   - `projectId` (foreign key)
   - `kind` (OPTIN, APPLICATION, etc.)
   - `schema` (JSON)

7. **Submission** - Form submission data
   - `id` (UUID, primary key)
   - `formId`, `projectId` (foreign keys)
   - `data` (JSON)
   - `source`, `ip`, `userAgent`

8. **ApiKey** - API access keys
   - `id` (UUID, primary key)
   - `name`, `key` (unique)
   - `lastUsedAt`, `expiresAt`

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Service role has bypass permissions

### Policies Applied
- **User-based access**: Users can only CRUD their own projects and related data
- **Service role bypass**: Backend operations using service role key bypass RLS
- **Cascading deletes**: Deleting a project removes all related data

### Automatic Timestamps
- `updatedAt` fields automatically update on record changes via triggers

## Environment Variables

Add these to your `.env.local`:

```env
# Supabase Configuration
DATABASE_URL=postgresql://postgres.eqbinweqqfnobxepkuyp:[YOUR_PASSWORD]@db.eqbinweqqfnobxepkuyp.supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.eqbinweqqfnobxepkuyp:[YOUR_PASSWORD]@db.eqbinweqqfnobxepkuyp.supabase.co:5432/postgres

SUPABASE_URL=https://eqbinweqqfnobxepkuyp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNzQ4NjIsImV4cCI6MjA3MzY1MDg2Mn0.D3PajL8KnfZdZFwGsvCOtUVuIKPjkT7r4RKctRn3ZqA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc
```

## Testing the Setup

### 1. Verify Tables
```bash
# Using Prisma
cd packages/database
npx prisma db pull
npx prisma studio
```

### 2. Test Connection
```javascript
// Test script
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://eqbinweqqfnobxepkuyp.supabase.co',
  'YOUR_SERVICE_ROLE_KEY'
);

// Test query
const { data, error } = await supabase
  .from('Project')
  .select('*')
  .limit(1);

console.log(data || error);
```

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Check if database URL is correct
   - Verify service role key is valid
   - Ensure database is not paused in Supabase Dashboard

2. **Permission denied**
   - Make sure you're using the service role key for admin operations
   - Check RLS policies if using anon key

3. **Table already exists**
   - Drop existing tables first if re-running setup
   - Or skip table creation and just update policies

### Reset Database
If you need to start fresh:
```sql
-- Drop all tables (CAREFUL!)
DROP TABLE IF EXISTS "Submission" CASCADE;
DROP TABLE IF EXISTS "Form" CASCADE;
DROP TABLE IF EXISTS "Build" CASCADE;
DROP TABLE IF EXISTS "Integration" CASCADE;
DROP TABLE IF EXISTS "Spec" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "ApiKey" CASCADE;

-- Drop types
DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
DROP TYPE IF EXISTS "SpecType" CASCADE;
DROP TYPE IF EXISTS "IntegrationProvider" CASCADE;
DROP TYPE IF EXISTS "BuildStatus" CASCADE;
DROP TYPE IF EXISTS "FormKind" CASCADE;
```

## Support

- **Supabase Dashboard**: https://app.supabase.com/project/eqbinweqqfnobxepkuyp
- **Project Repository**: https://github.com/tiktoktitans/funnelai
- **SQL File**: `packages/database/create-all-tables.sql`

## Next Steps

After setting up the database:

1. ✅ Test database connection
2. ✅ Run the application locally
3. ✅ Create a test project
4. ✅ Verify data persistence

Your FunnelAI database is now ready! 🚀