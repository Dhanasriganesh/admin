// Migration: add destination, password_hash, and is_first_login columns to employees table
// Usage: node scripts/migrate-employees-add-destination.js

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
    
    console.log('Adding missing columns to employees table...')
    
    // Add destination column
    await client.query(`
      ALTER TABLE public.employees 
      ADD COLUMN IF NOT EXISTS destination TEXT;
    `)
    console.log('✅ Added destination column')
    
    // Add password_hash column
    await client.query(`
      ALTER TABLE public.employees 
      ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `)
    console.log('✅ Added password_hash column')
    
    // Add is_first_login column
    await client.query(`
      ALTER TABLE public.employees 
      ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;
    `)
    console.log('✅ Added is_first_login column')
    
    // Update default role for existing records
    await client.query(`
      UPDATE public.employees 
      SET role = 'employee' 
      WHERE role = 'Agent' OR role IS NULL;
    `)
    console.log('✅ Updated existing roles to employee')
    
    console.log('Migration completed successfully! 🎉')
    
  } catch (e) {
    console.error('Migration failed:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
