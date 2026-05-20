import { NextResponse } from 'next/server';
import Course from '@/lib/models/Course';
import dbConnect from '@/lib/db';

// GET: Fetch all courses
export async function GET() {
  try {
    await dbConnect();
    const courses = await Course.find();
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST: Add a new course
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const newCourse = await Course.create(body);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}