import { NextResponse } from 'next/server';
import { run } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const result = await run("DELETE FROM bookings WHERE status = 'Terminada'");
    return NextResponse.json({ success: true, changes: result.changes });
  } catch (error) {
    console.error('Error cleaning bookings:', error);
    return NextResponse.json({ error: 'Failed to clean bookings' }, { status: 500 });
  }
}
