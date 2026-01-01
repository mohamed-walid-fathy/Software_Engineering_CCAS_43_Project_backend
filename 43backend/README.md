# 43 Backend API

Backend API built with Node.js, Express, and Supabase for a donation/campaign platform.

## 📁 Project Structure

```
43backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── controllers/              # Request handlers
│   ├── adminController.js
│   ├── authController.js
│   ├── campaignController.js
│   ├── donationController.js
│   ├── notificationController.js
│   ├── uploadController.js
│   └── userController.js
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── authorize.js         # Authorization middleware (RBAC)
│   ├── errorHandler.js      # Error handling middleware
│   └── validate.js          # Request validation middleware
├── routes/                   # API routes
│   ├── admin.js
│   ├── auth.js
│   ├── campaigns.js
│   ├── donations.js
│   ├── index.js
│   ├── notifications.js
│   ├── upload.js
│   └── users.js
├── utils/                    # Utility functions
│   ├── logger.js
│   └── response.js          # Standardized API responses
├── server.js                 # Main server file
└── package.json
```

## 🚀 Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create a `.env` file:**
```bash
cp .env.example .env
```

3. **Fill in your Supabase credentials in `.env`:**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Start the server:**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📚 API Endpoints

### Health Check
- `GET /health` - Server health check

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (donor or charity)
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Campaigns (`/api/campaigns`)
- `GET /api/campaigns` - List campaigns (with filters: category, search, charity_id, status, sort)
- `GET /api/campaigns/featured` - Get featured/urgent campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create campaign (charity only)
- `PUT /api/campaigns/:id` - Update campaign (owner only)
- `DELETE /api/campaigns/:id` - Delete campaign (owner only)
- `POST /api/campaigns/:id/pause` - Pause campaign (owner only)
- `POST /api/campaigns/:id/resume` - Resume campaign (owner only)
- `GET /api/campaigns/:id/analytics` - Get campaign analytics (owner only)
- `POST /api/campaigns/:id/flag` - Flag campaign for review

### Donations (`/api/donations`)
- `POST /api/donations` - Create donation
- `GET /api/donations` - List donations (with filters: campaign_id, donor_id, charity_id, status)
- `GET /api/donations/:id` - Get single donation
- `GET /api/donations/stats` - Get donation statistics
- `POST /api/donations/:id/refund` - Process refund (admin/charity)
- `GET /api/donations/receipt/:id` - Generate tax receipt
- `POST /api/donations/webhook` - Stripe webhook handler

### Users (`/api/users`)
- `GET /api/users/donors` - List all donors (admin only)
- `GET /api/users/charities` - List all charities
- `GET /api/users/charities/pending` - Get pending charity approvals (admin only)
- `POST /api/users/charities/:id/approve` - Approve charity (admin only)
- `POST /api/users/charities/:id/reject` - Reject charity (admin only)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Deactivate user account
- `GET /api/users/:id/donations` - Get user's donation history
- `GET /api/users/:id/campaigns` - Get user's campaigns (charity)

### Admin (`/api/admin`)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/activity` - Recent platform activity log
- `GET /api/admin/flagged-campaigns` - Get flagged campaigns
- `POST /api/admin/campaigns/:id/flag` - Flag campaign
- `POST /api/admin/campaigns/:id/unflag` - Unflag campaign
- `POST /api/admin/campaigns/:id/suspend` - Suspend campaign
- `GET /api/admin/reports` - Generate platform reports
- `GET /api/admin/analytics` - Platform analytics dashboard data

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/preferences` - Update notification preferences

### File Upload (`/api/upload`)
- `POST /api/upload/image` - Upload image
- `POST /api/upload/document` - Upload document
- `DELETE /api/upload/:id` - Delete uploaded file

## 🔐 Authentication & Authorization

### Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Roles
- **Donor**: Can view campaigns, create donations, view own donation history
- **Charity**: Can create/manage campaigns, view own campaign analytics
- **Admin**: Full platform access, can approve/reject charities, suspend campaigns

## 📊 Database Schema

See `DATABASE_SCHEMA.md` for detailed database schema information.

### Core Tables:
- `donor` - Donor user accounts
- `charities` - Charity organization accounts
- `campaigns` - Fundraising campaigns
- `donations` - Donation transactions
- `notifications` - User notifications
- `admin_actions` - Admin audit log
- `flagged_campaigns` - Flagged content tracking
- `admins` - Admin user accounts (optional)

## 📝 API Response Format

### Success Response:
```json
{
  "data": { ... },
  "message": "Success message",
  "status": 200
}
```

### Error Response:
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "status": 400
}
```

### Paginated Response:
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "message": "Success message",
  "status": 200
}
```

## 🛠️ Development

### Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Supabase publishable key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## 📦 Dependencies

- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `@supabase/supabase-js` - Supabase client

## 🔄 TODO

- [ ] Integrate Stripe payment processing
- [ ] Implement email notifications
- [ ] Add file upload with multer
- [ ] Generate PDF receipts
- [ ] Add request validation schemas
- [ ] Add unit and integration tests
- [ ] Add rate limiting
- [ ] Add request logging
