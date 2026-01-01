-- Create donations table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  donor_id INTEGER,  -- INTEGER to match your donor.donor_id
  amount DECIMAL NOT NULL CHECK (amount > 0),
  is_anonymous BOOLEAN DEFAULT FALSE,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR DEFAULT 'stripe',
  payment_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON public.donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);

-- Add foreign key constraint (if campaigns table exists)
-- Uncomment if you have a campaigns table:
-- ALTER TABLE public.donations 
--   ADD CONSTRAINT fk_donations_campaign 
--   FOREIGN KEY (campaign_id) 
--   REFERENCES public.campaigns(id) 
--   ON DELETE CASCADE;

-- Add foreign key constraint to donor table
-- Uncomment if you want to enforce referential integrity:
-- ALTER TABLE public.donations 
--   ADD CONSTRAINT fk_donations_donor 
--   FOREIGN KEY (donor_id) 
--   REFERENCES public.donor(donor_id) 
--   ON DELETE SET NULL;

-- Enable Row Level Security (optional, since RLS is off)
-- ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

