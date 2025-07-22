# test_prod_db.rb - VRAIES infos Session Pooler
require 'pg'

begin
  puts "🔍 Testing Session Pooler with REAL credentials..."
  conn = PG.connect(
    host: 'aws-0-eu-west-3.pooler.supabase.com',  # ← Le vrai host !
    port: 5432,  # ← Port 5432, pas 6543 !
    dbname: 'postgres',
    user: 'postgres.oibhhuluobahlvkovtav',
    password: 'iBGu_848-xpBHzdkyhn-',
    sslmode: 'disable',
    gssencmode: 'disable'
  )
  
  result = conn.exec("SELECT version();")
  puts "✅ Session Pooler connection successful!"
  puts "PostgreSQL version: #{result[0]['version'][0..50]}..."
  conn.close
rescue => e
  puts "❌ Error: #{e.class} - #{e.message.force_encoding('UTF-8')}"
end