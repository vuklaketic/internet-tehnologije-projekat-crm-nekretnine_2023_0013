'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RiAddLine,
  RiSearchLine,
  RiMapPinLine,
  RiHomeLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiExternalLinkLine,
  RiUploadCloud2Line,
  RiCloseLine,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { useProperties } from '@/hooks/useProperties';

export default function PropertiesPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  // Korišćenje sopstvenog custom hook-a za dohvatanje podataka
  const { properties, total, loading, refetch } = useProperties({
    page,
    pageSize,
    q,
    status,
    type,
  });

  // Modal za dodavanje nekretnine
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'stan',
    purpose: 'prodaja',
    priceEur: '',
    areaM2: '',
    rooms: '2',
    address: '',
    city: 'Beograd',
    status: 'slobodno',
    description: '',
    imageUrl: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (res.ok && result.url) {
        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      } else {
        setUploadError(result.error || 'Neuspešno otpremanje slike');
      }
    } catch {
      setUploadError('Greška pri komunikaciji sa serverom');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          areaM2: Number(formData.areaM2),
          priceEur: formData.priceEur,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          type: 'stan',
          purpose: 'prodaja',
          priceEur: '',
          areaM2: '',
          rooms: '2',
          address: '',
          city: 'Beograd',
          status: 'slobodno',
          description: '',
          imageUrl: '',
        });
        refetch();
      }
    } catch (err) {
      console.error('Create error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu nekretninu?')) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) refetch();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // CSV Export funkcionalnost
  const handleExportCSV = () => {
    if (properties.length === 0) return;
    const headers = ['ID', 'Naslov', 'Tip', 'Namena', 'Cena (EUR)', 'Kvadratura (m2)', 'Sobe', 'Adresa', 'Grad', 'Status'];
    const rows = properties.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.type,
      p.purpose,
      p.priceEur,
      p.areaM2,
      p.rooms,
      `"${p.address.replace(/"/g, '""')}"`,
      `"${p.city.replace(/"/g, '""')}"`,
      p.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nekretnine-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Naslov i akcija */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Katalog nekretnina
          </h1>
          <p className="text-sm text-slate-500">
            Pregled, pretraga i ažuriranje svih stambenih i poslovnih objekata u ponudi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} disabled={properties.length === 0}>
            <RiDownloadLine className="w-4 h-4" />
            Izvezi CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <RiAddLine className="w-4 h-4" />
            Dodaj novu nekretninu
          </Button>
        </div>
      </div>

      {/* Filteri i pretraga */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <RiSearchLine className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pretraga po naslovu, adresi ili gradu..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Svi tipovi</option>
            <option value="stan">Stanovi</option>
            <option value="kuca">Kuće</option>
            <option value="lokal">Lokali</option>
            <option value="plac">Placevi</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Svi statusi</option>
            <option value="slobodno">Slobodno</option>
            <option value="rezervisano">Rezervisano</option>
            <option value="prodato">Prodato</option>
          </select>
        </div>
      </div>

      {/* Prikaz nekretnina */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          <p className="text-xs text-slate-500 mt-2">Učitavanje nekretnina...</p>
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          title="Nema pronađenih nekretnina"
          description="Pokušajte da izmenite filtere pretrage ili dodajte novu nekretninu u bazu."
          action={
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              Dodaj nekretninu
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Slika ili placeholder */}
                <Link href={`/nekretnine/${prop.id}`} className="block relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {prop.imageUrl ? (
                    <img
                      src={prop.imageUrl}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <RiHomeLine className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={prop.status} />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    {prop.purpose === 'prodaja' ? 'Prodaja' : 'Izdavanje'}
                  </div>
                </Link>

                {/* Informacije */}
                <div className="p-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-extrabold text-blue-600">
                      {Number(prop.priceEur).toLocaleString('sr-RS')} €
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {prop.type}
                    </span>
                  </div>

                  <Link href={`/nekretnine/${prop.id}`}>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 hover:text-blue-600 transition-colors">
                      {prop.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <RiMapPinLine className="w-4 h-4 shrink-0 text-slate-400" />
                    {prop.address}, {prop.city}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span>{prop.areaM2} m²</span>
                    <span>{prop.rooms} sobe</span>
                    <span>Agent: {prop.agentName || 'Agencija'}</span>
                  </div>
                </div>
              </div>

              {/* Akcije na dnu */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href={`/nekretnine/${prop.id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Detalji i mapa <RiExternalLinkLine className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleDelete(prop.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium p-1 flex items-center gap-1 cursor-pointer"
                >
                  <RiDeleteBinLine className="w-3.5 h-3.5" /> Obriši
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginacija */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Modal za novu nekretninu */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dodavanje nove nekretnine"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Naslov oglasa"
            placeholder="npr. Trosoban lux stan na Vračaru"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tip nekretnine"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'stan', label: 'Stan' },
                { value: 'kuca', label: 'Kuća' },
                { value: 'lokal', label: 'Lokal' },
                { value: 'plac', label: 'Plac' },
              ]}
            />
            <Select
              label="Namena"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              options={[
                { value: 'prodaja', label: 'Prodaja' },
                { value: 'izdavanje', label: 'Izdavanje' },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Cena (€)"
              type="number"
              placeholder="150000"
              value={formData.priceEur}
              onChange={(e) => setFormData({ ...formData, priceEur: e.target.value })}
              required
            />
            <Input
              label="Kvadratura (m²)"
              type="number"
              placeholder="65"
              value={formData.areaM2}
              onChange={(e) => setFormData({ ...formData, areaM2: e.target.value })}
              required
            />
            <Input
              label="Broj soba"
              type="text"
              placeholder="2.5"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Adresa"
              placeholder="Bulevar Kralja Aleksandra 12"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <Input
              label="Grad"
              placeholder="Beograd"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>

          {/* Otpremanje slike ili unos URL-a */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Fotografija nekretnine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opcija 1: Upload fajla */}
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-3 text-center bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <RiUploadCloud2Line className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {uploadingImage ? 'Otpremanje u toku...' : 'Izaberite sliku sa računara'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP do 5MB</span>
              </div>

              {/* Opcija 2: Direktni URL */}
              <div>
                <Input
                  label="Ili unesite direktan URL"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-500 font-medium">{uploadError}</p>
            )}

            {formData.imageUrl && (
              <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {/* Pregled slike */}
                <div className="relative w-12 h-12 rounded overflow-hidden bg-slate-200 shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt="Pregled"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate text-slate-600 dark:text-slate-400">
                    {formData.imageUrl}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Slika izabrana
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Ukloni sliku"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Opis nekretnine
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detaljan opis lokacije, opremljenosti i prednosti nekretnine..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit" isLoading={formLoading}>
              Sačuvaj nekretninu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
