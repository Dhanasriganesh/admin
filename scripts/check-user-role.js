// Check user role in Supabase Auth
// Usage: node scripts/check-user-role.js

const path = require('path')
try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })
} catch (_) {}

const { createClient } = require('@supabase/supabase-js')

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    console.log('Checking user role for harshavardhanpenthala@gmail.com...')
    
    // Get the user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Failed to get users:', userError.message)
      return
    }
    
    const user = userData.users.find(u => u.email === 'harshavardhanpenthala@gmail.com')
    if (!user) {
      console.error('User not found: harshavardhanpenthala@gmail.com')
      return
    }
    
    console.log('User found:')
    console.log('- ID:', user.id)
    console.log('- Email:', user.email)
    console.log('- User Metadata:', user.user_metadata)
    console.log('- Role in metadata:', user.user_metadata?.role)
    
    // Update the user metadata to ensure role is 'employee'
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        user_metadata: {
          ...user.user_metadata,
          role: 'employee',
          name: 'harsha'
        }
      }
    )
    
    if (error) {
      console.error('Failed to update user metadata:', error.message)
      return
    }
    
    console.log('✅ User metadata updated successfully!')
    console.log('Role set to: employee')
    
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}

main()
