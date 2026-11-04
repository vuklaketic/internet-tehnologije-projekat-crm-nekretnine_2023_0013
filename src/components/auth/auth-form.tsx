'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiBuildingLine, RiLockPasswordLine, RiMailLine, RiUserLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthFormProps {
  type: 'login' | 'register';
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'agent' | 'admin'>('agent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = type === 'login' ? { email, password } : { fullName, email, password, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Došlo je do greške. Proverite unete podatke.');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError('Mrežna greška. Molimo pokušajte ponovo.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white mb-3 shadow-md">
          <RiBuildingLine className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {type === 'login' ? 'Prijava na CRM sistem' : 'Registracija novog naloga'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {type === 'login'
            ? 'Unesite vaše kredencijale za pristup agencijskom panelu'
            : 'Kreirajte administratorski ili agentski nalog'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'register' && (
          <Input
            label="Ime i prezime"
            type="text"
            placeholder="Petar Petrović"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}

        <Input
          label="Email adresa"
          type="email"
          placeholder="korisnik@crm.rs"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Lozinka"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {type === 'register' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Uloga
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('agent')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  role === 'agent'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Agent prodaje
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  role === 'admin'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Administrator
              </button>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full mt-2" isLoading={loading}>
          {type === 'login' ? 'Prijavi se' : 'Registruj se'}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        {type === 'login' ? (
          <p>
            Nemate kreiran nalog?{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 underline">
              Registrujte se
            </Link>
          </p>
        ) : (
          <p>
            Već imate kreiran nalog?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 underline">
              Prijavite se
            </Link>
          </p>
        )}
      </div>

      {type === 'login' && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500">Demo nalozi za testiranje:</p>
          <p>Admin: <span className="font-mono text-slate-700 dark:text-slate-300">admin@crm.rs</span> / <span className="font-mono text-slate-700 dark:text-slate-300">Test1234!</span></p>
          <p>Agent: <span className="font-mono text-slate-700 dark:text-slate-300">agent1@crm.rs</span> / <span className="font-mono text-slate-700 dark:text-slate-300">Test1234!</span></p>
        </div>
      )}
    </div>
  );
}
