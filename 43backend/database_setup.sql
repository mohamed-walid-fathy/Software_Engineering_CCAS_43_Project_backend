-- Database Setup Script for 43 Backend
-- Run this in Supabase SQL Editor

-- 1. Create donor table
CREATE TABLE IF NOT EXISTS donor (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create charities table
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  registration_number VARCHAR,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR,
  goal_amount DECIMAL NOT NULL,
  current_amount DECIMAL DEFAULT 0,
  category VARCHAR NOT NULL,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  days_left INTEGER,
  is_urgent BOOLEAN DEFAULT FALSE,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES donor(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL CHECK (amount > 0),
  is_anonymous BOOLEAN DEFAULT FALSE,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR DEFAULT 'stripe',
  payment_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Create admin_actions table
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create flagged_campaigns table
CREATE TABLE IF NOT EXISTS flagged_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  flagged_by UUID NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  flagged_at TIMESTAMP DEFAULT NOW()
);

-- 8. Create admins table (optional)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_charity_id ON campaigns(charity_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);

CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_flagged_campaigns_status ON flagged_campaigns(status);

-- Enable Row Level Security
ALTER TABLE donor ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (adjust based on your needs)

-- Donors can read/update their own data
CREATE POLICY "Donors can view own data" ON donor
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Donors can update own data" ON donor
  FOR UPDATE USING (auth.uid() = id);

-- Charities can read/update their own data
CREATE POLICY "Charities can view own data" ON charities
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Charities can update own data" ON charities
  FOR UPDATE USING (auth.uid() = id);

-- Public can view active campaigns
CREATE POLICY "Public can view active campaigns" ON campaigns
  FOR SELECT USING (status = 'active');

-- Charities can manage their own campaigns
CREATE POLICY "Charities can manage own campaigns" ON campaigns
  FOR ALL USING (charity_id = auth.uid());

-- Donors can view their own donations
CREATE POLICY "Donors can view own donations" ON donations
  FOR SELECT USING (donor_id = auth.uid());

-- Charities can view donations to their campaigns
CREATE POLICY "Charities can view campaign donations" ON donations
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE charity_id = auth.uid()
    )
  );

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

