import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { phone, role } = await req.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Upsert user based on phone number
    const user = await prisma.user.upsert({
      where: { phone },
      update: { role: role || 'user' },
      create: { phone, role: role || 'user' }
    });

    return NextResponse.json({ message: 'User registered successfully', user }, { status: 200 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
