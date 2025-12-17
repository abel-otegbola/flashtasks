# Paddle Payment Integration Guide

## Overview
Flashtasks uses Paddle for subscription payments with three tiers: Free, Professional ($29/month), and Enterprise (custom pricing).

## Recording Time Benefits by Plan
- **Free**: 10 minutes per recording session
- **Professional**: 20 minutes per recording session
- **Enterprise**: 30 minutes per recording session

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Paddle Configuration (get from Paddle dashboard)
VITE_PADDLE_VENDOR_ID=your_vendor_id
VITE_PADDLE_PRO_PRODUCT_ID=your_pro_product_id
VITE_PADDLE_ENTERPRISE_PRODUCT_ID=your_enterprise_product_id

# Server-side only (for webhook verification)
PADDLE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
PADDLE_SUBSCRIPTION_COLLECTION_ID=subscriptions_collection_id
```

### 2. Paddle Dashboard Setup

1. **Create Products:**
   - Professional Plan: $29/month or $290/year
   - Enterprise Plan: Custom pricing

2. **Get Vendor ID:**
   - Found in Paddle Dashboard → Developer Tools → Authentication

3. **Get Product IDs:**
   - Found in Paddle Dashboard → Catalog → Products

4. **Get Public Key:**
   - Found in Paddle Dashboard → Developer Tools → Public Key
   - Used for webhook signature verification

5. **Configure Webhook:**
   - URL: `https://your-domain.com/api/paddle/webhook`
   - Events to subscribe: 
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_payment_succeeded`

### 3. Appwrite Setup

#### Create Subscriptions Collection
```javascript
// Collection: subscriptions
// Fields:
{
  "event": "string",              // Paddle event type
  "subscriptionId": "string",     // Paddle subscription ID
  "userId": "string",             // Your user ID
  "passthrough": "string",        // JSON with custom data
  "verified": "boolean",          // Webhook signature verified
  "raw": "string",                // Full webhook payload
  "createdAt": "datetime"         // Auto-generated
}
```

#### Update User Preferences for Roles
User roles are stored in Appwrite account preferences:
```javascript
{
  "role": "free" | "pro" | "enterprise"
}
```

### 4. Payment Flow

1. **User clicks upgrade button** → Opens Paddle checkout overlay
2. **User completes payment** → Paddle processes payment
3. **Paddle sends webhook** → `/api/paddle/webhook` receives notification
4. **Webhook verified** → Signature checked, data saved to Appwrite
5. **Client activates** → `/api/paddle/activate` updates user role
6. **Access granted** → User gets extended recording time

### 5. Testing

#### Test Mode (Sandbox)
1. Enable Paddle Sandbox in dashboard
2. Use sandbox vendor ID and product IDs
3. Test with Paddle test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

#### Verify Setup
```bash
# Check webhook endpoint
curl -X POST https://your-domain.com/api/paddle/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "alert_name=subscription_created&p_signature=test"

# Check activate endpoint
curl -X POST https://your-domain.com/api/paddle/activate \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","productId":"pro_product_id"}'
```

### 6. Recording Time Enforcement

The recording time limit is enforced in `VoiceInput.tsx`:
```typescript
// Free: 600 seconds (10 min)
// Pro: 1200 seconds (20 min)
// Enterprise: 1800 seconds (30 min)

const userRole = ((user as any)?.prefs?.role as string) || 'free';
const maxRecordingTime = 
  userRole === 'enterprise' ? 1800 : 
  userRole === 'pro' ? 1200 : 
  600;
```

Recording automatically stops when limit is reached.

## Usage

### Accessing Pricing Page
- Internal: `/account/pricing` (logged-in users)
- Public: Landing page has pricing section

### Checking User Role
```typescript
import { useUser } from './context/authContext';

const { user } = useUser();
const userRole = ((user as any)?.prefs?.role as string) || 'free';

// Check if user has pro features
if (userRole === 'pro' || userRole === 'enterprise') {
  // Grant access
}
```

### Manual Role Update (for testing)
```javascript
// In Appwrite Console → Auth → Users → Select User → Prefs
{
  "role": "pro"
}
```

## Security Considerations

1. **Webhook Verification**: Always verify Paddle webhook signatures
2. **API Key Protection**: Never expose `APPWRITE_API_KEY` client-side
3. **User Authentication**: Protect `/api/paddle/activate` endpoint
4. **Rate Limiting**: Add rate limits to payment endpoints
5. **Idempotency**: Handle duplicate webhook deliveries

## Troubleshooting

### Payment successful but role not updated
- Check webhook logs in Paddle Dashboard
- Verify webhook URL is accessible
- Check Appwrite API key permissions
- Look for errors in `/api/paddle/webhook` logs

### Recording time not enforced
- Verify user role is set correctly in preferences
- Check `maxRecordingTime` calculation in `createTask.tsx`
- Clear browser cache and refresh

### Paddle checkout not opening
- Verify `VITE_PADDLE_VENDOR_ID` is set
- Check browser console for errors
- Ensure Paddle script is loaded

## Support
- Paddle Support: https://paddle.com/support
- Appwrite Docs: https://appwrite.io/docs
- Email: support@flashtasks.com
