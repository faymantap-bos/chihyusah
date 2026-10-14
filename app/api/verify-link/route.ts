import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/am';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email;
    const rawLink = body.magicLink || body.link;
    const cookie = typeof body.cookie === 'string' ? body.cookie.trim() : '';

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email wajib diisi.' },
        { status: 400 }
      );
    }

    if (!rawLink || typeof rawLink !== 'string' || !rawLink.trim()) {
      return NextResponse.json(
        { success: false, message: 'Link dari email wajib diisi.' },
        { status: 400 }
      );
    }

    const em = email.trim().toLowerCase();
    const result = await verifyMagicLink(em, rawLink.trim(), cookie);
    const premiumActive = result.userData.status === 'ACTIVE';
    const statsWarning = result.userData.statsWarning;

    return NextResponse.json({
      success: premiumActive,
      ok: premiumActive,
      authenticated: true,
      premiumActive,
      message: premiumActive
        ? `Verifikasi berhasil, Alight Motion Premium VIP aktif sampai ${result.userData.validUntil}.${statsWarning ? ' Statistik sementara tidak tersedia.' : ''}`
        : 'Login berhasil, tetapi aktivasi Premium tidak berhasil.',
      data: result.userData,
      userData: result.userData,
      raw: result.raw,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        ok: false,
        authenticated: false,
        premiumActive: false,
        message: error.message || 'Terjadi kesalahan saat memverifikasi link.',
      },
      { status: 400 }
    );
  }
}
