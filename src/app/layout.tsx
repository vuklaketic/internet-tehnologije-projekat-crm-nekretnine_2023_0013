import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { CurrencyProvider } from '@/context/currency-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRM Nekretnine | FON Internet Tehnologije',
  description: 'CRM veb aplikacija na primeru preduzeća za prodaju nekretnina',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="sr" className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <body className="h-full flex overflow-hidden font-sans">
        <CurrencyProvider>
          {user ? (
            <div className="flex w-full h-full">
              <Sidebar user={user} />
              <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8">
                <div className="max-w-7xl mx-auto">{children}</div>
              </main>
            </div>
          ) : (
            <div className="w-full h-full">{children}</div>
          )}
        </CurrencyProvider>
      </body>
    </html>
  );
}
