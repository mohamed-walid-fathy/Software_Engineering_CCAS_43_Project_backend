# Table Structure Update

## Changes Made

Your `donor` table uses a different structure than initially assumed. The code has been updated to match your actual table structure.

### Your Donor Table Structure:
```sql
donor_id (INTEGER/SERIAL, PRIMARY KEY)
name (VARCHAR)
email (VARCHAR, UNIQUE)
password_hash (VARCHAR)
phone (VARCHAR)
created_at (TIMESTAMP)
```

## Key Changes in Code

### 1. Authentication Middleware (`middleware/auth.js`)
- **Changed:** Now matches donors by `email` instead of `id`
- **Reason:** `donor_id` is an integer, not a UUID matching Supabase Auth
- **Result:** `req.user.donor_id` is now available for donor users

### 2. Donation Controller (`controllers/donationController.js`)
- **Changed:** Uses `req.user.donor_id` or `req.user.profile.donor_id` for donor_id
- **Updated:** Access permission checks now use `donor_id`

### 3. User Controller (`controllers/userController.js`)
- **Changed:** All queries now use `donor_id` field instead of `id`
- **Updated:** Permission checks handle both `donor_id` and `id`

### 4. Auth Controller (`controllers/authController.js`)
- **Changed:** Registration no longer sets `id` field (uses auto-increment `donor_id`)
- **Changed:** Login matches by `email` instead of `id`
- **Updated:** Profile updates use `donor_id` field

## How It Works Now

1. **Authentication Flow:**
   - User authenticates via Supabase Auth (gets UUID token)
   - Backend matches Supabase Auth user by `email` to find donor record
   - Sets `req.user.donor_id` from the donor table
   - All subsequent operations use `donor_id`

2. **Donation Creation:**
   - Uses `req.user.donor_id` to set `donor_id` in donations table
   - Properly links donations to donors

3. **User Queries:**
   - All donor queries use `donor_id` field
   - API endpoints accept `donor_id` as the identifier

## Testing

To test the updated code:

1. **Get donation by ID:**
```bash
GET http://localhost:5000/api/donations/{donation_id}
Authorization: Bearer {token}
```

2. **Get donor profile:**
```bash
GET http://localhost:5000/api/users/{donor_id}
Authorization: Bearer {token}
```

3. **Create donation:**
```bash
POST http://localhost:5000/api/donations
Authorization: Bearer {token}
{
  "campaign_id": "...",
  "amount": 50.00
}
```

The `donor_id` from the authenticated user will be automatically used.

## Important Notes

- The `donations` table should have `donor_id` as INTEGER (matching donor.donor_id)
- Foreign key relationship: `donations.donor_id` → `donor.donor_id`
- Email is used as the matching key between Supabase Auth and donor table
- `password_hash` field is present but not used if you're using Supabase Auth

## Next Steps

1. Verify your `donations` table has `donor_id` as INTEGER
2. Ensure foreign key relationship is set up correctly
3. Test donation creation with an authenticated donor user
4. Verify donation retrieval works correctly

