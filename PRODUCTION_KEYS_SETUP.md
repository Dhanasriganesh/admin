# 🔑 Add Your Razorpay Production Keys

## ✅ Code is Ready for Production!

The system has been updated to work with your **KYC-verified Razorpay account**. Just add your keys and you're good to go!

---

## 📍 Where to Add Your Keys

### File Location:
```
h:\admin-main\admin\.env.local
```

### What to Add:

Open `.env.local` and add these two lines:

```env
# Razorpay Production Keys (from your KYC account)
RAZORPAY_KEY_ID=rzp_live_your_key_id_here
RAZORPAY_KEY_SECRET=your_secret_key_here
```

---

## 🔍 How to Get Your Keys

1. **Login to Razorpay:**
   - Go to: https://dashboard.razorpay.com/
   - Login with your KYC-verified account

2. **Navigate to API Keys:**
   - Click **Settings** (gear icon in left sidebar)
   - Click **API Keys**

3. **Generate/View Live Keys:**
   - Click **"Generate Live Keys"** (if first time)
   - OR **"Regenerate Live Keys"** (if already generated)
   - You'll see:
     - **Key ID** (starts with `rzp_live_`)
     - **Key Secret** (click "Show" to reveal)

4. **Copy Both Keys:**
   - Copy the Key ID
   - Click "Show" next to Key Secret and copy it
   - ⚠️ The secret is shown only once!

---

## 📝 Example Configuration

Your `.env.local` file should look like this:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_DB_URL=postgresql://postgres...

# Gmail (already configured)
GMAIL_USER=groupartihcus@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# Razorpay - ADD THESE TWO LINES 👇
RAZORPAY_KEY_ID=rzp_live_AbCdEf1234567890
RAZORPAY_KEY_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890

# Application URL (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔄 After Adding Keys

### 1. Restart Server

Stop your dev server and restart:
```bash
npm run dev
```

### 2. Verify Configuration

Run this command:
```bash
npm run check-payment
```

Expected output:
```
✅ RAZORPAY_KEY_ID: Configured (Live Mode)
✅ RAZORPAY_KEY_SECRET: Configured
✅ GMAIL_USER: Configured
✅ GMAIL_APP_PASSWORD: Configured
```

### 3. Test with Real Payment

1. Login as employee
2. Go to Leads → Select a lead
3. Assign itinerary
4. Click "Generate and Send Payment Link"
5. Check customer email
6. Complete payment (use real card/UPI)
7. ✅ Booking status → "Confirmed"
8. ✅ Lead shows green badge

---

## 🎯 Key Differences: Test vs Live

| Aspect | Test Mode | Live Mode (Your Keys) |
|--------|-----------|----------------------|
| Key Format | `rzp_test_...` | `rzp_live_...` |
| Real Money | ❌ No | ✅ Yes |
| Test Cards | ✅ Works | ❌ Won't work |
| Real Cards/UPI | ❌ Won't work | ✅ Works |
| Settlement | ❌ No | ✅ To your bank |
| KYC Required | ❌ No | ✅ Yes (you have it!) |

Since you have KYC approval, use **LIVE keys** for real payments!

---

## 🔒 Security

- ✅ `.env.local` is already in `.gitignore` (won't be committed)
- ✅ Keys are never exposed to frontend
- ✅ Keys are used only on server-side
- ❌ Never share keys in screenshots/chat
- ❌ Never commit keys to Git

---

## ✨ You're All Set!

After adding your keys:
- Real payments will work immediately
- Money goes to your Razorpay account
- Automatic settlement to your bank
- Full payment tracking & confirmations

Just add the 2 keys to `.env.local` and restart! 🚀




