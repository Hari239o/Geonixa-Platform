import { NextResponse } from 'next/server';
import Student from '@/lib/models/Student';
import dbConnect from '@/lib/db';

// GET: Fetch all students
export async function GET() {
  try {
    await dbConnect();
    const students = await Student.find();
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST: Assign a domain/course to a student
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const newStudent = await Student.create(body);
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}