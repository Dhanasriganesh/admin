// Migration: Create Supabase Auth users for existing employees
// Usage: node scripts/migrate-existing-employees.js

const path = require('path')
try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })
} catch (_) {}

const { Client } = require('pg')
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const databaseUrl = process.env.SUPABASE_DB_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!databaseUrl || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    process.exit(1)
  }
  
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    console.log('Connecting to database...')
    await client.connect()
    
    console.log('Fetching existing employees...')
    const { rows: employees } = await client.query(`
      SELECT id, name, email, password_hash, role 
      FROM public.employees 
      WHERE supabase_user_id IS NULL
    `)
    
    console.log(`Found ${employees.length} employees to migrate`)
    
    for (const employee of employees) {
      try {
        console.log(`Migrating employee: ${employee.email}`)
        
        // Create Supabase Auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: employee.email,
          password: 'TempPassword123!', // Temporary password
          email_confirm: true,
          user_metadata: {
            name: employee.name,
            role: employee.role || 'employee'
          }
        })
        
        if (authError) {
          console.error(`Failed to create auth user for ${employee.email}:`, authError.message)
          continue
        }
        
        // Update employee record with Supabase user ID
        await client.query(`
          UPDATE public.employees 
          SET supabase_user_id = $1 
          WHERE id = $2
        `, [authData.user.id, employee.id])
        
        console.log(`✅ Migrated ${employee.email} (ID: ${employee.id})`)
        
      } catch (error) {
        console.error(`Error migrating ${employee.email}:`, error.message)
      }
    }
    
    console.log('Migration completed! 🎉')
    console.log('Note: All migrated employees have temporary password "TempPassword123!"')
    console.log('They should change their password on first login.')
    
  } catch (e) {
    console.error('Migration failed:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
