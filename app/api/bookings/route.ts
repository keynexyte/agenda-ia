import { NextResponse } from 'next/server';
import { all } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bookings = await all('SELECT * FROM bookings ORDER BY date DESC, time_slot ASC');
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
