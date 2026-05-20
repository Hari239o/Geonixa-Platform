# Assessment Report Distribution System

## Overview

This document outlines the comprehensive email report distribution system integrated into the Geonixa Exam Platform. The system automatically sends assessment results, qualifications, and interview invitations directly to students' registered emails.

## Features

✅ **Automated Result Notifications** - Send pass/fail results immediately after exam evaluation
✅ **Interview Invitations** - Notify qualified candidates about interview scheduling
✅ **Full Assessment Reports** - Distribute detailed performance analytics and breakdowns
✅ **Bulk Distribution** - Send reports to all students with filtering options
✅ **Email Templates** - Professional, branded HTML templates for all notification types
✅ **Retry Logic** - Automatic retry with exponential backoff for failed deliveries
✅ **Audit Trail** - Complete logging of all email deliveries in Firebase

## API Endpoints

### 1. Send Individual Report
**POST** `/api/results/send-report`

Sends a single assessment report or notification to a student.

**Request Body:**
```json
{
  "studentId": "student@college.edu",
  "examId": "exam_123",
  "reportType": "RESULT_QUALIFIED" | "RESULT_REJECTED" | "INTERVIEW_INVITATION" | "FULL_REPORT"
}
```

**Report Types:**
- `RESULT_QUALIFIED` - Success notification with score (green theme)
- `RESULT_REJECTED` - Failure notification with guidance (amber theme)
- `INTERVIEW_INVITATION` - Interview scheduling invitation (purple theme)
- `FULL_REPORT` - Comprehensive assessment report with all metrics

**Response:**
```json
{
  "success": true,
  "message": "RESULT_QUALIFIED report sent to student@college.edu",
  "reportId": "GX-REP-123456-ABC1",
  "messageId": "email_msg_id_xyz"
}
```

---

### 2. Bulk Send Reports
**POST** `/api/results/bulk-send-reports`

Sends reports to multiple students with optional filtering.

**Request Body:**
```json
{
  "examId": "exam_123",
  "adminKey": "your_admin_key_here",
  "filterCriteria": {
    "status": "QUALIFIED",
    "domain": "Java Development"
  }
}
```

**Query Parameters:**
- `examId` (required) - The exam ID to send reports for
- `adminKey` (required) - Admin authentication key from `ADMIN_REPORT_KEY` env var
- `filterCriteria` (optional) - Filter by qualification status or domain

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalStudents": 150,
    "successCount": 148,
    "failureCount": 2
  },
  "results": [
    {
      "email": "student1@college.edu",
      "status": "SENT"
    },
    {
      "email": "student2@college.edu",
      "status": "SENT"
    }
  ]
}
```

---

### 3. Check Distribution Status
**GET** `/api/results/bulk-send-reports?examId=exam_123&adminKey=key`

Check the distribution status of reports for an exam.

**Response:**
```json
{
  "examId": "exam_123",
  "totalStudents": 150,
  "reportsSent": 148,
  "pendingReports": 2,
  "distributionPercentage": "98.7"
}
```

---

## Usage Examples

### Example 1: Send Result After Exam Submission

**Location:** `src/app/api/coding/submit/route.ts` or similar submission endpoints

```typescript
import ReportDistributionService from '@/lib/ReportDistributionService';

export async function POST(req: Request) {
  // ... existing submission logic ...

  // After saving results to database
  const studentId = session.user.email;
  const examId = examData.id;

  // Send full report to student
  await ReportDistributionService.sendExamResultNotification(studentId, examId);

  return NextResponse.json({ success: true });
}
```

---

### Example 2: Send Qualification Result After Evaluation

**Location:** Admin panel or evaluation service

```typescript
import ReportDistributionService from '@/lib/ReportDistributionService';

export async function evaluateAndNotifyStudent(studentId: string, examId: string) {
  // Calculate scores and determine qualification
  const scores = await calculateScores(studentId, examId);
  const qualificationStatus = scores.total >= 200 ? 'QUALIFIED' : 'NOT QUALIFIED';

  // Send appropriate notification
  await ReportDistributionService.sendQualificationResult(
    studentId,
    examId,
    qualificationStatus
  );
}
```

---

### Example 3: Bulk Send Reports (Admin Operation)

**Location:** Admin dashboard or scheduled job

```typescript
import ReportDistributionService from '@/lib/ReportDistributionService';

export async function distributeFinalReports(examId: string) {
  try {
    const result = await ReportDistributionService.bulkSendReports({
      examId,
      adminKey: process.env.ADMIN_REPORT_KEY!,
      filterCriteria: {
        status: 'QUALIFIED' // Send only to qualified candidates
      }
    });

    console.log(`Reports sent: ${result.summary.successCount}/${result.summary.totalStudents}`);
  } catch (error) {
    console.error('Distribution failed:', error);
  }
}
```

---

### Example 4: Send Interview Invitation

**Location:** Interview scheduling service

```typescript
import ReportDistributionService from '@/lib/ReportDistributionService';

