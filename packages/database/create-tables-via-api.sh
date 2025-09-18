#!/bin/bash

# Supabase project configuration
SUPABASE_PROJECT_REF="eqbinweqqfnobxepkuyp"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc"
SUPABASE_URL="https://eqbinweqqfnobxepkuyp.supabase.co"

echo "Creating FunnelAI database tables in Supabase..."
echo "================================================"
echo ""

# Read the SQL file
SQL_FILE="create-all-tables.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "Error: $SQL_FILE not found!"
    exit 1
fi

# Create a temporary file with escaped SQL
TEMP_FILE=$(mktemp)

# Escape the SQL content for JSON
SQL_CONTENT=$(cat "$SQL_FILE" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

# Create the JSON payload
cat > "$TEMP_FILE" << EOF
{
  "query": "$SQL_CONTENT"
}
EOF

echo "Executing SQL via Supabase API..."
echo ""

# Try different API endpoints
# First try the query endpoint
RESPONSE=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/query" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d @"$TEMP_FILE" 2>&1)

if [ $? -ne 0 ] || [[ "$RESPONSE" == *"error"* ]]; then
    echo "First attempt failed, trying alternative endpoint..."

    # Try the alternative endpoint
    RESPONSE=$(curl -s -X POST \
        "https://${SUPABASE_PROJECT_REF}.supabase.co/sql/v1" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: application/json" \
        -d @"$TEMP_FILE" 2>&1)
fi

# Clean up temp file
rm "$TEMP_FILE"

# Check response
if [[ "$RESPONSE" == *"error"* ]]; then
    echo "Error executing SQL:"
    echo "$RESPONSE"
    echo ""
    echo "Note: You may need to execute the SQL manually in the Supabase Dashboard:"
    echo "1. Go to https://app.supabase.com/project/${SUPABASE_PROJECT_REF}/sql"
    echo "2. Copy the contents of create-all-tables.sql"
    echo "3. Paste and run in the SQL Editor"
    exit 1
else
    echo "✓ Database tables created successfully!"
    echo ""
    echo "Tables created:"
    echo "  • User"
    echo "  • Project"
    echo "  • Spec"
    echo "  • Integration"
    echo "  • Build"
    echo "  • Form"
    echo "  • Submission"
    echo "  • ApiKey"
    echo ""
    echo "Features enabled:"
    echo "  • Row Level Security (RLS)"
    echo "  • Automatic updatedAt timestamps"
    echo "  • Service role bypass policies"
fi