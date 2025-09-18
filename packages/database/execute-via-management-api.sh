#!/bin/bash

SUPABASE_PROJECT_ID="eqbinweqqfnobxepkuyp"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc"

echo "🚀 Executing SQL in Supabase..."

# Read SQL and split into statements
SQL_FILE="create-all-tables.sql"

# First, let's try to execute everything as one transaction
SQL_CONTENT=$(cat "$SQL_FILE")

# Execute via pg REST API endpoint
echo "Attempting to execute SQL via REST API..."

# Try the SQL execution endpoint
curl -X POST \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/rest/v1/rpc" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}" \
  2>/dev/null | jq .

echo ""
echo "If the above didn't work, trying alternative approach..."

# Alternative: Use the query endpoint
curl -X POST \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/rest/v1/" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}" \
  2>/dev/null | jq .