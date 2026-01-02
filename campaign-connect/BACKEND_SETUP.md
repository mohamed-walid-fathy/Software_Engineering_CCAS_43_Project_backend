# Backend Setup Guide

This guide will help you set up the backend for your GiveHope campaign platform.

## 🎯 Backend Options

### Option 1: Next.js API Routes (Recommended)
- ✅ Built into Next.js - no separate server needed
- ✅ Same deployment as frontend
- ✅ Easy to get started
- ✅ Good for MVP and small-medium apps

### Option 2: Separate Backend Server
- Express.js (Node.js)
- FastAPI (Python)
- Django (Python)
- NestJS (Node.js)
- Good for complex microservices

### Option 3: Serverless Functions
- Vercel Functions
- AWS Lambda
- Good for scalable, event-driven architecture

---

## 🚀 Quick Start: Next.js API Routes

I've already created example API routes for you:

### Created API Routes:
- `/api/campaigns` - GET (list), POST (create)
- `/api/campaigns/[id]` - GET, PUT, DELETE
- `/api/auth/login` - POST
- `/api/donations` - GET, POST

### Test the API Routes:

```bash
# In your browser or using curl:
http://localhost:3000/api/campaigns
```

---

## 📦 Step 1: Choose a Database

### Option A: PostgreSQL (Recommended)
```bash
npm install @prisma/client prisma
npx prisma init
```

### Option B: MongoDB
```bash
npm install mongoose
```

### Option C: SQLite (For Development)
```bash
npm install better-sqlite3
npm install @prisma/client prisma
npx prisma init --datasource-provider sqlite
```

---

## 🔐 Step 2: Set Up Authentication

### Install Dependencies:
```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Create Environment Variables:
Create `.env.local`:
```env
JWT_SECRET=your-super-secret-key-here
DATABASE_URL=your-database-connection-string
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 💳 Step 3: Payment Processing (Stripe)

### Install Stripe:
```bash
npm install stripe
```

### Add to `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📊 Step 4: Database Schema Example

### Using Prisma (Recommended):

Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite", "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      String   // "donor", "charity", "admin"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  donations Donation[]
  campaigns Campaign[] @relation("CharityCampaigns")
}

model Campaign {
  id            String   @id @default(cuid())
  title         String
  description   String
  image         String?
  goalAmount    Float
  currentAmount Float    @default(0)
  donorCount    Int      @default(0)
  daysLeft      Int
  category      String
  charityId     String
  isUrgent      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  charity   User       @relation("CharityCampaigns", fields: [charityId], references: [id])
  donations Donation[]
}

model Donation {
  id          String   @id @default(cuid())
  amount      Float
  campaignId  String
  donorId     String
  paymentId  String?  // Stripe payment ID
  status      String   // "pending", "completed", "failed"
  isAnonymous Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  campaign Campaign @relation(fields: [campaignId], references: [id])
  donor    User     @relation(fields: [donorId], references: [id])
}
```

### Initialize Database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🔧 Step 5: Update API Routes

### Example: Update `/api/campaigns/route.ts` with Database:

```typescript
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        charity: {
          select: { name: true, email: true }
        },
        _count: {
          select: { donations: true }
        }
      }
    });
    
    return NextResponse.json({ campaigns }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Step 6: Testing Your API

### Using Browser:
- Visit: `http://localhost:3000/api/campaigns`

### Using curl:
```bash
curl http://localhost:3000/api/campaigns
```

### Using Postman/Thunder Client:
- Install Thunder Client extension in VS Code
- Test all your API endpoints

---

## 📝 Step 7: Connect Frontend to Backend

### Update Frontend Components:

Example: Update `src/app/campaigns/browse/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Browse() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading campaigns</div>;

  return (
    // Your component JSX using data.campaigns
  );
}
```

---

## 🚀 Next Steps

1. **Choose your database** (PostgreSQL recommended)
2. **Set up Prisma** or your preferred ORM
3. **Create database schema**
4. **Update API routes** to use real database
5. **Add authentication middleware**
6. **Integrate payment processing**
7. **Add validation** (use Zod)
8. **Add error handling**
9. **Add logging**
10. **Write tests**

---

## 📚 Recommended Packages

```bash
# Database
npm install @prisma/client prisma

# Authentication
npm install bcryptjs jsonwebtoken
npm install next-auth  # Or use NextAuth.js

# Validation
npm install zod

# Payment
npm install stripe

# Utilities
npm install date-fns
npm install zod
```

---

## 🔒 Security Best Practices

1. **Never expose secrets** - Use `.env.local` (add to `.gitignore`)
2. **Validate all inputs** - Use Zod schemas
3. **Hash passwords** - Use bcrypt
4. **Use HTTPS** - Always in production
5. **Rate limiting** - Prevent abuse
6. **CORS configuration** - Restrict origins
7. **SQL injection** - Use Prisma/ORM (never raw queries)

---

## 📖 Resources

- [Next.js API Routes Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe Docs](https://stripe.com/docs)

---

Need help? Check the example API routes I created in `/src/app/api/`!


