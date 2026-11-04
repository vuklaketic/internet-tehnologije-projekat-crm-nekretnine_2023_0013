'use client';

import React, { useState, useEffect } from 'react';
import {
  RiAddLine,
  RiSearchLine,
  RiFilter3Line,
  RiBuildingLine,
  RiMapPinLine,
  RiHomeLine,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);

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

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      if (type) params.set('type', type);

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, q, status, type]);

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
        fetchProperties();
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
      if (res.ok) fetchProperties();
    } catch (err) {
      console.error('Delete error:', err);
    }
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
        <Button onClick={() => setIsModalOpen(true)}>
          <RiAddLine className="w-4 h-4" />
          Dodaj novu nekretninu
        </Button>
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
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Slika ili placeholder */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {prop.imageUrl ? (
                    <img
                      src={prop.imageUrl}
                      alt={prop.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
                </div>

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

                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                    {prop.title}
                  </h3>

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
                <span className="text-[11px] text-slate-400">
                  {new Date(prop.createdAt).toLocaleDateString('sr-RS')}
                </span>
                <button
                  onClick={() => handleDelete(prop.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium p-1 flex items-center gap-1"
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

          <Input
            label="URL Slike"
            placeholder="https://images.unsplash.com/..."
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />

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
