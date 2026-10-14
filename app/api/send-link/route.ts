import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationLink } from '@/lib/am';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;
    const cookie = typeof body.cookie === 'string' ? body.cookie : undefined;

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Email tidak valid.' },
        { status: 400 }
      );
    }

    const em = email.trim().toLowerCase();
    const result = await sendVerificationLink(em, cookie);

    return NextResponse.json({
      success: true,
      email: em,
      cookie: result.cookie,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Gagal mengirim link verifikasi.',
      },
      { status: 500 }
    );
  }
}
