'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RiBuildingLine, RiArrowLeftLine, RiLockPasswordLine, RiCheckboxCircleLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Došlo je do greške');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch {
      setError('Mrežna greška pri komunikaciji sa serverom');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white mb-3 shadow-md">
            <RiBuildingLine className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Oporavak lozinke
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unesite email adresu i novu željenu lozinku za pristup vašem nalogu
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-3">
            <RiCheckboxCircleLine className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Lozinka je uspešno promenjena!
            </h3>
            <p className="text-xs text-slate-500">
              Preusmeravamo vas na stranicu za prijavu...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email adresa naloga"
              type="email"
              placeholder="primer@crm.rs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Nova lozinka"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Potvrdite novu lozinku"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Postavi novu lozinku
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-500 underline"
          >
            <RiArrowLeftLine className="w-3.5 h-3.5" /> Nazad na prijavu
          </Link>
        </div>
      </div>
    </div>
  );
}
