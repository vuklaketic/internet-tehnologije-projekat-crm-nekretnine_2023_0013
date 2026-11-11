'use client';

import React from 'react';
import { useCurrencyContext, CurrencySelector } from '@/context/currency-context';
import { RiExchangeDollarLine } from '@remixicon/react';

interface PropertyPriceCardProps {
  priceEur: number | string;
}

export function PropertyPriceCard({ priceEur }: PropertyPriceCardProps) {
  const { formatPrice, selectedCurrency, rates } = useCurrencyContext();
  const numEur = Number(priceEur) || 0;
  const numRsd = Math.round(numEur * (rates.RSD || 117.2));

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-right space-y-2">
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-slate-400">Valuta:</span>
        <CurrencySelector />
      </div>

      <div className="text-2xl md:text-3xl font-extrabold text-blue-600">
        {formatPrice(numEur)}
      </div>

      {selectedCurrency !== 'EUR' && (
        <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
          <RiExchangeDollarLine className="w-3.5 h-3.5 text-slate-400" />
          Osnovna cena: {numEur.toLocaleString('sr-RS')} €
        </div>
      )}

      {selectedCurrency !== 'RSD' && (
        <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
          <RiExchangeDollarLine className="w-3.5 h-3.5 text-emerald-500" />
          cca {numRsd.toLocaleString('sr-RS')} RSD
        </div>
      )}
    </div>
  );
}
