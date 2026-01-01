# Database Schema

This document describes the database schema for the 43 Backend API.

## Tables

### 1. `donor`
Donor user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| donor_id | INTEGER/SERIAL | PRIMARY KEY | Donor ID (auto-increment) |
| name | VARCHAR | NOT NULL | Donor name |
| email | VARCHAR | UNIQUE, NOT NULL | Email address |
| password_hash | VARCHAR | NULLABLE | Password hash (if using custom auth) |
| phone | VARCHAR | NULLABLE | Phone number |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

**Note:** The donor table uses `donor_id` as the primary key (integer), not `id`. Authentication matching is done by `email`.

### 2. `charities`
Charity organization accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | User ID (matches Supabase Auth user ID) |
| name | VARCHAR | NOT NULL | Charity name |
| email | VARCHAR | UNIQUE, NOT NULL | Email address |
| phone | VARCHAR | NULLABLE | Phone number |
| registration_number | VARCHAR | NULLABLE | Registration/license number |
| is_verified | BOOLEAN | DEFAULT FALSE | Verification status |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

### 3. `campaigns`
Fundraising campaigns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Campaign ID |
| title | VARCHAR | NOT NULL | Campaign title |
| description | TEXT | NOT NULL | Campaign description |
| image | VARCHAR | NULLABLE | Campaign image URL |
| goal_amount | DECIMAL | NOT NULL | Fundraising goal |
| current_amount | DECIMAL | DEFAULT 0 | Current amount raised |
| category | VARCHAR | NOT NULL | Campaign category |
| charity_id | UUID | FOREIGN KEY → charities.id | Charity owner |
| days_left | INTEGER | NULLABLE | Days until campaign ends |
| is_urgent | BOOLEAN | DEFAULT FALSE | Urgent flag |
| status | VARCHAR | DEFAULT 'active' | active, paused, completed, cancelled |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### 4. `donations`
Donation transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Donation ID |
| campaign_id | UUID | FOREIGN KEY → campaigns.id | Campaign |
| donor_id | UUID | FOREIGN KEY → donor.id, NULLABLE | Donor (null for anonymous) |
| amount | DECIMAL | NOT NULL | Donation amount |
| is_anonymous | BOOLEAN | DEFAULT FALSE | Anonymous flag |
| status | VARCHAR | DEFAULT 'pending' | pending, completed, failed, refunded |
| payment_method | VARCHAR | DEFAULT 'stripe' | Payment method |
| payment_id | VARCHAR | NULLABLE | Payment processor ID (Stripe) |
| created_at | TIMESTAMP | DEFAULT NOW() | Donation timestamp |

### 5. `notifications`
User notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Notification ID |
| user_id | UUID | NOT NULL | User ID (donor or charity) |
| type | VARCHAR | NOT NULL | Notification type |
| title | VARCHAR | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

### 6. `admin_actions`
Admin audit log.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Action ID |
| admin_id | UUID | FOREIGN KEY → admins.id | Admin user |
| action | VARCHAR | NOT NULL | Action type |
| target_id | UUID | NULLABLE | Target resource ID |
| details | JSONB | NULLABLE | Action details |
| created_at | TIMESTAMP | DEFAULT NOW() | Action timestamp |

### 7. `flagged_campaigns`
Flagged content tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Flag ID |
| campaign_id | UUID | FOREIGN KEY → campaigns.id | Flagged campaign |
| reason | TEXT | NOT NULL | Flag reason |
| flagged_by | UUID | NOT NULL | User who flagged |
| status | VARCHAR | DEFAULT 'pending' | pending, resolved, dismissed |
| flagged_at | TIMESTAMP | DEFAULT NOW() | Flag timestamp |

### 8. `admins` (Optional)
Admin user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Admin ID (matches Supabase Auth user ID) |
| email | VARCHAR | UNIQUE, NOT NULL | Email address |
| role | VARCHAR | DEFAULT 'admin' | Admin role |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

## Relationships

- `campaigns.charity_id` → `charities.id`
- `donations.campaign_id` → `campaigns.id`
- `donations.donor_id` → `donor.id`
- `notifications.user_id` → `donor.id` OR `charities.id`
- `admin_actions.admin_id` → `admins.id`
- `flagged_campaigns.campaign_id` → `campaigns.id`

## Supabase Storage Buckets

### `uploads`
File storage bucket for:
- Campaign images
- Charity documents
- Profile pictures
- Tax receipts

## Indexes (Recommended)

```sql
-- Campaigns
CREATE INDEX idx_campaigns_charity_id ON campaigns(charity_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_category ON campaigns(category);

-- Donations
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_status ON donations(status);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Flagged campaigns
CREATE INDEX idx_flagged_campaigns_status ON flagged_campaigns(status);
```

## Row Level Security (RLS) Policies

You should set up RLS policies in Supabase for:
- Users can only read/update their own data
- Charities can only manage their own campaigns
- Admins have full access
- Public read access for active campaigns

