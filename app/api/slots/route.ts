import { NextResponse } from 'next/server';
import { all } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    const bookings = await all('SELECT time_slot FROM bookings WHERE date = ?', [date]);
    const bookedSlots = bookings.map((b: any) => b.time_slot);

    // All possible slots
    const allSlots = [
      '08:00 AM - 09:00 AM',
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '12:00 PM - 01:00 PM',
    ];

    const slotsData = allSlots.map(slot => ({
      time: slot,
      available: !bookedSlots.includes(slot)
    }));

    return NextResponse.json({ date, slots: slotsData });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
