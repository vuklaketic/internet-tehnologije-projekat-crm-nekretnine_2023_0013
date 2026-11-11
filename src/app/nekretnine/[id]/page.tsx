import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { properties, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  RiArrowLeftLine,
  RiMapPinLine,
  RiHomeLine,
  RiBuildingLine,
  RiUser3Line,
  RiCalendarLine,
  RiExchangeDollarLine,
  RiPhoneLine,
  RiMailLine,
} from '@remixicon/react';
import { StatusBadge } from '@/components/ui/status-badge';
import { PropertyMapWrapper } from '@/components/map/property-map-wrapper';
import { PropertyPriceCard } from '@/components/property/property-price-card';

async function getCurrencyRate() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR', {
      headers: { 'User-Agent': 'CRM-Nekretnine-FON/1.0' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 117.2;
    const data = await res.json();
    return data.rates?.RSD || 117.2;
  } catch {
    return 117.2;
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eurRsdRate = await getCurrencyRate();

  const [prop] = await db
    .select({
      id: properties.id,
      title: properties.title,
      type: properties.type,
      purpose: properties.purpose,
      priceEur: properties.priceEur,
      areaM2: properties.areaM2,
      rooms: properties.rooms,
      address: properties.address,
      city: properties.city,
      lat: properties.lat,
      lng: properties.lng,
      status: properties.status,
      description: properties.description,
      imageUrl: properties.imageUrl,
      createdAt: properties.createdAt,
      agentId: properties.agentId,
      agentName: users.fullName,
      agentEmail: users.email,
    })
    .from(properties)
    .leftJoin(users, eq(properties.agentId, users.id))
    .where(eq(properties.id, id));

  if (!prop) {
    notFound();
  }

  const priceEurNum = Number(prop.priceEur);
  const priceRsd = Math.round(priceEurNum * eurRsdRate);

  return (
    <div className="space-y-6 pb-16">
      {/* Dugme za povratak */}
      <Link
        href="/nekretnine"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <RiArrowLeftLine className="w-4 h-4" /> Nazad na katalog nekretnina
      </Link>

      {/* Glavni panel nekretnine */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {/* Slika ili zaglavlje */}
        <div className="relative h-72 md:h-96 w-full bg-slate-100 dark:bg-slate-800">
          {prop.imageUrl ? (
            <img
              src={prop.imageUrl}
              alt={prop.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <RiHomeLine className="w-16 h-16" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <StatusBadge status={prop.status} />
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-md">
              {prop.purpose === 'prodaja' ? 'Prodaja' : 'Izdavanje'}
            </span>
          </div>
        </div>

        {/* Detalji */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                {prop.type}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {prop.title}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-2">
                <RiMapPinLine className="w-4 h-4 text-blue-600 shrink-0" />
                {prop.address}, {prop.city}
              </p>
            </div>

            {/* Prikaz cene sa konverzijom valuta */}
            <PropertyPriceCard priceEur={prop.priceEur} />
          </div>

          {/* Grid parametara */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block">Kvadratura</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {prop.areaM2} m²
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block">Broj soba</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {prop.rooms}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block">Cena po kvadratu</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {prop.areaM2 > 0 ? Math.round(priceEurNum / prop.areaM2).toLocaleString('sr-RS') : '-'} €/m²
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block">Datum unosa</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {new Date(prop.createdAt).toLocaleDateString('sr-RS')}
              </span>
            </div>
          </div>

          {/* Opis */}
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Opis objekta</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {prop.description || 'Nema unetog detaljnog opisa za ovu nekretninu.'}
            </p>
          </div>

          {/* Zaduženi agent */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                <RiUser3Line className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Zaduženi licencirani agent:</p>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {prop.agentName || 'Agencija za nekretnine'}
                </h4>
              </div>
            </div>
            {prop.agentEmail && (
              <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 font-mono">
                <RiMailLine className="w-4 h-4 text-blue-500" /> {prop.agentEmail}
              </span>
            )}
          </div>

          {/* Zakazivanje razgledanja */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
            <div>
              <p className="text-sm font-bold text-blue-950 dark:text-blue-100">
                Želite da pogledate ovu nekretninu uživo?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                Zakažite direktan termin razgledanja sa nadležnim agentom.
              </p>
            </div>
            <Link
              href="/razgledanja"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs shrink-0 flex items-center justify-center gap-1.5"
            >
              <RiCalendarLine className="w-4 h-4" />
              Zakaži termin razgledanja
            </Link>
          </div>

          {/* Lokacija na mapi (Nominatim Geocoding + Leaflet) */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Interaktivna mapa lokacije
                </h2>
                <p className="text-xs text-slate-500">
                  Automatsko geokodiranje adrese preko OpenStreetMap (Nominatim API)
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {prop.address}, {prop.city}
              </span>
            </div>

            <PropertyMapWrapper
              address={prop.address}
              city={prop.city}
              initialLat={prop.lat}
              initialLng={prop.lng}
              title={prop.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
