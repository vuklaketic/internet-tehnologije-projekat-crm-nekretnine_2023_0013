import Link from 'next/link';
import { db } from '@/db';
import { properties, clients, leads, viewings, users } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { sql, eq } from 'drizzle-orm';
import {
  RiBuildingLine,
  RiUserFollowLine,
  RiKanbanView,
  RiCalendarLine,
  RiArrowRightLine,
  RiExchangeDollarLine,
} from '@remixicon/react';
import { StatusBadge } from '@/components/ui/status-badge';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

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

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const eurRsdRate = await getCurrencyRate();

  // Statistika
  const [propCount] = await db.select({ count: sql<number>`count(*)::int` }).from(properties);
  const [clientCount] = await db.select({ count: sql<number>`count(*)::int` }).from(clients);
  const [leadCount] = await db.select({ count: sql<number>`count(*)::int` }).from(leads);
  const [viewingCount] = await db.select({ count: sql<number>`count(*)::int` }).from(viewings);

  // Podaci za grafikon: lead-ovi po fazama
  const rawLeadsByStage = await db
    .select({
      stage: leads.stage,
      count: sql<number>`count(*)::int`,
      totalValue: sql<number>`coalesce(sum(cast(${leads.valueEur} as numeric)), 0)::float`,
    })
    .from(leads)
    .groupBy(leads.stage);

  const stageLabels: Record<string, string> = {
    novi: 'Novi',
    kontaktiran: 'Kontaktiran',
    razgledanje: 'Razgledanje',
    ponuda: 'Ponuda',
    zakljuceno: 'Zaključeno',
    izgubljeno: 'Izgubljeno',
  };

  const stageData = Object.keys(stageLabels).map((key) => {
    const found = rawLeadsByStage.find((item) => item.stage === key);
    return {
      name: stageLabels[key],
      count: found ? found.count : 0,
      value: found ? found.totalValue : 0,
    };
  });

  // Podaci za grafikon: nekretnine po tipovima
  const rawPropsByType = await db
    .select({
      type: properties.type,
      count: sql<number>`count(*)::int`,
    })
    .from(properties)
    .groupBy(properties.type);

  const typeLabels: Record<string, string> = {
    stan: 'Stanovi',
    kuca: 'Kuće',
    lokal: 'Lokali',
    plac: 'Placevi',
  };

  const typeData = Object.keys(typeLabels).map((key) => {
    const found = rawPropsByType.find((item) => item.type === key);
    return {
      name: typeLabels[key],
      count: found ? found.count : 0,
    };
  });

  // Podaci za grafikon: učinak agenata
  const rawAgentPerformance = await db
    .select({
      agentName: sql<string>`coalesce(${users.fullName}, 'Nedodeljeno')`,
      dealsCount: sql<number>`count(*)::int`,
      volumeEur: sql<number>`coalesce(sum(cast(${leads.valueEur} as numeric)), 0)::float`,
    })
    .from(leads)
    .leftJoin(users, eq(leads.agentId, users.id))
    .groupBy(users.fullName);

  const agentData = rawAgentPerformance.map((item) => ({
    agentName: item.agentName,
    dealsCount: item.dealsCount,
    volumeEur: item.volumeEur,
  }));

  // Najnovije nekretnine
  const recentProperties = await db
    .select()
    .from(properties)
    .orderBy(sql`${properties.createdAt} desc`)
    .limit(4);

  // Najnovije prodajne prilike (leads)
  const recentLeads = await db
    .select({
      id: leads.id,
      stage: leads.stage,
      valueEur: leads.valueEur,
      clientName: clients.fullName,
      propertyTitle: properties.title,
    })
    .from(leads)
    .leftJoin(clients, eq(leads.clientId, clients.id))
    .leftJoin(properties, eq(leads.propertyId, properties.id))
    .orderBy(sql`${leads.createdAt} desc`)
    .limit(4);

  const stats = [
    {
      title: 'Ukupno nekretnina',
      value: propCount?.count || 0,
      icon: RiBuildingLine,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60',
      href: '/nekretnine',
    },
    {
      title: 'Baza klijenata',
      value: clientCount?.count || 0,
      icon: RiUserFollowLine,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60',
      href: '/klijenti',
    },
    {
      title: 'Prodajne prilike (Leads)',
      value: leadCount?.count || 0,
      icon: RiKanbanView,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60',
      href: '/leadovi',
    },
    {
      title: 'Zakazana razgledanja',
      value: viewingCount?.count || 0,
      icon: RiCalendarLine,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60',
      href: '/razgledanja',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Zaglavlje */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dobrodošli nazad, {user?.fullName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pregled ključnih metrika poslovanja agencije za nekretnine
          </p>
        </div>

        {/* EUR / RSD API Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <RiExchangeDollarLine className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              Zvanični srednji kurs (API)
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              1 EUR = {eurRsdRate.toFixed(2)} RSD
            </span>
          </div>
        </div>
      </div>

      {/* Kartice sa statistikama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              href={s.href}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{s.title}</span>
                <div className={`p-2 rounded-xl ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {s.value}
                </span>
                <span className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                  Pregled <RiArrowRightLine className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Interaktivni grafikoni (Recharts) */}
      <DashboardCharts stageData={stageData} typeData={typeData} agentData={agentData} />

      {/* Brze akcije i pregledi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Poslednje nekretnine */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Nedavno dodate nekretnine
            </h2>
            <Link
              href="/nekretnine"
              className="text-xs font-medium text-blue-600 hover:text-blue-500 inline-flex items-center gap-1"
            >
              Sve nekretnine <RiArrowRightLine className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentProperties.map((prop) => (
              <div key={prop.id} className="py-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {prop.city} • {prop.areaM2} m² • {prop.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">
                    {Number(prop.priceEur).toLocaleString('sr-RS')} €
                  </p>
                  <StatusBadge status={prop.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Poslednji leadovi */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Aktivne prodajne prilike (Leads)
            </h2>
            <Link
              href="/leadovi"
              className="text-xs font-medium text-purple-600 hover:text-purple-500 inline-flex items-center gap-1"
            >
              Kanban tabla <RiArrowRightLine className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="py-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {lead.clientName || 'Nepoznat klijent'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lead.propertyTitle || 'Opšte interesovanje'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {lead.valueEur ? `${Number(lead.valueEur).toLocaleString('sr-RS')} €` : '-'}
                  </p>
                  <StatusBadge status={lead.stage} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
