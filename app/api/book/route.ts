import { NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, department, date, time_slot } = body;

    if (!name || !department || !date || !time_slot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await run(
      'INSERT INTO bookings (name, department, date, time_slot) VALUES (?, ?, ?, ?)',
      [name, department, date, time_slot]
    );

    return NextResponse.json({ success: true, message: 'Booking confirmed' });
  } catch (error: any) {
    console.error('Booking error:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Time slot already booked' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
