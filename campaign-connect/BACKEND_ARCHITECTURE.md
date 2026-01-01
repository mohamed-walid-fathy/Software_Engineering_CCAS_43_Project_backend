# Campaign Connect - Backend Architecture & Module Structure

## 📋 Project Overview

**Campaign Connect** is a crowdfunding platform that connects donors with charitable campaigns. The platform supports three user roles:
- **Donors**: Browse and donate to campaigns
- **Charities**: Create and manage fundraising campaigns
- **Admins**: Oversee platform operations, approve charities, and moderate content

---

## 🏗️ Current Technology Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Query (TanStack Query)
- **Form Validation**: Zod + React Hook Form
- **Payment Processing**: Stripe (planned)

---

## 📁 File Structure & Module Breakdown

### 1. **Authentication Module** (`/src/app/api/auth/`)

#### Files:
- `login/route.ts` - User authentication endpoint

#### Functionality:
- **POST `/api/auth/login`**
  - Authenticates users via Supabase Auth
  - Supports both donors and charities
  - Returns user profile from custom tables (`donor` or `charities`)
  - Returns session token

#### Backend Requirements:
- [ ] **POST `/api/auth/register`** - User registration
  - Create donor account
  - Create charity account (with verification status)
  - Hash passwords (if not using Supabase Auth)
  - Email verification flow
- [ ] **POST `/api/auth/logout`** - Session termination
- [ ] **POST `/api/auth/forgot-password`** - Password reset request
- [ ] **POST `/api/auth/reset-password`** - Password reset confirmation
- [ ] **GET `/api/auth/me`** - Get current user profile
- [ ] **PUT `/api/auth/profile`** - Update user profile
- [ ] **POST `/api/auth/refresh`** - Refresh access token

#### Database Tables:
- `donor` (id, name, email, password_hash, phone, created_at)
- `charities` (id, name, email, password_hash, phone, registration_number, is_verified, created_at)
- `admins` (id, email, password_hash, role, created_at) - Optional

---

### 2. **Campaigns Module** (`/src/app/api/campaigns/`)

#### Files:
- `route.ts` - List and create campaigns
- `[id]/route.ts` - Get, update, delete specific campaign

#### Functionality:
- **GET `/api/campaigns`**
  - Fetches all campaigns with charity info
  - Calculates donor count per campaign
  - Orders by creation date (newest first)
  - Returns: campaigns array with charity details

- **POST `/api/campaigns`**
  - Creates new campaign
  - Validates required fields (title, description, goal_amount, category, charity_id)
  - Sets initial current_amount to 0
  - Returns: created campaign object

- **GET `/api/campaigns/[id]`**
  - Fetches single campaign by ID
  - Includes charity information
  - Calculates donor count
  - Returns: campaign object with donor count

- **PUT `/api/campaigns/[id]`**
  - Updates campaign details
  - Allows partial updates
  - Returns: updated campaign object

- **DELETE `/api/campaigns/[id]`**
  - Soft delete or hard delete campaign
  - Returns: success message

#### Backend Requirements:
- [ ] **GET `/api/campaigns?category=...`** - Filter by category
- [ ] **GET `/api/campaigns?search=...`** - Search campaigns
- [ ] **GET `/api/campaigns?charity_id=...`** - Get campaigns by charity
- [ ] **GET `/api/campaigns?status=active|completed|paused`** - Filter by status
- [ ] **GET `/api/campaigns?sort=most-funded|ending-soon|most-donors`** - Sorting options
- [ ] **POST `/api/campaigns/[id]/pause`** - Pause campaign
- [ ] **POST `/api/campaigns/[id]/resume`** - Resume campaign
- [ ] **GET `/api/campaigns/[id]/analytics`** - Campaign analytics (charity only)
- [ ] **POST `/api/campaigns/[id]/flag`** - Flag campaign for review (admin)
- [ ] **GET `/api/campaigns/featured`** - Get featured/urgent campaigns

#### Database Tables:
- `campaigns` (
  - id (UUID, PK),
  - title (VARCHAR),
  - description (TEXT),
  - image (VARCHAR, nullable),
  - goal_amount (DECIMAL),
  - current_amount (DECIMAL, default 0),
  - category (VARCHAR),
  - charity_id (UUID, FK → charities),
  - days_left (INTEGER),
  - is_urgent (BOOLEAN, default false),
  - status (VARCHAR: 'active', 'paused', 'completed', 'cancelled'),
  - created_at (TIMESTAMP),
  - updated_at (TIMESTAMP)
)

