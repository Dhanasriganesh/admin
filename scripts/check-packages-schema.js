// Check packages table schema
// Usage: node scripts/check-packages-schema.js

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
    
    console.log('Checking packages table schema...')
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'packages' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `)
    
    console.log('Packages table columns:')
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    console.log('\nChecking sample packages data...')
    const { rows: packages } = await client.query(`
      SELECT id, name, destination, category, status
      FROM public.packages 
      LIMIT 5
    `)
    
    console.log('Sample packages:')
    packages.forEach(pkg => {
      console.log(`- ID: ${pkg.id}, Name: ${pkg.name}, Destination: ${pkg.destination}, Category: ${pkg.category}, Status: ${pkg.status}`)
    })
    
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
