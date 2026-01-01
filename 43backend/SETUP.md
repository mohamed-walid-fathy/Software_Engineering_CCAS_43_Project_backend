# Setup Guide

## Installation Steps

1. **Install Node.js dependencies:**
   ```bash
   npm install express cors dotenv @supabase/supabase-js
   ```

   Or if you prefer to install all dependencies at once:
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   Create a `.env` file in the root directory with the following content:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Set up Supabase:**
   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and API keys
   - Set up the database tables according to `DATABASE_SCHEMA.md`
   - Create a storage bucket named `uploads` for file uploads

4. **Run the server:**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Database Setup

1. **Create tables in Supabase SQL Editor:**
   - Run the SQL scripts to create all tables (see `DATABASE_SCHEMA.md`)
   - Set up Row Level Security (RLS) policies
   - Create necessary indexes

2. **Storage Setup:**
   - Create a storage bucket named `uploads`
   - Set appropriate bucket policies for public/private access

## Testing the Server

Once the server is running, you can test it:

1. **Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Register a user:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "userType": "donor",
       "name": "Test User"
     }'
   ```

## Troubleshooting

- **npm not found:** Make sure Node.js and npm are properly installed
- **Module not found errors:** Run `npm install` to install dependencies
- **Supabase connection errors:** Check your `.env` file has correct Supabase credentials
- **Port already in use:** Change the PORT in `.env` file

