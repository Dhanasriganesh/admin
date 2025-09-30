// Reset specific employee password
// Usage: node scripts/reset-specific-employee.js

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
    console.log('Resetting password for harshavardhanpenthala@gmail.com...')
    
    const newPassword = 'Harsha@123'
    
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
    
    console.log('Found user:', user.id)
    
    // Update the password
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )
    
    if (error) {
      console.error('Failed to reset password:', error.message)
      return
    }
    
    console.log('✅ Password reset successfully!')
    console.log(`New password: ${newPassword}`)
    
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}

main()
