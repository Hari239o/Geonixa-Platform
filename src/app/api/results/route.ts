import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    const db = getFirestoreDb();
    const resultsCollection = db.collection('studentResults');
    
    let snapshot;
    if (userId) {
      snapshot = await resultsCollection.where('userId', '==', userId).orderBy('submittedAt', 'desc').limit(100).get();
    } else {
      snapshot = await resultsCollection.orderBy('submittedAt', 'desc').limit(100).get();
    }
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch results' }, { status: 500 });
  }
}
