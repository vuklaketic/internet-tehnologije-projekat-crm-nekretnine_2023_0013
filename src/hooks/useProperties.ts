'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UsePropertiesParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  type?: string;
  sort?: string;
}

export function useProperties({
  page = 1,
  pageSize = 6,
  q = '',
  status = '',
  type = '',
  sort = 'newest',
}: UsePropertiesParams = {}) {
  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      if (type) params.set('type', type);
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Neuspešno dohvatanje nekretnina');
      }
      const data = await res.json();
      setProperties(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error('useProperties fetch error:', err);
      setError(err.message || 'Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, status, type, sort]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    total,
    loading,
    error,
    refetch: fetchProperties,
  };
}
