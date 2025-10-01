# 🚀 Razorpay Setup - Quick Start

## ✅ System Updated for Production Keys

The code has been updated to work with your **KYC-verified production Razorpay account**. Follow the simple steps below to add your keys.

## ✅ Quick Setup (5 minutes)

### Option 1: Use Test Keys (Recommended for Testing)

1. **Get FREE Test Keys from Razorpay:**
   - Go to [https://razorpay.com/](https://razorpay.com/)
   - Sign up (no KYC needed for test mode)
   - Go to **Settings → API Keys → Generate Test Keys**
   - You'll get:
     - Test Key ID (starts with `rzp_test_`)
     - Test Key Secret

2. **Add to `.env.local` file:**
   
   Open `h:\admin-main\admin\.env.local` and add these lines:
   
   ```env
   # Add these lines to your .env.local file
   RAZORPAY_KEY_ID=rzp_test_your_key_here
   RAZORPAY_KEY_SECRET=your_test_secret_here
   ```
   
   **Example:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_AbCdEfGhIjKlMnOp
   RAZORPAY_KEY_SECRET=qRsTuVwXyZ1234567890
   ```

3. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

4. **Test with Razorpay Test Cards:**
   - Card Number: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date
   - OTP: `123456`

### Option 2: Use Live Keys (For Production)

1. **Complete KYC verification on Razorpay**
2. **Generate Live Keys** from Razorpay Dashboard
3. **Add to `.env.local`:**
   ```env
   RAZORPAY_KEY_ID=rzp_live_your_key_here
   RAZORPAY_KEY_SECRET=your_live_secret_here
   ```
4. **Restart server**

## 🔍 Verify Setup

After adding keys, test the flow:

1. Login as employee
2. Go to Leads section
3. Click on a lead
4. Assign an itinerary
5. Click "Generate and Send Payment Link"
6. You should see: "✅ Payment link generated and sent successfully!"

## 📧 Email Configuration

Make sure these are also in your `.env.local`:

```env
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ❌ Common Errors

### "Authentication failed"
→ Razorpay keys not configured. Add them to `.env.local`

### "Email failed to send"
→ Check Gmail credentials in `.env.local`

### "Invalid API key"
→ Make sure you're using test keys (rzp_test_) for development

## 📚 Full Documentation

See `PAYMENT_SETUP.md` for complete documentation.

## 🆘 Need Help?

The system will work in DEMO MODE without keys, but:
- Booking will be created ✅
- Email will be sent ✅
- Payment link will be a demo URL (not functional) ⚠️

For real payments, you MUST add Razorpay keys!

