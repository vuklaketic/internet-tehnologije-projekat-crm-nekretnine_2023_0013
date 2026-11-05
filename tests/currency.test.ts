import { describe, it, expect } from 'vitest';

describe('Konverzija valuta & Pomoćne funkcije', () => {
  const fixedRate = 117.25;

  const eurToRsd = (amountInEur: number | string, rate: number = fixedRate): number => {
    const num = Number(amountInEur) || 0;
    return Math.round(num * rate);
  };

  const rsdToEur = (amountInRsd: number | string, rate: number = fixedRate): number => {
    const num = Number(amountInRsd) || 0;
    return rate > 0 ? Math.round((num / rate) * 100) / 100 : 0;
  };

  it('ispravno konvertuje EUR u RSD po zadatom kursu', () => {
    expect(eurToRsd(100, 117.2)).toBe(11720);
    expect(eurToRsd(150000, 117.25)).toBe(17587500);
    expect(eurToRsd(0, 117.2)).toBe(0);
  });

  it('ispravno konvertuje RSD u EUR sa zaokruživanjem na dve decimale', () => {
    expect(rsdToEur(11720, 117.2)).toBe(100);
    expect(rsdToEur(17587500, 117.25)).toBe(150000);
  });

  it('bezbedno rukuje neispravnim i praznim vrednostima', () => {
    expect(eurToRsd('nevalidno')).toBe(0);
    expect(rsdToEur('xyz')).toBe(0);
    expect(rsdToEur(1000, 0)).toBe(0);
  });
});

describe('Validacija parametara nekretnina', () => {
  const allowedTypes = ['stan', 'kuca', 'lokal', 'plac'];
  const allowedStatuses = ['slobodno', 'rezervisano', 'prodato'];

  it('ispravno validira dozvoljene tipove nekretnina', () => {
    expect(allowedTypes.includes('stan')).toBe(true);
    expect(allowedTypes.includes('kuca')).toBe(true);
    expect(allowedTypes.includes('automobil')).toBe(false);
  });

  it('ispravno validira statuse nekretnina', () => {
    expect(allowedStatuses.includes('slobodno')).toBe(true);
    expect(allowedStatuses.includes('arhivirano')).toBe(false);
  });

  it('proverava minimalne numeričke vrednosti za cenu i kvadraturu', () => {
    const isValidProperty = (priceEur: number, areaM2: number) => {
      return priceEur > 0 && areaM2 > 0;
    };

    expect(isValidProperty(150000, 65)).toBe(true);
    expect(isValidProperty(0, 65)).toBe(false);
    expect(isValidProperty(150000, -10)).toBe(false);
  });
});
