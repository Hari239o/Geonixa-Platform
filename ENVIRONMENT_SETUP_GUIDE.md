# Environment Setup Guide - Firestore Migration

## Critical Issue: Student Registration Failing

**Error**: "Error adding student: Failed to fetch"  
**Root Cause**: `FIREBASE_SERVICE_ACCOUNT` environment variable is missing

---

## Quick Fix (5 Minutes)

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **geonixa-stipend**
3. Click **Settings** (gear icon) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key** (or use existing one)
6. A JSON file will download - **DO NOT commit this file**

### Step 2: Create `.env.local` File

In the root of your project (`d:\PROJECTS\Exam Platform\`), create a new file named `.env.local`:

```bash
# Copy the JSON content from the service account file
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"geonixa-stipend","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}'

# Other required variables
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBUuERNesSYXG0a57sOVEMAiXe6kAhZjvQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=geonixa-stipend.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=geonixa-stipend
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=geonixa-stipend.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=243951342049
NEXT_PUBLIC_FIREBASE_APP_ID=1:243951342049:web:347dc800cd03fb92c102a0

NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

SMTP_USER=talent@geonixa.com
SMTP_PASS=eaaabihddfbshaxr
SMTP_FROM_NAME=Geonixa Talent Acquisition
SMTP_FROM_EMAIL=talent@geonixa.com

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
ADMIN_REPORT_KEY=your_admin_key_here

RATE_LIMIT_TOKENS=10
RATE_LIMIT_INTERVAL_MS=60000

ALLOWED_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Step 3: Restart Development Server

```bash
npm run dev
```

---

## About Sending Student Credentials

If students should **receive login credentials** when registered:

### Option A: Send via Email During Registration (Recommended)

Update `src/app/api/students/route.ts`:

```typescript
import { emailService } from '@/lib/emailService';

export async function POST(req: Request) {
  try {
    const db = getFirestoreDb();
    const body = await req.json();
    
    const docRef = await addDoc(collection(db, 'students'), {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Send credentials email
    if (body.email) {
      const studentId = docRef.id;
      const credentials = {
        studentId,
        email: body.email,
        password: body.password || 'temporary_password',
        domain: body.domain,
      };
      
      await emailService.send({
        to: body.email,
        subject: 'Your Exam Login Credentials',
        html: `
          <h2>Welcome to Geonixa Exam Platform</h2>
          <p>Your account has been created. Here are your login credentials:</p>
          <ul>
            <li><strong>Email:</strong> ${credentials.email}</li>
            <li><strong>Temporary Password:</strong> ${credentials.password}</li>
            <li><strong>Student ID:</strong> ${credentials.studentId}</li>
            <li><strong>Domain:</strong> ${credentials.domain}</li>
          </ul>
          <p><a href="http://localhost:3000/auth/login">Login to Exam Platform</a></p>
        `,
      });
    }
    
    return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
  } catch (error: any) {
    console.error('Student creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}
```

### Option B: Automatic Credential Generation

If you want to auto-generate credentials during student creation:

```typescript
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const db = getFirestoreDb();
    const body = await req.json();
    
    // Generate temporary password if not provided
    const temporaryPassword = body.password || uuidv4().substring(0, 12);
    
    const docRef = await addDoc(collection(db, 'students'), {
      ...body,
      studentId: docRef.id,
      password: temporaryPassword, // Store hashed in production
      credentialsSentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Send email with credentials
    await emailService.send({
      to: body.email,
      subject: 'Your Exam Login Credentials - Action Required',
      html: `
        <h2>Welcome!</h2>
        <p>Account Created: ${body.email}</p>
        <p>Temporary Password: ${temporaryPassword}</p>
        <p><strong>Please change your password after first login</strong></p>
      `,
    });
    
    return NextResponse.json({ id: docRef.id, credentialsSent: true }, { status: 201 });
  } catch (error: any) {
    console.error('Student creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}
```

---

## Environment Variables Checklist

### Required (Application Won't Work Without)
- ✅ `FIREBASE_SERVICE_ACCOUNT` - Server-side Firestore admin
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY` - Client-side Firebase SDK
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firestore project ID

### Recommended (For Full Features)
- ✅ `SMTP_USER` / `SMTP_PASS` - For sending credentials and reports
- ✅ `JWT_SECRET` - For session tokens
- ✅ `ADMIN_REPORT_KEY` - For admin operations

### Optional
- `RATE_LIMIT_TOKENS` - API rate limiting
- `ALLOWED_ORIGIN` - CORS configuration

---

## Troubleshooting

### Error: "FIREBASE_SERVICE_ACCOUNT environment variable is required"
**Solution**: Add `FIREBASE_SERVICE_ACCOUNT` to `.env.local`

### Error: "Failed to fetch students"
**Solution**: 
1. Check `.env.local` exists in project root
2. Verify `FIREBASE_SERVICE_ACCOUNT` is valid JSON
3. Check server logs for detailed error

### Error: "Cannot read property 'private_key' of undefined"
**Solution**: 
1. Service account JSON is invalid or truncated
2. Make sure the entire JSON is on one line in .env.local
3. Escape newlines: `\n` not actual line breaks

### Students Not Receiving Credentials
**Solution**:
1. Verify `SMTP_USER` and `SMTP_PASS` are correct
2. Check email service logs: `src/lib/emailService.ts`
3. Ensure POST `/api/students` calls email sending function
4. Check spam folder for credential emails

---

## Security Notes

- **Never commit `.env.local`** - It contains secrets
- **Add `.env.local` to `.gitignore`** (should already be there)
- **In production**: Use Vercel Environment Variables, not `.env` files
- **Service account key**: Rotate keys periodically in Firebase Console
- **JWT_SECRET**: Change this value in production

---

## Next Steps

1. ✅ Create `.env.local` with Firebase service account
2. ✅ Restart `npm run dev`
3. ✅ Try adding a student again
4. ✅ Verify email with credentials is sent
5. ✅ Student can login with provided credentials
