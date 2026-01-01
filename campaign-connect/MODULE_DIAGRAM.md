# Campaign Connect - Module Architecture Diagram

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMPAIGN CONNECT PLATFORM                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │      Next.js Frontend (App Router)   │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │      Next.js API Routes (Backend)    │
        └─────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Supabase   │      │    Stripe    │      │   Email      │
│  Database   │      │   Payments   │      │   Service    │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## 📦 Module Structure

### 1. **Authentication Module**
```
┌─────────────────────────────────────────┐
│         Authentication Module            │
├─────────────────────────────────────────┤
│  • POST /api/auth/login                 │
│  • POST /api/auth/register              │
│  • POST /api/auth/logout                │
│  • POST /api/auth/forgot-password       │
│  • POST /api/auth/reset-password        │
│  • GET  /api/auth/me                    │
│  • PUT  /api/auth/profile               │
└─────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Supabase Auth      │
    │  + Custom Tables    │
    └─────────────────────┘
```

**Dependencies:**
- Supabase Auth
- `donor` table
- `charities` table

**Exports:**
- JWT tokens / Session
- User profile data

---

### 2. **Campaigns Module**
```
┌─────────────────────────────────────────┐
│          Campaigns Module                │
├─────────────────────────────────────────┤
│  • GET    /api/campaigns                │
│  • POST   /api/campaigns                │
│  • GET    /api/campaigns/[id]           │
│  • PUT    /api/campaigns/[id]            │
│  • DELETE /api/campaigns/[id]            │
│  • POST   /api/campaigns/[id]/pause      │
│  • GET    /api/campaigns/featured        │
└─────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   campaigns table   │
    │   + charities FK    │
    └─────────────────────┘
```

**Dependencies:**
- `campaigns` table
- `charities` table (for charity info)
- `donations` table (for donor count)

**Business Logic:**
- Calculate donor count
- Update current_amount on donations
- Auto-update status based on goal
- Calculate days_left

---

### 3. **Donations Module**
```
┌─────────────────────────────────────────┐
│          Donations Module                │
├─────────────────────────────────────────┤
│  • POST /api/donations                  │
│  • GET  /api/donations                  │
│  • GET  /api/donations/[id]             │
│  • POST /api/donations/[id]/refund      │
│  • GET  /api/donations/receipt/[id]     │
└─────────────────────────────────────────┘
              │
        ┌─────┴─────┐
        ▼           ▼
┌─────────────┐  ┌─────────────┐
│ donations   │  │   Stripe     │
│    table     │  │   Payment   │
└─────────────┘  └─────────────┘
        │
        ▼
┌─────────────┐
│  campaigns   │ (update current_amount)
│    table     │
└─────────────┘
```

**Dependencies:**
- `donations` table
- `campaigns` table (update amount)
- `donor` table
- Stripe API

**Business Logic:**
- Process payment via Stripe
- Update campaign current_amount
- Generate tax receipts
- Send confirmation emails

---

### 4. **User Management Module**
```
┌─────────────────────────────────────────┐
│       User Management Module             │
├─────────────────────────────────────────┤
│  • GET  /api/users/donors               │
│  • GET  /api/users/charities            │
│  • GET  /api/users/charities/pending    │
│  • POST /api/users/charities/[id]/approve│
│  • GET  /api/users/[id]                 │
│  • PUT  /api/users/[id]                 │
└─────────────────────────────────────────┘
              │
        ┌─────┴─────┐
        ▼           ▼
┌─────────────┐  ┌─────────────┐
│  donor      │  │  charities   │
│  table      │  │  table       │
└─────────────┘  └─────────────┘
```

**Dependencies:**
- `donor` table
- `charities` table
- Admin authorization

---

### 5. **Admin Module**
```
┌─────────────────────────────────────────┐
│            Admin Module                  │
├─────────────────────────────────────────┤
│  • GET  /api/admin/stats                │
│  • GET  /api/admin/activity             │
│  • GET  /api/admin/flagged-campaigns    │
│  • POST /api/admin/campaigns/[id]/flag  │
│  • POST /api/admin/campaigns/[id]/suspend│
│  • GET  /api/admin/reports              │
└─────────────────────────────────────────┘
              │
        ┌─────┴─────┬──────────────┐
        ▼          ▼               ▼
┌──────────┐ ┌──────────┐  ┌─────────────┐
│ campaigns│ │ charities │  │ admin_actions│
│  table   │ │  table   │  │    table     │
└──────────┘ └──────────┘  └─────────────┘
```

**Dependencies:**
- All tables (read access)
- `admin_actions` table (audit log)
- `flagged_campaigns` table

