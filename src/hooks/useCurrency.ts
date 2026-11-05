'use client';

import { useState, useEffect } from 'react';

export function useCurrency() {
  const [rate, setRate] = useState<number>(117.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRate() {
      try {
        const res = await fetch('/api/currency');
        if (!res.ok) {
          throw new Error('Greška pri dohvatanju kursa');
        }
        const data = await res.json();
        if (isMounted && data.rate) {
          setRate(data.rate);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Greška');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRate();

    return () => {
      isMounted = false;
    };
  }, []);

  const eurToRsd = (amountInEur: number | string): number => {
    const num = Number(amountInEur) || 0;
    return Math.round(num * rate);
  };

  const rsdToEur = (amountInRsd: number | string): number => {
    const num = Number(amountInRsd) || 0;
    return rate > 0 ? Math.round((num / rate) * 100) / 100 : 0;
  };

  return {
    rate,
    loading,
    error,
    eurToRsd,
    rsdToEur,
  };
}
