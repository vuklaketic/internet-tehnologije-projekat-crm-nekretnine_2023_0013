import React from 'react';
import Link from 'next/link';
import {
  RiCodeBoxLine,
  RiDownloadLine,
  RiShieldKeyholeLine,
  RiExternalLinkLine,
  RiArrowRightLine,
} from '@remixicon/react';

export default function ApiDocsPage() {
  const endpoints = [
    {
      group: 'Autentifikacija',
      routes: [
        {
          method: 'POST',
          path: '/api/auth/login',
          desc: 'Prijava korisnika sa email-om i lozinkom. Postavlja httpOnly cookie `auth`.',
          auth: false,
          req: '{ "email": "admin@crm.rs", "password": "..." }',
          res: '{ "user": { "id": "...", "fullName": "...", "role": "admin" } }',
        },
        {
          method: 'POST',
          path: '/api/auth/register',
          desc: 'Registracija novog agenta ili administratora u sistemu.',
          auth: false,
          req: '{ "fullName": "...", "email": "...", "password": "...", "role": "agent" }',
          res: '201 Created + auth cookie',
        },
        {
          method: 'GET',
          path: '/api/auth/me',
          desc: 'Vraća profil trenutno ulogovanog korisnika na osnovu JWT kolačića.',
          auth: true,
          res: '{ "user": { "id": "...", "email": "...", "role": "agent" } }',
        },
        {
          method: 'POST',
          path: '/api/auth/logout',
          desc: 'Odjava korisnika i brisanje `auth` kolačića.',
          auth: true,
          res: '{ "message": "Uspešno ste se odjavili" }',
        },
      ],
    },
    {
      group: 'Nekretnine (Katalog & CRUD)',
      routes: [
        {
          method: 'GET',
          path: '/api/properties',
          desc: 'Izlistavanje nekretnina sa podrškom za pretragu (?q=), filtere (?type=, ?status=) i paginaciju (?page=, ?pageSize=).',
          auth: true,
          res: '{ "items": [...], "total": 24, "page": 1, "pageSize": 10 }',
        },
        {
          method: 'POST',
          path: '/api/properties',
          desc: 'Kreiranje nove nekretnine. Validacija putem Zod biblioteke.',
          auth: true,
          req: '{ "title": "Stan Vračar", "type": "stan", "purpose": "prodaja", "priceEur": "150000", "areaM2": 65, "address": "...", "city": "Beograd" }',
          res: '201 Created',
        },
        {
          method: 'GET',
          path: '/api/properties/{id}',
          desc: 'Dohvatanje pojedinačne nekretnine sa podacima o zaduženom agentu.',
          auth: true,
          res: '{ "item": { "id": "...", "title": "...", "priceEur": "150000", ... } }',
        },
        {
          method: 'PUT',
          path: '/api/properties/{id}',
          desc: 'Izmena podataka nekretnine (RBAC: dozvoljeno administratoru ili zaduženom agentu).',
          auth: true,
          res: '{ "item": { ... } }',
        },
        {
          method: 'DELETE',
          path: '/api/properties/{id}',
          desc: 'Brisanje nekretnine iz baze podataka.',
          auth: true,
          res: '{ "message": "Nekretnina je uspešno obrisana" }',
        },
      ],
    },
    {
      group: 'Klijenti (RBAC zaštićeno)',
      routes: [
        {
          method: 'GET',
          path: '/api/clients',
          desc: 'Lista klijenata. Administrator vidi sve, agent vidi samo svoje dodeljene klijente.',
          auth: true,
          res: '{ "items": [...], "total": 12, "page": 1, "pageSize": 10 }',
        },
        {
          method: 'POST',
          path: '/api/clients',
          desc: 'Unos novog klijenta (kupac, prodavac ili zakupac).',
          auth: true,
          req: '{ "fullName": "Marko", "email": "...", "phone": "...", "type": "kupac", "budgetEur": "120000" }',
          res: '201 Created',
        },
        {
          method: 'DELETE',
          path: '/api/clients/{id}',
          desc: 'Brisanje klijenta iz sistema (RBAC provera).',
          auth: true,
          res: '200 OK',
        },
      ],
    },
    {
      group: 'Prodajne prilike (Leads & Kanban)',
      routes: [
        {
          method: 'GET',
          path: '/api/leads',
          desc: 'Izlistavanje prilika u prodajnom levku uz filter po fazama (?stage=novi, kontaktiran, razgledanje...).',
          auth: true,
          res: '{ "items": [...] }',
        },
        {
          method: 'POST',
          path: '/api/leads',
          desc: 'Kreiranje nove prodajne prilike vezivanjem klijenta i opcione nekretnine.',
          auth: true,
          req: '{ "clientId": "uuid", "propertyId": "uuid", "stage": "novi", "valueEur": "175000" }',
          res: '201 Created',
        },
        {
          method: 'PUT',
          path: '/api/leads/{id}',
          desc: 'Promena faze u levku (Kanban drag/drop tranzicija) ili ažuriranje vrednosti.',
          auth: true,
          req: '{ "stage": "ponuda" }',
          res: '200 OK',
        },
      ],
    },
    {
      group: 'Eksterni servisi i Razgledanja',
      routes: [
        {
          method: 'GET',
          path: '/api/currency',
          desc: 'Dohvatanje live kursa EUR/RSD preko open.er-api.com API-ja uz serversko keširanje od 1h.',
          auth: false,
          res: '{ "base": "EUR", "rsd": 117.2, "cached": true }',
        },
        {
          method: 'GET',
          path: '/api/viewings',
          desc: 'Lista zakazanih termina razgledanja nekretnina sa klijentima.',
          auth: true,
          res: '{ "items": [...] }',
        },
      ],
    },
  ];

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    POST: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Zaglavlje */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              OpenAPI 3.0.3
            </span>
            <span className="text-xs text-slate-400">REST Specifikacija</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            CRM Nekretnine API Dokumentacija
          </h1>
          <p className="text-sm text-slate-500">
            Pregled svih dostupnih Route Handlers endpoint-a, parametara i formata odgovora
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/openapi.json"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <RiCodeBoxLine className="w-4 h-4" /> Sirovi OpenAPI JSON
          </a>
        </div>
      </div>

      {/* Autentifikacioni mehanizam */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4">
        <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600">
          <RiShieldKeyholeLine className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Autentifikacija putem httpOnly Kolačića
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sve zaštićene rute zahtevaju validan JWT token koji se automatski šalje kroz kolačić pod nazivom{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 font-mono text-blue-600 rounded">
              auth
            </code>
            . Kolačić se generiše uspešnom prijavom na{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 rounded">
              /api/auth/login
            </code>
            .
          </p>
        </div>
      </div>

      {/* Grupe ruta */}
      <div className="space-y-8">
        {endpoints.map((group, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              {group.group}
            </h2>

            <div className="space-y-3">
              {group.routes.map((r, rIdx) => (
                <div
                  key={rIdx}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md border ${
                          methodColors[r.method]
                        }`}
                      >
                        {r.method}
                      </span>
                      <code className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
                        {r.path}
                      </code>
                    </div>
                    {r.auth && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                        <RiShieldKeyholeLine className="w-3.5 h-3.5" /> Zaštićena ruta
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">{r.desc}</p>

                  {(r.req || r.res) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      {r.req && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Telo zahteva (JSON)
                          </span>
                          <pre className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 font-mono text-slate-700 dark:text-slate-300 overflow-x-auto text-[11px]">
                            {r.req}
                          </pre>
                        </div>
                      )}
                      {r.res && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Odgovor servera
                          </span>
                          <pre className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 font-mono text-slate-700 dark:text-slate-300 overflow-x-auto text-[11px]">
                            {r.res}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
