import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

// GET: Fetch all students
export async function GET() {
  try {
    const db = getFirestoreDb();
    const studentsCollection = db.collection('students');
    const snapshot = await studentsCollection.get();
    const students = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST: Assign a domain/course to a student
export async function POST(req: Request) {
  try {
    const db = getFirestoreDb();
    const body = await req.json();
    const docRef = await db.collection('students').add({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
  } catch (error: any) {
    console.error('Student creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}
