import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === 'admin' && password === '2026') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: request.url.startsWith('https://'),
        sameSite: 'lax',
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Fallo al autenticar' }, { status: 500 });
  }
}
