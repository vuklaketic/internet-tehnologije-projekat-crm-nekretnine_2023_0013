'use client';

import React, { useState, useEffect } from 'react';
import {
  RiAddLine,
  RiKanbanView,
  RiListCheck,
  RiUser3Line,
  RiBuildingLine,
  RiDeleteBinLine,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';

const STAGES = [
  { key: 'novi', label: 'Novi kontakt', color: 'border-blue-500' },
  { key: 'kontaktiran', label: 'Kontaktiran', color: 'border-sky-500' },
  { key: 'razgledanje', label: 'Razgledanje', color: 'border-purple-500' },
  { key: 'ponuda', label: 'Dostavljena ponuda', color: 'border-indigo-500' },
  { key: 'zakljuceno', label: 'Uspešno zaključeno', color: 'border-emerald-500' },
  { key: 'izgubljeno', label: 'Izgubljeno', color: 'border-rose-500' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    propertyId: '',
    stage: 'novi',
    valueEur: '',
    note: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, clientsRes, propsRes] = await Promise.all([
        fetch('/api/leads?pageSize=100'),
        fetch('/api/clients?pageSize=100'),
        fetch('/api/properties?pageSize=100'),
      ]);

      if (leadsRes.ok) {
        const d = await leadsRes.json();
        setLeads(d.items || []);
      }
      if (clientsRes.ok) {
        const d = await clientsRes.json();
        setClients(d.items || []);
        if (d.items?.length > 0 && !formData.clientId) {
          setFormData((prev) => ({ ...prev, clientId: d.items[0].id }));
        }
      }
      if (propsRes.ok) {
        const d = await propsRes.json();
        setProperties(d.items || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStageChange = async (leadId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === leadId ? { ...lead, stage: newStage } : lead))
        );
      }
    } catch (err) {
      console.error('Update stage error:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyId: formData.propertyId || null,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          clientId: clients[0]?.id || '',
          propertyId: '',
          stage: 'novi',
          valueEur: '',
          note: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error('Create lead error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Zaglavlje */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Prodajni levak (Kanban & Leads)
          </h1>
          <p className="text-sm text-slate-500">
            Pratite tok prodajnih pregovora, ponuda i realizacije sa kupcima i vlasnicima
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <RiKanbanView className="w-4 h-4" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <RiListCheck className="w-4 h-4" /> Lista
            </button>
          </div>

          <Button onClick={() => setIsModalOpen(true)}>
            <RiAddLine className="w-4 h-4" />
            Nova prodajna prilika
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          <p className="text-xs text-slate-500 mt-2">Učitavanje prodajnih prilika...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban prikaz */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stg) => {
            const stageLeads = leads.filter((l) => l.stage === stg.key);
            return (
              <div
                key={stg.key}
                className="bg-slate-100/70 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col min-w-[240px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {stg.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {lead.clientName || 'Klijent'}
                        </h4>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5"
                          title="Obriši"
                        >
                          <RiDeleteBinLine className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {lead.propertyTitle && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 line-clamp-1">
                          <RiBuildingLine className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          {lead.propertyTitle}
                        </p>
                      )}

                      {lead.note && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded">
                          {lead.note}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="font-extrabold text-blue-600">
                          {lead.valueEur ? `${Number(lead.valueEur).toLocaleString('sr-RS')} €` : '-'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {lead.agentName?.split(' ')[0]}
                        </span>
                      </div>

                      {/* Dropdown za promenu faze */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <select
                          value={lead.stage}
                          onChange={(e) => handleStageChange(lead.id, e.target.value)}
                          className="w-full text-[11px] font-medium py-1 px-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.key} value={s.key}>
                              Pomeri u: {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      Nema lead-ova
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tabelarni prikaz */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Klijent</th>
                  <th className="px-6 py-3.5">Nekretnina</th>
                  <th className="px-6 py-3.5">Faza prodaje</th>
                  <th className="px-6 py-3.5">Vrednost (€)</th>
                  <th className="px-6 py-3.5">Agent</th>
                  <th className="px-6 py-3.5">Beleška</th>
                  <th className="px-6 py-3.5 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {lead.clientName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {lead.propertyTitle || 'Nije vezano za stan'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.stage} />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {lead.valueEur ? `${Number(lead.valueEur).toLocaleString('sr-RS')} €` : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {lead.agentName || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {lead.note || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal za novu prodajnu priliku */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova prodajna prilika (Lead)"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Izaberite klijenta
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Izaberite klijenta...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Povezana nekretnina (opciono)
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Nema izabrane nekretnine</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.city} - {Number(p.priceEur).toLocaleString('sr-RS')} €)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Početna faza"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              options={STAGES.map((s) => ({ value: s.key, label: s.label }))}
            />
            <Input
              label="Očekivana vrednost (€)"
              type="number"
              placeholder="150000"
              value={formData.valueEur}
              onChange={(e) => setFormData({ ...formData, valueEur: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Beleška o toku pregovora
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dogovoreno razgledanje, ponuđena cena, komentari klijenta..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit" isLoading={formLoading}>
              Sačuvaj priliku
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
