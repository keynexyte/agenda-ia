import { NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    await run('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
