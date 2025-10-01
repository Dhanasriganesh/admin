// Create admin user in Supabase Auth and employees table
// Usage: node scripts/create-admin-user.js

const path = require('path')
try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })
} catch (_) {}

const { Client } = require('pg')
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const databaseUrl = process.env.SUPABASE_DB_URL
  
  if (!supabaseUrl || !supabaseServiceKey || !databaseUrl) {
    console.error('Missing required environment variables')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  
  try {
    console.log('Creating admin user: travloger.tech@gmail.com')
    
    await client.connect()
    
    // Check if user already exists in Supabase Auth
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Failed to list users:', listError.message)
      return
    }
    
    const existingUser = existingUsers.users.find(u => u.email === 'travloger.tech@gmail.com')
    
    let authUserId
    
    if (existingUser) {
      console.log('User already exists in Supabase Auth, updating...')
      authUserId = existingUser.id
      
      // Update user metadata to ensure admin role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authUserId,
        { 
          user_metadata: {
            ...existingUser.user_metadata,
            name: 'Travloger Admin',
            role: 'admin'
          }
        }
      )
      
      if (updateError) {
        console.error('Failed to update user metadata:', updateError.message)
        return
      }
      
      console.log('✅ User metadata updated to admin role')
      
    } else {
      // Create new user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'travloger.tech@gmail.com',
        password: 'Travloger@12',
        email_confirm: true,
        user_metadata: {
          name: 'Travloger Admin',
          role: 'admin'
        }
      })
      
      if (authError) {
        console.error('Failed to create auth user:', authError.message)
        return
      }
      
      authUserId = authData.user.id
      console.log('✅ Created new user in Supabase Auth')
    }
    
    // Check if user exists in employees table
    const { rows: existingEmployee } = await client.query(
      'SELECT id FROM public.employees WHERE email = $1',
      ['travloger.tech@gmail.com']
    )
    
    if (existingEmployee.length > 0) {
      console.log('User already exists in employees table, updating...')
      
      // Update existing employee record
      await client.query(`
        UPDATE public.employees 
        SET 
          name = $1,
          role = $2,
          supabase_user_id = $3,
          is_first_login = $4
        WHERE email = $5
      `, [
        'Travloger Admin',
        'admin',
        authUserId,
        false, // Not first login since we're setting up
        'travloger.tech@gmail.com'
      ])
      
      console.log('✅ Updated employee record')
      
    } else {
      console.log('Creating new employee record...')
      
      // Create new employee record
      await client.query(`
        INSERT INTO public.employees (
          name, 
          email, 
          role, 
          supabase_user_id, 
          is_first_login,
          status,
          inserted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        'Travloger Admin',
        'travloger.tech@gmail.com',
        'admin',
        authUserId,
        false, // Not first login since we're setting up
        'Active'
      ])
      
      console.log('✅ Created new employee record')
    }
    
    console.log('🎉 Admin user setup completed successfully!')
    console.log('Email: travloger.tech@gmail.com')
    console.log('Password: Travloger@12')
    console.log('Role: admin')
    console.log('User can now login and access the Admin Dashboard')
    
  } catch (e) {
    console.error('Setup failed:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
