// Check existing employees in database
// Usage: node scripts/check-employees.js

const path = require('path')
try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })
} catch (_) {}

const { Client } = require('pg')

async function main() {
  const databaseUrl = process.env.SUPABASE_DB_URL
  if (!databaseUrl) {
    console.error('Missing SUPABASE_DB_URL in environment (.env.local)')
    process.exit(1)
  }
  
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  
  try {
    console.log('Connecting to database...')
    await client.connect()
    
    console.log('Fetching all employees...')
    const { rows: employees } = await client.query(`
      SELECT id, name, email, role, supabase_user_id, status
      FROM public.employees 
      ORDER BY id
    `)
    
    console.log(`Found ${employees.length} employees:`)
    employees.forEach(emp => {
      console.log(`- ID: ${emp.id}, Email: ${emp.email}, Name: ${emp.name}, Role: ${emp.role}, Supabase ID: ${emp.supabase_user_id || 'NULL'}, Status: ${emp.status}`)
    })
    
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
