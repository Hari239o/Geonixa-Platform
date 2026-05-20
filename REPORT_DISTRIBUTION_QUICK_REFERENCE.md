# Report Distribution - Quick Reference Card

## 🚀 Quick Start

### 1. Configure Environment
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_REPORT_KEY=your-secure-key
NEXT_PUBLIC_BASE_URL=https://yourplatform.com
```

### 2. Send Individual Report
```typescript
import ReportDistributionService from '@/lib/ReportDistributionService';

// After exam completion
await ReportDistributionService.sendExamResultNotification(
  'student@email.com',
  'exam_123'
);
```

### 3. Bulk Send to All Students
```typescript
// Admin operation
const result = await ReportDistributionService.bulkSendReports({
  examId: 'exam_123',
  adminKey: process.env.ADMIN_REPORT_KEY!,
});
console.log(`Sent to ${result.summary.successCount} students`);
```

---

## 📧 Email Types Reference

| Type | Use Case | Theme | CTA |
|------|----------|-------|-----|
| `RESULT_QUALIFIED` | Student passed exam | ✅ Green | View Report |
| `RESULT_REJECTED` | Student failed exam | ⚠️ Amber | Explore Jobs |
| `INTERVIEW_INVITATION` | Invite to interview | 🎯 Purple | Join Interview |
| `FULL_REPORT` | Detailed analytics | 📊 Default | View Details |

---

## 🔗 API Endpoints

### Send Report
```
POST /api/results/send-report
Body: { studentId, examId, reportType }
```

### Bulk Send
```
POST /api/results/bulk-send-reports
Body: { examId, adminKey, filterCriteria? }
```

### Check Status
```
GET /api/results/bulk-send-reports?examId=X&adminKey=Y
```

---

## 💡 Common Patterns

### Pattern 1: Auto-send on Exam Submit
```typescript
// In exam completion handler
await ReportDistributionService.sendExamResultNotification(studentId, examId);
```

### Pattern 2: Send After Manual Evaluation
```typescript
const qualification = calculateQualification(scores);
await ReportDistributionService.sendQualificationResult(
  studentId,
  examId,
  qualification
);
```

### Pattern 3: Schedule Interview Email
```typescript
await ReportDistributionService.sendInterviewInvitation(
  studentId,
  '2024-06-15 10:00 AM',
  'https://meet.google.com/xyz'
);
```

### Pattern 4: Bulk Distribution (Admin)
```typescript
const stats = await ReportDistributionService.bulkSendReports({
  examId: 'exam_123',
  adminKey: process.env.ADMIN_REPORT_KEY!,
  filterCriteria: { status: 'QUALIFIED' }
});
```

---

## ✅ Integration Points

| Component | Integration | File |
|-----------|------------ |------|
| Exam Submission | Auto-send results | `/api/*/submit/route.ts` |
| Admin Dashboard | Bulk distribution UI | `/components/admin/*.tsx` |
| Result Page | Show email status | `/app/exam/[id]/page.tsx` |
| Evaluation Service | Send after grading | `/lib/evaluationEngine.ts` |
| Interview Scheduler | Send invites | `/api/interview/schedule/route.ts` |

---

## 🔐 Security Checklist

- [ ] Store `ADMIN_REPORT_KEY` in `.env.local` (not in code)
- [ ] Use SMTP authentication properly configured
- [ ] Verify student email before sending reports
- [ ] Log all distribution activities
- [ ] Rate limit bulk operations
- [ ] Rotate credentials periodically
- [ ] Test in staging before production
- [ ] Monitor Firebase email_logs collection

---

## 📊 Monitoring

### Check Email Logs
```typescript
// Firebase Console > Firestore > email_logs
// Filter: type == "RESULT_QUALIFIED" && status == "DELIVERED"
```

### Track Distribution Progress
```typescript
const status = await ReportDistributionService.checkDistributionStatus(
  'exam_123',
  adminKey
);
console.log(`${status.distributionPercentage}% reports sent`);
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Emails not sending | ✓ Check SMTP credentials in .env.local |
| Bulk send fails | ✓ Verify ADMIN_REPORT_KEY matches |
| High failure rate | ✓ Check Firebase quota and email limits |
| Template looks wrong | ✓ Test in Gmail first, then Outlook |
| Students report no email | ✓ Check spam folder and email logs |

---

## 📞 Support Resources

- 📚 Full docs: `REPORT_DISTRIBUTION_DOCUMENTATION.md`
- 🔧 Service file: `src/lib/ReportDistributionService.ts`
- 📧 Email templates: `src/app/api/results/send-report/route.ts`
- 🏢 Admin API: `src/app/api/results/bulk-send-reports/route.ts`
- 🧪 Test endpoint: `POST http://localhost:3000/api/results/send-report`

---

## 🎯 Next Steps

1. ✅ Add environment variables
2. ✅ Import ReportDistributionService in submission handlers
3. ✅ Test single report sending
4. ✅ Configure bulk send in admin panel
5. ✅ Monitor Firebase email logs
6. ✅ Deploy to staging/production
