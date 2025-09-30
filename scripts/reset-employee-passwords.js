// Reset employee passwords to a known value
// Usage: node scripts/reset-employee-passwords.js

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
    console.log('Resetting employee passwords...')
    
    const employees = [
      'harshavardhanpenthala@gmail.com',
      'shashi.pentala@gmail.com', 
      'vardhans367@gmail.com'
    ]
    
    const newPassword = 'Employee123!'
    
    for (const email of employees) {
      try {
        console.log(`Resetting password for: ${email}`)
        
        // First get the user by email
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
        
        if (userError) {
          console.error(`Failed to get users:`, userError.message)
          continue
        }
        
        const user = userData.users.find(u => u.email === email)
        if (!user) {
          console.error(`User not found: ${email}`)
          continue
        }
        
        // Update the password
        const { data, error } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: newPassword }
        )
        
        if (error) {
          console.error(`Failed to reset password for ${email}:`, error.message)
          continue
        }
        
        console.log(`✅ Password reset for ${email}`)
        
      } catch (error) {
        console.error(`Error resetting ${email}:`, error.message)
      }
    }
    
    console.log('Password reset completed!')
    console.log(`New password for all employees: ${newPassword}`)
    
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}

main()
