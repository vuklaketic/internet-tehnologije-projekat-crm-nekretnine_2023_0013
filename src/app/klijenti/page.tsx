'use client';

import React, { useState, useEffect } from 'react';
import {
  RiAddLine,
  RiSearchLine,
  RiUserFollowLine,
  RiMailLine,
  RiPhoneLine,
  RiDeleteBinLine,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    type: 'kupac',
    budgetEur: '',
    notes: '',
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (q) params.set('q', q);
      if (type) params.set('type', type);

      const res = await fetch(`/api/clients?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Fetch clients error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, q, type]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          type: 'kupac',
          budgetEur: '',
          notes: '',
        });
        fetchClients();
      }
    } catch (err) {
      console.error('Create client error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovog klijenta?')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (res.ok) fetchClients();
    } catch (err) {
      console.error('Delete client error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Zaglavlje */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Evidencija klijenata
          </h1>
          <p className="text-sm text-slate-500">
            Upravljanje kupcima, prodavcima i zakupcima nekretnina
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <RiAddLine className="w-4 h-4" />
          Dodaj novog klijenta
        </Button>
      </div>

      {/* Pretraga i filteri */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <RiSearchLine className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pretraga po imenu, email-u ili broju telefona..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Svi klijenti</option>
          <option value="kupac">Kupci</option>
          <option value="prodavac">Prodavci</option>
          <option value="zakupac">Zakupci</option>
        </select>
      </div>

      {/* Tabela klijenata */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          <p className="text-xs text-slate-500 mt-2">Učitavanje klijenata...</p>
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          title="Nema pronađenih klijenata"
          description="Nema unetih klijenata koji odgovaraju pretrazi. Dodajte novog klijenta u sistem."
          action={
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              Dodaj klijenta
            </Button>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Klijent</th>
                  <th className="px-6 py-3.5">Tip</th>
                  <th className="px-6 py-3.5">Kontakt</th>
                  <th className="px-6 py-3.5">Budžet</th>
                  <th className="px-6 py-3.5">Agent</th>
                  <th className="px-6 py-3.5">Napomena</th>
                  <th className="px-6 py-3.5 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {client.fullName}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={client.type} />
                    </td>
                    <td className="px-6 py-4 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <RiMailLine className="w-3.5 h-3.5 text-slate-400" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <RiPhoneLine className="w-3.5 h-3.5 text-slate-400" />
                        {client.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {client.budgetEur ? `${Number(client.budgetEur).toLocaleString('sr-RS')} €` : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {client.ownerName || 'Nedodeljeno'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {client.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Obriši klijenta"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Modal za novog klijenta */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Unos novog klijenta"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Ime i prezime"
            placeholder="Marko Marković"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            label="Email adresa"
            type="email"
            placeholder="klijent@primer.rs"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Broj telefona"
            placeholder="+381 64 000 0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tip klijenta"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'kupac', label: 'Kupac' },
                { value: 'prodavac', label: 'Prodavac' },
                { value: 'zakupac', label: 'Zakupac' },
              ]}
            />
            <Input
              label="Okvirni budžet (€)"
              type="number"
              placeholder="120000"
              value={formData.budgetEur}
              onChange={(e) => setFormData({ ...formData, budgetEur: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Interesovanja i napomene
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Zahtevi po pitanju lokacije, strukture, način finansiranja..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit" isLoading={formLoading}>
              Sačuvaj klijenta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
