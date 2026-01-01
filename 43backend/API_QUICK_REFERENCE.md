# API Quick Reference Guide

## Server Running on Port 5000 ✅

## Get Donation by ID

**Endpoint:** `GET /api/donations/:id`

**Authentication:** Required (Bearer token)

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/donations/{donation_id} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "campaign_id": "uuid",
    "donor_id": "uuid",
    "amount": 100.00,
    "is_anonymous": false,
    "status": "completed",
    "payment_method": "stripe",
    "created_at": "2024-01-01T00:00:00Z",
    "campaigns": {
      "id": "uuid",
      "title": "Campaign Title",
      "charity_id": "uuid"
    },
    "donor": {
      "id": "uuid",
      "name": "Donor Name",
      "email": "donor@example.com"
    }
  },
  "message": "Donation retrieved successfully",
  "status": 200
}
```

## All Donation Endpoints

### Public/Optional Auth:
- `GET /api/donations` - List donations (with filters)
- `GET /api/donations/stats` - Get donation statistics
- `POST /api/donations` - Create donation

### Protected (Requires Auth):
- `GET /api/donations/:id` - Get single donation by ID
- `POST /api/donations/:id/refund` - Process refund (admin/charity only)
- `GET /api/donations/receipt/:id` - Generate tax receipt

### Webhook:
- `POST /api/donations/webhook` - Stripe webhook handler

## Query Parameters for GET /api/donations

- `campaign_id` - Filter by campaign
- `donor_id` - Filter by donor
- `charity_id` - Filter by charity (all campaigns)
- `status` - Filter by status (pending, completed, failed, refunded)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```bash
GET /api/donations?campaign_id=xxx&status=completed&page=1&limit=10
```

## Testing with cURL

1. **Get all donations:**
```bash
curl http://localhost:5000/api/donations
```

2. **Get donation by ID:**
```bash
curl -X GET http://localhost:5000/api/donations/YOUR_DONATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Create donation:**
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "campaign_id": "uuid",
    "amount": 50.00,
    "is_anonymous": false
  }'
```

