// Check Razorpay setup
// Usage: node scripts/check-razorpay-setup.js

const path = require('path')
try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })
} catch (_) {}

console.log('\n🔍 Checking Razorpay Configuration...\n')

const checks = {
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  gmailUser: process.env.GMAIL_USER,
  gmailPassword: process.env.GMAIL_APP_PASSWORD,
  appUrl: process.env.NEXT_PUBLIC_APP_URL
}

let allGood = true

// Check Razorpay Key ID
if (checks.razorpayKeyId) {
  if (checks.razorpayKeyId.startsWith('rzp_test_')) {
    console.log('✅ RAZORPAY_KEY_ID: Configured (Test Mode)')
  } else if (checks.razorpayKeyId.startsWith('rzp_live_')) {
    console.log('✅ RAZORPAY_KEY_ID: Configured (Live Mode)')
  } else {
    console.log('⚠️  RAZORPAY_KEY_ID: Invalid format (should start with rzp_test_ or rzp_live_)')
    allGood = false
  }
} else {
  console.log('❌ RAZORPAY_KEY_ID: Not configured')
  allGood = false
}

// Check Razorpay Key Secret
if (checks.razorpayKeySecret) {
  console.log('✅ RAZORPAY_KEY_SECRET: Configured')
} else {
  console.log('❌ RAZORPAY_KEY_SECRET: Not configured')
  allGood = false
}

// Check Gmail User
if (checks.gmailUser) {
  console.log('✅ GMAIL_USER: Configured (' + checks.gmailUser + ')')
} else {
  console.log('⚠️  GMAIL_USER: Not configured (emails won\'t send)')
}

// Check Gmail App Password
if (checks.gmailPassword) {
  console.log('✅ GMAIL_APP_PASSWORD: Configured')
} else {
  console.log('⚠️  GMAIL_APP_PASSWORD: Not configured (emails won\'t send)')
}

// Check App URL
if (checks.appUrl) {
  console.log('✅ NEXT_PUBLIC_APP_URL: Configured (' + checks.appUrl + ')')
} else {
  console.log('⚠️  NEXT_PUBLIC_APP_URL: Not configured (using default)')
}

console.log('\n' + '='.repeat(60))

if (allGood) {
  console.log('\n🎉 All Razorpay settings configured correctly!')
  console.log('\nYou can now:')
  console.log('1. Generate real payment links')
  console.log('2. Send payment emails to customers')
  console.log('3. Process payments through Razorpay')
  if (checks.razorpayKeyId && checks.razorpayKeyId.startsWith('rzp_test_')) {
    console.log('\n💡 Tip: You\'re in TEST MODE. Use these test cards:')
    console.log('   Card: 4111 1111 1111 1111')
    console.log('   CVV: 123')
    console.log('   Expiry: Any future date')
  }
} else {
  console.log('\n⚠️  Razorpay keys missing!')
  console.log('\nThe system will run in DEMO MODE:')
  console.log('✅ Bookings will be created')
  console.log('✅ Emails will be sent')
  console.log('❌ Payment links won\'t work')
  console.log('\n📝 To fix:')
  console.log('1. Sign up at https://razorpay.com/')
  console.log('2. Get test keys from Dashboard > Settings > API Keys')
  console.log('3. Add to .env.local:')
  console.log('   RAZORPAY_KEY_ID=rzp_test_your_key')
  console.log('   RAZORPAY_KEY_SECRET=your_secret')
  console.log('4. Restart dev server: npm run dev')
}

console.log('\n' + '='.repeat(60) + '\n')