**Authorization:**
- Admin role required
- Audit all actions

---

### 6. **Notifications Module**
```
┌─────────────────────────────────────────┐
│        Notifications Module             │
├─────────────────────────────────────────┤
│  • GET  /api/notifications              │
│  • POST /api/notifications/[id]/read    │
│  • POST /api/notifications/read-all    │
└─────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ notifications table │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   Email Service      │
    │   (SendGrid/Resend)  │
    └─────────────────────┘
```

**Triggers:**
- New donation → notify charity
- Campaign update → notify donors
- Charity approval → notify charity
- Campaign flagged → notify admin

---

## 🔄 Data Flow Examples

### 1. **Donation Flow**
```
User (Frontend)
    │
    ▼ POST /api/donations
API Route Handler
    │
    ├─► Validate input
    ├─► Check authentication
    ├─► Process payment (Stripe)
    │
    ├─► Insert donation record
    │   └─► donations table
    │
    ├─► Update campaign amount
    │   └─► campaigns.current_amount += amount
    │
    ├─► Send notifications
    │   ├─► Email to donor
    │   └─► Email to charity
    │
    └─► Return success response
```

### 2. **Campaign Creation Flow**
```
Charity (Frontend)
    │
    ▼ POST /api/campaigns
API Route Handler
    │
    ├─► Validate input (Zod)
    ├─► Check authentication
    ├─► Check charity verification
    │
    ├─► Upload image (if provided)
    │   └─► Supabase Storage
    │
    ├─► Insert campaign record
    │   └─► campaigns table
    │
    └─► Return created campaign
```

### 3. **Charity Approval Flow**
```
Admin (Frontend)
    │
    ▼ POST /api/users/charities/[id]/approve
API Route Handler
    │
    ├─► Check admin authorization
    ├─► Update charity status
    │   └─► charities.is_verified = true
    │
    ├─► Log admin action
    │   └─► admin_actions table
    │
    ├─► Send notification
    │   └─► Email to charity
    │
    └─► Return success
```

---

## 🔐 Authorization Flow

```
Request
    │
    ▼
Authentication Middleware
    │
    ├─► Extract token from header
    ├─► Verify token (Supabase/JWT)
    ├─► Get user from database
    │
    └─► Attach user to request
        │
        ▼
Authorization Middleware
    │
    ├─► Check user role
    ├─► Check resource ownership
    │   (e.g., charity owns campaign)
    │
    └─► Allow or Deny
        │
        ▼
Route Handler
```

---

## 📊 Database Relationships

```
┌─────────────┐
│   donor     │
└──────┬──────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐      ┌─────────────┐
│  donations  │──────│  campaigns  │
└─────────────┘      └──────┬──────┘
       │                    │
       │                    │ N:1
       │                    │
       │                    ▼
       │            ┌─────────────┐
       │            │  charities  │
       │            └─────────────┘
       │
       │
       ▼
┌─────────────┐
│ notifications │
└────────────────┘
```

---

## 🛠️ Module Dependencies Graph

```
Authentication Module
    │
    ├─► Used by: All modules
    └─► Depends on: Supabase Auth

Campaigns Module
    │
    ├─► Uses: Authentication
    ├─► Uses: File Upload (for images)
    └─► Depends on: campaigns, charities tables

Donations Module
    │
    ├─► Uses: Authentication
    ├─► Uses: Campaigns (update amount)
    ├─► Uses: Stripe (payment)
    ├─► Uses: Notifications (send emails)
    └─► Depends on: donations, campaigns, donor tables

Admin Module
    │
    ├─► Uses: Authentication (admin role)
    ├─► Uses: All other modules (read access)
    └─► Depends on: All tables

User Management Module
    │
    ├─► Uses: Authentication
    ├─► Uses: Admin (for approvals)
    └─► Depends on: donor, charities tables

Notifications Module
    │
    ├─► Uses: Authentication
    ├─► Used by: Donations, Admin, User Management
    └─► Depends on: notifications table, Email service
```

---

## 🚀 Implementation Priority

### Phase 1: Core Functionality (MVP)
1. ✅ Authentication (login, register)
2. ✅ Campaigns CRUD
3. ✅ Donations (basic)
4. ⬜ Payment integration (Stripe)

### Phase 2: Enhanced Features
1. ⬜ User management
2. ⬜ Admin dashboard
3. ⬜ Notifications
4. ⬜ File uploads

### Phase 3: Advanced Features
1. ⬜ Analytics & reporting
2. ⬜ Email campaigns
3. ⬜ Recurring donations
4. ⬜ Advanced search & filters

---

**Last Updated**: December 2024

