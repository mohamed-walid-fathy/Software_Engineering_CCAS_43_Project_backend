# Environment Setup Checklist

## ✅ Required Environment Variables

Create a `.env` file in the root directory with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📋 Setup Checklist

### 1. Supabase Project Setup
- [ ] Create Supabase project at https://supabase.com
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL` from Project Settings → API
- [ ] Copy `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (anon/public key)
- [ ] Copy `SUPABASE_SERVICE_ROLE_KEY` (service_role key - keep secret!)

### 2. Database Tables
Create these tables in Supabase SQL Editor:

- [ ] `donor` table
- [ ] `charities` table
- [ ] `campaigns` table
- [ ] `donations` table
- [ ] `notifications` table
- [ ] `admin_actions` table
- [ ] `flagged_campaigns` table
- [ ] `admins` table (optional)

See `DATABASE_SCHEMA.md` for table structures.

### 3. Database Indexes
- [ ] Create indexes on `campaigns` (charity_id, status, category)
- [ ] Create indexes on `donations` (campaign_id, donor_id, status)
- [ ] Create indexes on `notifications` (user_id, is_read)
- [ ] Create indexes on `flagged_campaigns` (status)

### 4. Row Level Security (RLS)
- [ ] Enable RLS on all tables
- [ ] Set up policies for donors (own data only)
- [ ] Set up policies for charities (own campaigns/donations)
- [ ] Set up policies for admins (full access)
- [ ] Set up public read access for active campaigns

### 5. Storage Bucket
- [ ] Create storage bucket named `uploads`
- [ ] Set bucket policies (public for images, private for documents)
- [ ] Configure CORS if needed

### 6. Authentication
- [ ] Enable Email authentication in Supabase Auth
- [ ] Configure email templates (optional)
- [ ] Set up password reset flow

### 7. Testing
- [ ] Test server health: `GET http://localhost:5000/health`
- [ ] Test registration: `POST /api/auth/register`
- [ ] Test login: `POST /api/auth/login`
- [ ] Test donation creation: `POST /api/donations`
- [ ] Test get donation by ID: `GET /api/donations/:id`

## 🔍 Verify Your Setup

1. **Check .env file exists:**
```bash
# Windows PowerShell
Test-Path .env

# Should return: True
```

2. **Verify environment variables are loaded:**
Add this to `server.js` temporarily:
```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? '✅ Loaded' : '❌ Missing');
```

3. **Test Supabase connection:**
The server will throw an error on startup if Supabase credentials are missing.

## 🚨 Common Issues

### Issue: "Missing Supabase environment variables"
**Solution:** Check your `.env` file has all required variables with correct names.

### Issue: "Cannot connect to Supabase"
**Solution:** 
- Verify your Supabase URL is correct
- Check your API keys are valid
- Ensure your Supabase project is active

### Issue: "Table does not exist"
**Solution:** Create the required tables in Supabase SQL Editor (see `DATABASE_SCHEMA.md`).

### Issue: "Permission denied"
**Solution:** Set up Row Level Security policies in Supabase.

## 📝 Next Steps After Setup

1. Create your first user (donor or charity)
2. Create a campaign (if charity)
3. Make a test donation
4. Test all endpoints with your frontend

