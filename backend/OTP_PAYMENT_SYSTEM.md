# OTP Payment System Documentation

## Overview
This system implements a secure OTP (One-Time Password) based payment confirmation system using Mailtrap and Nodemailer.

## Environment Variables Required

Add these variables to your `.env` file:

```env
# Mailtrap Configuration (for OTP emails)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password

# Email Configuration
FROM_EMAIL=noreply@edulearn.com
```

## API Endpoints

### 1. Generate Payment OTP
**POST** `/api/payments/generate-otp`

**Request Body:**
```json
{
  "enrollmentId": "enrollment_id_here",
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to your email",
  "paymentId": "payment_id_here",
  "expiresIn": 300
}
```

### 2. Verify OTP and Complete Payment
**POST** `/api/payments/verify-otp`

**Request Body:**
```json
{
  "paymentId": "payment_id_here",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Payment completed successfully!",
  "payment": {
    "id": "payment_id",
    "amount": 1000,
    "course": "Course Title",
    "paidAt": "2024-01-01T00:00:00.000Z",
    "status": "completed"
  }
}
```

### 3. Resend OTP
**POST** `/api/payments/resend-otp`

**Request Body:**
```json
{
  "paymentId": "payment_id_here"
}
```

**Response:**
```json
{
  "message": "New OTP sent successfully to your email",
  "expiresIn": 300
}
```

## Payment Flow

1. **Student initiates payment** → Calls `/generate-otp`
2. **System generates 6-digit OTP** → Sends to student's email
3. **Student receives email** → Contains OTP and course details
4. **Student enters OTP** → Calls `/verify-otp`
5. **System verifies OTP** → Completes payment if valid
6. **Confirmation email sent** → Payment success notification

## Security Features

- **OTP Expiration**: 5 minutes
- **Attempt Limit**: 3 failed attempts before requiring new OTP
- **Email Validation**: OTP sent only to enrolled student's email
- **OTP Clearing**: OTP cleared after successful verification
- **Access Control**: Only payment owner can verify OTP

## Email Templates

### OTP Email
- Professional design with EduLearn branding
- Clear OTP display with expiration warning
- Course details and security instructions

### Payment Confirmation Email
- Success confirmation with course details
- Payment amount and date
- Next steps for course access

## Error Handling

- **Invalid OTP**: Shows remaining attempts
- **Expired OTP**: Prompts for new OTP request
- **Email Failure**: Graceful error handling
- **Duplicate Payments**: Prevention mechanism
- **Access Denied**: Security validation

## Testing

To test the system:

1. Ensure Mailtrap credentials are configured
2. Create an enrollment
3. Call `/generate-otp` endpoint
4. Check Mailtrap inbox for OTP email
5. Use OTP to complete payment via `/verify-otp`
6. Verify payment confirmation email

## Dependencies

- `nodemailer`: Email sending functionality
- `mongoose`: Database operations
- `jsonwebtoken`: Authentication
- `bcrypt`: Password hashing
