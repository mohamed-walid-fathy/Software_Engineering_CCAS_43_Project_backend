# Quick Fix: Create Donations Table

## Error
```
Could not find the table 'public.donations' in the schema cache
```

## Solution

The `donations` table doesn't exist in your Supabase database. Create it using the SQL below.

## Steps

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Run this SQL:**

```sql
-- Create donations table
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
```

3. **Verify the table was created:**
   - Go to "Table Editor" in Supabase
   - You should see `donations` table listed

## Table Structure

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| campaign_id | UUID | Campaign ID (required) |
| donor_id | INTEGER | Donor ID (nullable, matches donor.donor_id) |
| amount | DECIMAL | Donation amount (must be > 0) |
| is_anonymous | BOOLEAN | Anonymous flag (default: false) |
| status | VARCHAR | pending, completed, failed, refunded |
| payment_method | VARCHAR | Payment method (default: 'stripe') |
| payment_id | VARCHAR | Payment processor ID (nullable) |
| created_at | TIMESTAMP | Creation timestamp |

## Test After Creation

```bash
# Get all donations (should return empty array if no data)
GET http://localhost:5000/api/donations

# Create a test donation
POST http://localhost:5000/api/donations
Content-Type: application/json

{
  "campaign_id": "your-campaign-uuid",
  "donor_id": 1,
  "amount": 50.00,
  "is_anonymous": false
}
```

## Notes

- `donor_id` is INTEGER to match your `donor.donor_id` structure
- `campaign_id` is UUID (adjust if your campaigns table uses a different type)
- Foreign key constraints are optional (commented out)
- RLS is disabled as per your setup

