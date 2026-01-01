# No Authentication Mode

All authentication and authorization middleware has been removed. The backend can now directly access the database without requiring tokens.

## Changes Made

### Routes Updated
- ✅ `routes/donations.js` - All routes are public
- ✅ `routes/campaigns.js` - All routes are public
- ✅ `routes/users.js` - All routes are public
- ✅ `routes/auth.js` - All routes are public
- ✅ `routes/admin.js` - All routes are public
- ✅ `routes/notifications.js` - All routes are public
- ✅ `routes/upload.js` - All routes are public

### Controllers Updated
All controllers now work without `req.user`:
- Donations: `donor_id` can be passed in request body
- Campaigns: `charity_id` must be provided in request body
- Users: All user operations are public
- Auth: Some endpoints require email/user_id as parameters

## API Usage Examples

### Get Donation by ID
```bash
GET http://localhost:5000/api/donations/{donation_id}
```

### Create Donation
```bash
POST http://localhost:5000/api/donations
Content-Type: application/json

{
  "campaign_id": "uuid",
  "donor_id": 1,  // Optional, null for anonymous
  "amount": 50.00,
  "is_anonymous": false
}
```

### Get All Donations
```bash
GET http://localhost:5000/api/donations?campaign_id=xxx&status=completed
```

### Create Campaign
```bash
POST http://localhost:5000/api/campaigns
Content-Type: application/json

{
  "title": "Campaign Title",
  "description": "Description",
  "goal_amount": 10000,
  "category": "Education",
  "charity_id": "uuid",  // Required
  "image": "url",
  "days_left": 30
}
```

### Get User Profile
```bash
GET http://localhost:5000/api/users/{donor_id}
```

### Get User by Email (Auth)
```bash
GET http://localhost:5000/api/auth/me?email=user@example.com
```

## Important Notes

1. **RLS is OFF**: Make sure Row Level Security is disabled in Supabase
2. **No Authorization Checks**: All endpoints are accessible without tokens
3. **Required Fields**: Some endpoints now require additional fields in request body:
   - Campaign creation: `charity_id` required
   - Donation creation: `donor_id` optional (null for anonymous)
   - User operations: `user_id` or `donor_id` in URL params

## Security Warning

⚠️ **This mode is for development/testing only!** 

Do not use this in production without proper authentication and authorization. All data is accessible to anyone who knows the endpoint URLs.

## Re-enabling Authentication

To re-enable authentication later:
1. Uncomment authentication middleware imports in route files
2. Add `authenticateToken` middleware back to protected routes
3. Restore authorization checks in controllers
4. Enable RLS in Supabase

