import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950">
      <AuthForm type="login" />
    </div>
  );
}
