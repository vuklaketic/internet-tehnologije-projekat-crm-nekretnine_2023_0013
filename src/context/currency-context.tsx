'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'EUR' | 'RSD' | 'USD' | 'CHF' | 'GBP';

interface CurrencyContextType {
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (currency: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  loading: boolean;
  convertPrice: (amountInEur: number | string) => number;
  formatPrice: (amountInEur: number | string) => string;
}

const DEFAULT_RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  RSD: 117.2,
  USD: 1.08,
  CHF: 0.96,
  GBP: 0.85,
};

const SYMBOLS: Record<CurrencyCode, string> = {
  EUR: '€',
  RSD: 'RSD',
  USD: '$',
  CHF: 'CHF',
  GBP: '£',
};

const CurrencyContext = createContext<CurrencyContextType>({
  selectedCurrency: 'EUR',
  setSelectedCurrency: () => {},
  rates: DEFAULT_RATES,
  loading: true,
  convertPrice: (amount) => Number(amount) || 0,
  formatPrice: (amount) => `${Number(amount) || 0} €`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>('EUR');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Provera da li je valuta sačuvana u localStorage
    try {
      const saved = localStorage.getItem('crm_currency') as CurrencyCode | null;
      if (saved && DEFAULT_RATES[saved]) {
        setSelectedCurrencyState(saved);
      }
    } catch {
      // Ignoriši ako localStorage nije dostupan
    }

    async function loadRates() {
      try {
        const res = await fetch('/api/currency');
        if (res.ok) {
          const data = await res.json();
          if (data.rates) {
            setRates((prev) => ({
              ...prev,
              ...data.rates,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load currency rates:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRates();
  }, []);

  const setSelectedCurrency = (curr: CurrencyCode) => {
    setSelectedCurrencyState(curr);
    try {
      localStorage.setItem('crm_currency', curr);
    } catch {}
  };

  const convertPrice = (amountInEur: number | string): number => {
    const num = Number(amountInEur) || 0;
    const rate = rates[selectedCurrency] || 1;
    return Math.round(num * rate);
  };

  const formatPrice = (amountInEur: number | string): string => {
    const converted = convertPrice(amountInEur);
    const symbol = SYMBOLS[selectedCurrency];
    const formattedNum = converted.toLocaleString('sr-RS');

    if (selectedCurrency === 'USD' || selectedCurrency === 'GBP') {
      return `${symbol}${formattedNum}`;
    }
    return `${formattedNum} ${symbol}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        rates,
        loading,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyContext() {
  return useContext(CurrencyContext);
}

export function CurrencySelector({ className = '' }: { className?: string }) {
  const { selectedCurrency, setSelectedCurrency, rates } = useCurrencyContext();

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <select
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
        aria-label="Izbor valute za konverziju cena"
        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="EUR">EUR (€)</option>
        <option value="RSD">RSD ({rates.RSD?.toFixed(1) || 117.2})</option>
        <option value="USD">USD ($)</option>
        <option value="CHF">CHF</option>
        <option value="GBP">GBP (£)</option>
      </select>
    </div>
  );
}
