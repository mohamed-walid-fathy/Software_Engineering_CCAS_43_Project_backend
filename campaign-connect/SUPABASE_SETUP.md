# Supabase Setup Guide

This guide will help you connect your Next.js app to Supabase.

## 🚀 Quick Start

### Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 2: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on **Settings** → **API**
3. Copy:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

### Step 3: Create Environment Variables

Create `.env.local` in your `campaign-connect` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** 
- Never commit `.env.local` to git
- The service role key should NEVER be exposed to the client
- Add `.env.local` to your `.gitignore`

### Step 4: Database Schema

Based on your existing `donor` table, here's a suggested schema for the full application:

#### Tables Needed:

1. **donor** (you already have this!)
   ```sql
   CREATE TABLE donor (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR NOT NULL,
     email VARCHAR UNIQUE NOT NULL,
     password_hash VARCHAR NOT NULL,
     phone VARCHAR,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **charities**
   ```sql
   CREATE TABLE charities (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR NOT NULL,
     email VARCHAR UNIQUE NOT NULL,
     password_hash VARCHAR NOT NULL,
     phone VARCHAR,
     registration_number VARCHAR,
     is_verified BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **campaigns**
   ```sql
   CREATE TABLE campaigns (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title VARCHAR NOT NULL,
     description TEXT NOT NULL,
     image VARCHAR,
     goal_amount DECIMAL(10, 2) NOT NULL,
     current_amount DECIMAL(10, 2) DEFAULT 0,
     category VARCHAR NOT NULL,
     charity_id UUID REFERENCES charities(id),
     days_left INTEGER NOT NULL,
     is_urgent BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **donations**
   ```sql
   CREATE TABLE donations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     campaign_id UUID REFERENCES campaigns(id),
     donor_id UUID REFERENCES donor(id),
     amount DECIMAL(10, 2) NOT NULL,
     is_anonymous BOOLEAN DEFAULT FALSE,
     status VARCHAR DEFAULT 'pending', -- 'pending', 'completed', 'failed'
     payment_method VARCHAR,
     payment_id VARCHAR,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### Step 5: Enable Row Level Security (RLS)

For security, enable RLS on your tables:

```sql
-- Enable RLS
ALTER TABLE donor ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your needs)
-- Allow users to read their own data
CREATE POLICY "Users can view own donor data"
  ON donor FOR SELECT
  USING (auth.uid()::text = id::text);

-- Allow public to read campaigns
CREATE POLICY "Public can view campaigns"
  ON campaigns FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to create donations
CREATE POLICY "Authenticated users can create donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

### Step 6: Create Database Functions (Optional)

Create a function to increment campaign amount:

```sql
CREATE OR REPLACE FUNCTION increment_campaign_amount(
  campaign_id_param UUID,
  amount_param DECIMAL
)
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET current_amount = current_amount + amount_param
  WHERE id = campaign_id_param;
END;
$$ LANGUAGE plpgsql;
```

## 🔐 Authentication Setup

### Option 1: Use Supabase Auth (Recommended)

Supabase has built-in authentication. You can use it instead of custom auth:

1. **Enable Email Auth** in Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Email**

2. **Update Login API** to use Supabase Auth:
   The API route I created uses `signInWithPassword`, which works with Supabase Auth.

3. **Frontend Integration:**
   ```typescript
   import { supabase } from '@/lib/supabase';
   
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password123'
   });
   ```

### Option 2: Custom Auth with Your Donor Table

If you want to keep using your custom `donor` table with password hashes:

1. Use bcrypt to hash passwords when creating users
2. Use bcrypt to compare passwords on login
3. Generate JWT tokens manually or use Supabase Auth

## 📝 Using the API Routes

All API routes are now connected to Supabase! Here's how to use them:

### Fetch Campaigns:
```typescript
const response = await fetch('/api/campaigns');
const { campaigns } = await response.json();
```

### Create Campaign:
```typescript
const response = await fetch('/api/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Campaign',
    description: 'Campaign description',
    goal_amount: 10000,
    category: 'Health',
    charity_id: 'charity-uuid',
    days_left: 30,
  }),
});
```

### Create Donation:
```typescript
const response = await fetch('/api/donations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaign_id: 'campaign-uuid',
    donor_id: 'donor-uuid',
    amount: 100,
    is_anonymous: false,
  }),
});
```

## 🧪 Testing

1. **Test API Routes:**
   - Visit: `http://localhost:3000/api/campaigns`
   - Should return JSON data from Supabase

2. **Test in Frontend:**
   - Update your components to fetch from `/api/campaigns` instead of mock data

## 🔍 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure `.env.local` exists and has all required variables
   - Restart your dev server after adding env variables

2. **"Failed to fetch campaigns"**
   - Check your Supabase table names match (case-sensitive!)
   - Verify RLS policies allow the operation
   - Check Supabase dashboard for error logs

3. **CORS Errors**
   - Supabase handles CORS automatically
   - If issues persist, check your Supabase project settings

## 📚 Next Steps

1. ✅ Install `@supabase/supabase-js`
2. ✅ Add environment variables
3. ✅ Create database tables (if not already created)
4. ✅ Test API routes
5. ✅ Connect frontend components to API
6. ✅ Set up authentication
7. ✅ Add payment processing (Stripe integration)

## 🎯 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

Your API routes are ready! Just install the package and add your credentials. 🚀


