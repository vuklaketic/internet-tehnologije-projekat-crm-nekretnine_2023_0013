'use client';

import React, { useState, useEffect } from 'react';
import {
  RiAddLine,
  RiCalendarLine,
  RiBuildingLine,
  RiUser3Line,
  RiPhoneLine,
  RiTimeLine,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';

export default function ViewingsPage() {
  const [viewings, setViewings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    propertyId: '',
    scheduledAt: '',
    note: '',
    status: 'zakazano',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, cRes, pRes] = await Promise.all([
        fetch('/api/viewings'),
        fetch('/api/clients?pageSize=100'),
        fetch('/api/properties?pageSize=100'),
      ]);
      if (vRes.ok) {
        const d = await vRes.json();
        setViewings(d.items || []);
      }
      if (cRes.ok) {
        const d = await cRes.json();
        setClients(d.items || []);
        if (d.items?.length > 0 && !formData.clientId) {
          setFormData((prev) => ({ ...prev, clientId: d.items[0].id }));
        }
      }
      if (pRes.ok) {
        const d = await pRes.json();
        setProperties(d.items || []);
        if (d.items?.length > 0 && !formData.propertyId) {
          setFormData((prev) => ({ ...prev, propertyId: d.items[0].id }));
        }
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/viewings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          clientId: clients[0]?.id || '',
          propertyId: properties[0]?.id || '',
          scheduledAt: '',
          note: '',
          status: 'zakazano',
        });
        fetchData();
      }
    } catch (err) {
      console.error('Create viewing error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Zaglavlje */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Raspored razgledanja nekretnina
          </h1>
          <p className="text-sm text-slate-500">
            Termini obilaska objekata na terenu sa klijentima i agentima
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <RiAddLine className="w-4 h-4" />
          Zakaži novo razgledanje
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          <p className="text-xs text-slate-500 mt-2">Učitavanje rasporeda...</p>
        </div>
      ) : viewings.length === 0 ? (
        <EmptyState
          title="Nema zakazanih razgledanja"
          description="Trenutno nema zakazanih termina za obilazak. Zakažite novo razgledanje sa klijentom."
          action={
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              Zakaži razgledanje
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewings.map((v) => (
            <div
              key={v.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                  <RiTimeLine className="w-4 h-4" />
                  {new Date(v.scheduledAt).toLocaleString('sr-RS', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
                <StatusBadge status={v.status} />
              </div>

              <div className="space-y-2 border-y border-slate-100 dark:border-slate-800 py-3">
                <div className="flex items-start gap-2">
                  <RiBuildingLine className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {v.propertyTitle}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {v.propertyAddress}, {v.propertyCity}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <RiUser3Line className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {v.clientName}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <RiPhoneLine className="w-3.5 h-3.5" /> {v.clientPhone}
                    </p>
                  </div>
                </div>
              </div>

              {v.note && (
                <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                  "{v.note}"
                </p>
              )}

              <div className="text-[11px] text-slate-400 text-right">
                Zadužen agent: {v.agentName || 'Agencija'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Zakazivanje razgledanja"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Klijent
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
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nekretnina za razgledanje
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Izaberite nekretninu...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.address}, {p.city})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Datum i vreme razgledanja"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Instrukcije i napomena za obilazak
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Gde se naći, poneti ključ, kontakt vlasnika..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit" isLoading={formLoading}>
              Zakaži termin
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
