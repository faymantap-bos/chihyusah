import { NextResponse } from 'next/server';
import { getStats } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Tambahkan 'await' di sini
    const stats = await getStats();

    return NextResponse.json({
      success: true,
      total: stats.total,
      today: stats.today,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        total: 0,
        today: 0,
      },
      { status: 500 }
    );
  }
}