#### Business Logic:
- Auto-calculate `days_left` based on end date
- Update `current_amount` when donations are made
- Auto-set status to 'completed' when goal is reached
- Track campaign views/impressions

---

### 3. **Donations Module** (`/src/app/api/donations/`)

#### Files:
- `route.ts` - Create and list donations

#### Functionality:
- **POST `/api/donations`**
  - Creates new donation record
  - Validates amount > 0
  - Updates campaign `current_amount` (via RPC or direct update)
  - Supports anonymous donations
  - Sets status: 'pending' or 'completed'
  - TODO: Integrate Stripe payment processing

- **GET `/api/donations`**
  - Lists donations with optional filters
  - Query params: `campaign_id`, `donor_id`
  - Includes campaign and donor information
  - Orders by creation date (newest first)
  - Returns: donations array

#### Backend Requirements:
- [ ] **GET `/api/donations?campaign_id=...`** - Filter by campaign (existing)
- [ ] **GET `/api/donations?donor_id=...`** - Filter by donor (existing)
- [ ] **GET `/api/donations?charity_id=...`** - Get all donations for charity's campaigns
- [ ] **GET `/api/donations?status=...`** - Filter by status
- [ ] **GET `/api/donations/[id]`** - Get single donation details
- [ ] **POST `/api/donations/[id]/refund`** - Process refund (admin/charity)
- [ ] **GET `/api/donations/stats`** - Donation statistics
- [ ] **POST `/api/donations/webhook`** - Stripe webhook handler
- [ ] **GET `/api/donations/receipt/[id]`** - Generate tax receipt PDF

#### Database Tables:
- `donations` (
  - id (UUID, PK),
  - campaign_id (UUID, FK → campaigns),
  - donor_id (UUID, FK → donor),
  - amount (DECIMAL),
  - is_anonymous (BOOLEAN, default false),
  - status (VARCHAR: 'pending', 'completed', 'failed', 'refunded'),
  - payment_method (VARCHAR: 'stripe', 'paypal', etc.),
  - payment_id (VARCHAR, nullable) - Stripe payment intent ID,
  - created_at (TIMESTAMP)
)

#### Business Logic:
- Update campaign `current_amount` atomically
- Increment campaign `donor_count` (if separate field)
- Send confirmation email to donor
- Generate tax receipt
- Handle payment failures
- Support recurring donations (monthly subscriptions)

---

### 4. **User Management Module** (To Be Created)

#### Backend Requirements:
- [ ] **GET `/api/users/donors`** - List all donors (admin only)
- [ ] **GET `/api/users/charities`** - List all charities
- [ ] **GET `/api/users/charities/pending`** - Get pending charity approvals (admin)
- [ ] **POST `/api/users/charities/[id]/approve`** - Approve charity (admin)
- [ ] **POST `/api/users/charities/[id]/reject`** - Reject charity (admin)
- [ ] **GET `/api/users/[id]`** - Get user profile
- [ ] **PUT `/api/users/[id]`** - Update user profile
- [ ] **DELETE `/api/users/[id]`** - Deactivate user account
- [ ] **GET `/api/users/[id]/donations`** - Get user's donation history
- [ ] **GET `/api/users/[id]/campaigns`** - Get user's campaigns (charity)

---

### 5. **Admin Module** (To Be Created)

#### Backend Requirements:
- [ ] **GET `/api/admin/stats`** - Platform statistics
  - Total donations
  - Active users
  - Verified charities
  - Pending reviews
- [ ] **GET `/api/admin/activity`** - Recent platform activity log
- [ ] **GET `/api/admin/flagged-campaigns`** - Get flagged campaigns
- [ ] **POST `/api/admin/campaigns/[id]/flag`** - Flag campaign
- [ ] **POST `/api/admin/campaigns/[id]/unflag`** - Unflag campaign
- [ ] **POST `/api/admin/campaigns/[id]/suspend`** - Suspend campaign
- [ ] **GET `/api/admin/reports`** - Generate platform reports
- [ ] **GET `/api/admin/analytics`** - Platform analytics dashboard data

#### Database Tables:
- `admin_actions` (audit log for admin activities)
- `flagged_campaigns` (campaign_id, reason, flagged_by, flagged_at, status)

