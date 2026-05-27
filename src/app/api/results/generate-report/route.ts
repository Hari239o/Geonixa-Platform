import { NextResponse } from 'next/server';
import { getCompleteStudentResults, isFirebaseConfigured } from '@/lib/firebase';
import { reportGeneratorService } from '@/lib/reportGenerator';
import { getFirestoreDb } from '@/lib/firestore';

export async function POST(req: Request) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const { candidateEmail } = await req.json();
    if (!candidateEmail) {
      return NextResponse.json({ error: 'candidateEmail is required' }, { status: 400 });
    }

    // 1. Fetch complete results and legacy fallback
    let completeResults: any = null;
    let legacyData: any = null;

    try {
      completeResults = await getCompleteStudentResults(candidateEmail);
      const adminDb = getFirestoreDb();
      const legacySnap = await adminDb.collection('exam_submissions').doc(candidateEmail).get();
      if (legacySnap.exists) legacyData = legacySnap.data();
    } catch (e) {
      console.error('Failed to fetch student results for generate-report:', e);
    }

    // 2. Extract & save report metadata (immutable archive)
    const reportData = await reportGeneratorService.extractReportData(candidateEmail, completeResults, legacyData);
    await reportGeneratorService.saveReportToDatabase(reportData);

    return NextResponse.json({ success: true, message: 'Report archived for admin dispatch', reportId: reportData.reportId });
  } catch (error: any) {
    console.error('Generate report API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to generate report' }, { status: 500 });
  }
}
