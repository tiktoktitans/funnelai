const fs = require('fs');
const path = require('path');

const sqlFilePath = path.join(__dirname, '..', 'packages', 'database', 'create-tables.sql');

console.log('='.repeat(80));
console.log('FunnelAI Database Setup SQL');
console.log('Copy the SQL below and paste it into your Supabase SQL Editor');
console.log('='.repeat(80));
console.log('');

try {
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(sqlContent);
  console.log('');
  console.log('='.repeat(80));
  console.log('✅ Copy the above SQL and run it in Supabase dashboard');
  console.log('🌐 Supabase URL: https://eqbinweqqfnobxepkuyp.supabase.co');
  console.log('📝 Go to: SQL Editor > New Query > Paste SQL > Run');
  console.log('='.repeat(80));
} catch (error) {
  console.error('❌ Error reading SQL file:', error.message);
  console.log('📄 Please check: /root/funnelai/packages/database/create-tables.sql');
}