---

### 6. **Notifications Module** (To Be Created)

#### Backend Requirements:
- [ ] **GET `/api/notifications`** - Get user notifications
- [ ] **POST `/api/notifications/[id]/read`** - Mark notification as read
- [ ] **POST `/api/notifications/read-all`** - Mark all as read
- [ ] **POST `/api/notifications/preferences`** - Update notification preferences

#### Database Tables:
- `notifications` (
  - id (UUID, PK),
  - user_id (UUID, FK),
  - type (VARCHAR: 'donation_received', 'campaign_update', etc.),
  - title (VARCHAR),
  - message (TEXT),
  - is_read (BOOLEAN, default false),
  - created_at (TIMESTAMP)
)

---

### 7. **File Upload Module** (To Be Created)

#### Backend Requirements:
- [ ] **POST `/api/upload/image`** - Upload campaign images
- [ ] **POST `/api/upload/document`** - Upload charity documents
- [ ] **DELETE `/api/upload/[id]`** - Delete uploaded file

#### Storage:
- Use Supabase Storage or AWS S3
- Validate file types and sizes
- Generate secure URLs

---

## 🔐 Authentication & Authorization

### Middleware Requirements:
- [ ] **Authentication Middleware**
  - Verify JWT token or Supabase session
  - Extract user ID and role
  - Attach to request object

- [ ] **Authorization Middleware**
  - Role-based access control (RBAC)
  - Check user permissions for specific actions
  - Protect admin-only endpoints
  - Protect charity-owned resources

### Role Permissions:

#### Donor:
- ✅ View all campaigns
- ✅ Create donations
- ✅ View own donation history
- ✅ Update own profile
- ❌ Create campaigns
- ❌ View other users' data

#### Charity:
- ✅ Create and manage own campaigns
- ✅ View own campaign analytics
- ✅ View donations to own campaigns
- ✅ Update own profile
- ❌ View other charities' data
- ❌ Approve/reject content

#### Admin:
- ✅ Full platform access
- ✅ Approve/reject charities
- ✅ Flag/suspend campaigns
- ✅ View all user data
- ✅ Generate reports
- ✅ Manage platform settings

---

## 📊 Database Schema Summary

### Core Tables:
1. **donor** - Donor user accounts
2. **charities** - Charity organization accounts
3. **campaigns** - Fundraising campaigns
4. **donations** - Donation transactions
5. **notifications** - User notifications
6. **admin_actions** - Admin audit log
7. **flagged_campaigns** - Flagged content tracking

### Relationships:
- `campaigns.charity_id` → `charities.id`
- `donations.campaign_id` → `campaigns.id`
- `donations.donor_id` → `donor.id`
- `notifications.user_id` → `donor.id` OR `charities.id`

---

## 🔄 API Response Standards

### Success Response Format:
```json
{
  "data": { ... },
  "message": "Success message",
  "status": 200
}
```

### Error Response Format:
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "status": 400
}
```

### Pagination Format:
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 🧪 Testing Requirements

### Unit Tests:
- [ ] Authentication logic
- [ ] Campaign CRUD operations
- [ ] Donation processing
- [ ] Authorization checks

### Integration Tests:
- [ ] API endpoint testing
- [ ] Database operations
- [ ] Payment processing flow
- [ ] Email notifications

### E2E Tests:
- [ ] Complete donation flow
- [ ] Campaign creation flow
- [ ] Admin approval flow

---

## 🚀 Deployment Considerations

### Environment Variables:
```env
# Database
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Authentication
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Payment
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# File Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

### Security:
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (use Prisma/ORM)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] HTTPS enforcement

---

## 📝 Next Steps for Backend Development

1. **Set up database schema** (Prisma or Supabase migrations)
2. **Implement authentication middleware**
3. **Create missing API endpoints** (see requirements above)
4. **Add input validation** (Zod schemas)
5. **Integrate Stripe payment processing**
6. **Set up email notifications** (SendGrid, Resend, etc.)
7. **Implement file upload** (Supabase Storage)
8. **Add logging and error tracking** (Sentry, LogRocket)
9. **Write API documentation** (Swagger/OpenAPI)
10. **Set up CI/CD pipeline**

---

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)

---

**Last Updated**: December 2024
**Version**: 1.0.0

