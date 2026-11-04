import { NextResponse } from 'next/server';

let cachedRate: { rsd: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 sat

export async function GET() {
  const now = Date.now();
  if (cachedRate && now - cachedRate.timestamp < CACHE_DURATION) {
    return NextResponse.json({
      base: 'EUR',
      rsd: cachedRate.rsd,
      cached: true,
    });
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR', {
      headers: { 'User-Agent': 'CRM-Nekretnine-FON/1.0' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error('Eksterni API za kurs nije dostupan');
    }

    const data = await res.json();
    const rsd = data.rates?.RSD || 117.2;

    cachedRate = { rsd, timestamp: now };

    return NextResponse.json({
      base: 'EUR',
      rsd,
      cached: false,
    });
  } catch (err: any) {
    console.error('Currency API error:', err);
    // Siguran fallback
    return NextResponse.json({
      base: 'EUR',
      rsd: cachedRate ? cachedRate.rsd : 117.2,
      cached: true,
      fallback: true,
    });
  }
}
