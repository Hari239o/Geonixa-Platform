import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

// GET: Fetch all courses
export async function GET() {
  try {
    const db = getFirestoreDb();
    const coursesCollection = db.collection('courses');
    const snapshot = await coursesCollection.get();
    const courses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST: Add a new course
export async function POST(req: Request) {
  try {
    const db = getFirestoreDb();
    const body = await req.json();
    const docRef = await db.collection('courses').add({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