export async function scheduleInterviewAndNotify(
  studentId: string,
  interviewDate: string,
  interviewLink: string
) {
  // Update interview details in database
  await updateStudentInterviewDetails(studentId, interviewDate, interviewLink);

  // Send invitation email
  await ReportDistributionService.sendInterviewInvitation(
    studentId,
    interviewDate,
    interviewLink
  );
}
```

---

## Email Templates

### 1. Qualified Result (Green Theme)
- **Use Case:** Student qualifies for next round
- **Content:** Score display, next steps, interview scheduling notice
- **CTA Button:** "View Full Assessment Report"

### 2. Rejected Result (Amber Theme)
- **Use Case:** Student does not meet qualification threshold
- **Content:** Score breakdown, feedback, reapplication guidelines
- **CTA Button:** "Explore Other Opportunities"

### 3. Interview Invitation (Purple Theme)
- **Use Case:** Qualified candidate invited for interview
- **Content:** Interview date/time, meeting link, preparation tips
- **CTA Button:** "Join Interview"

### 4. Full Assessment Report
- **Use Case:** Comprehensive report distribution
- **Content:** Candidate details, round-by-round scores, integrity metrics, verification ID
- **Format:** Professional, printable layout

---

## Environment Variables

Add these to your `.env.local` file:

```env
# Email Configuration
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Geonixa Talent Acquisition

# Report Distribution
ADMIN_REPORT_KEY=your-secure-admin-key-here
NEXT_PUBLIC_BASE_URL=https://yourplatform.com

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... other Firebase config
```

---

## Integration Checklist

- [ ] Add environment variables to `.env.local`
- [ ] Update exam submission endpoints to call `ReportDistributionService`
- [ ] Create admin API endpoint to trigger bulk distribution
- [ ] Set up Firebase email logging collection
- [ ] Test email templates with different scenarios
- [ ] Configure SMTP with Gmail or your email provider
- [ ] Create scheduled job for automatic report distribution (optional)
- [ ] Add report distribution UI to admin dashboard
- [ ] Document email distribution workflows for admins
- [ ] Test with staging environment before production deployment

---

## Admin Dashboard Integration

### Example Admin Component

```typescript
// src/components/admin/ReportDistributionPanel.tsx
import { useState } from 'react';
import ReportDistributionService from '@/lib/ReportDistributionService';

export function ReportDistributionPanel() {
  const [examId, setExamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleBulkSend = async () => {
    setIsLoading(true);
    try {
      const result = await ReportDistributionService.bulkSendReports({
        examId,
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY!,
        filterCriteria: { status: 'QUALIFIED' }
      });
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Distribution Center</h2>
      
      <input
        type="text"
        placeholder="Enter Exam ID"
        value={examId}
        onChange={(e) => setExamId(e.target.value)}
        className="w-full p-2 mb-4 rounded"
      />

      <button
        onClick={handleBulkSend}
        disabled={isLoading}
        className="bg-orange-500 text-white px-6 py-2 rounded font-bold"
      >
        {isLoading ? 'Sending...' : 'Send to Qualified Students'}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-green-900 rounded">
          <p>✓ Reports Sent: {result.summary.successCount}/{result.summary.totalStudents}</p>
          <p>⚠ Failed: {result.summary.failureCount}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Error Handling

The system includes automatic retry logic with exponential backoff:
- **Retry Attempts:** 3
- **Backoff Strategy:** 1s → 2s → 4s
- **Non-Retryable Errors:** Authentication failures (SMTP auth errors)
- **Logging:** All attempts logged in Firebase `email_logs` collection

---

## Monitoring & Logging

All email deliveries are logged in Firebase with the following fields:
- `candidateEmail` - Student email
- `type` - Email type (RESULT_QUALIFIED, etc.)
- `status` - PENDING, DELIVERED, FAILED, RETRYING
- `attempts` - Number of retry attempts
- `messageId` - SMTP message ID
- `timestamp` - When email was sent

**View Logs:**
```bash
# Firebase Console > Firestore > email_logs collection
# Filter by status, candidate email, or date range
```

---

## Testing

### Test with Development Email
If using Ethereal (test email service):

```typescript
// In .env.local (leave SMTP_USER and SMTP_PASS unset)
// The system will automatically fall back to Ethereal test account
// Preview URLs will be logged in console output
```

### Manual Testing

```bash
curl -X POST http://localhost:3000/api/results/send-report \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test@example.com",
    "examId": "exam_123",
    "reportType": "RESULT_QUALIFIED"
  }'
```

---

## Troubleshooting

### Issue: Emails Not Sending
**Solution:** Check Firebase configuration and SMTP credentials in `.env.local`

### Issue: Bulk Send Fails
**Solution:** Verify `ADMIN_REPORT_KEY` matches in request and environment

### Issue: Templates Not Rendering Properly
**Solution:** Check email client HTML support; templates are tested on Gmail, Outlook, Apple Mail

---

## Security Considerations

1. **Admin Key Protection:** Keep `ADMIN_REPORT_KEY` secure and rotate periodically
2. **Email Logging:** Email logs contain student emails; restrict Firebase access accordingly
3. **Report Verification:** Each report includes unique verification ID and hash
4. **Data Anonymization:** Don't log sensitive student data; log only email and type
5. **Rate Limiting:** Implement rate limiting on bulk send endpoint to prevent abuse

---

## Support

For issues or questions regarding the report distribution system:
1. Check Firebase email_logs for delivery status
2. Review error messages in server console
3. Verify environment variables are correctly configured
4. Test with a single student first before bulk operations

---

## Future Enhancements

- [ ] SMS notifications for urgent alerts
- [ ] Calendar integration for interview scheduling
- [ ] Multi-language email templates
- [ ] Custom branding per organization
- [ ] Report expiry and re-distribution options
- [ ] Real-time distribution progress dashboard
- [ ] A/B testing for email templates
- [ ] Integration with CRM systems
