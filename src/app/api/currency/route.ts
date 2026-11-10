import { NextResponse } from 'next/server';

let cachedRates: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 sat

const DEFAULT_RATES: Record<string, number> = {
  EUR: 1,
  RSD: 117.2,
  USD: 1.08,
  CHF: 0.96,
  GBP: 0.85,
};

export async function GET() {
  const now = Date.now();
  if (cachedRates && now - cachedRates.timestamp < CACHE_DURATION) {
    return NextResponse.json({
      base: 'EUR',
      rates: cachedRates.rates,
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
    const fetchedRates = data.rates || {};

    const rates: Record<string, number> = {
      EUR: 1,
      RSD: Number(fetchedRates.RSD) || DEFAULT_RATES.RSD,
      USD: Number(fetchedRates.USD) || DEFAULT_RATES.USD,
      CHF: Number(fetchedRates.CHF) || DEFAULT_RATES.CHF,
      GBP: Number(fetchedRates.GBP) || DEFAULT_RATES.GBP,
    };

    cachedRates = { rates, timestamp: now };

    return NextResponse.json({
      base: 'EUR',
      rates,
      cached: false,
    });
  } catch (err: any) {
    console.error('Currency API error:', err);
    return NextResponse.json({
      base: 'EUR',
      rates: cachedRates ? cachedRates.rates : DEFAULT_RATES,
      cached: true,
      fallback: true,
    });
  }
}
