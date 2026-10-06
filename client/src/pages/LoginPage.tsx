import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, KeyRound, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ApiError, http } from '@/api/http';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;
type ServiceState = 'checking' | 'online' | 'offline';

const useServiceStatus = () => {
  const [status, setStatus] = useState<ServiceState>('checking');

  useEffect(() => {
    let active = true;

    http
      .get('/health')
      .then(() => active && setStatus('online'))
      .catch(() => active && setStatus('offline'));

    return () => {
      active = false;
    };
  }, []);

  return status;
};

const STATUS_COPY: Record<ServiceState, { label: string; dot: string; text: string }> = {
  checking: { label: 'Checking service', dot: 'bg-ink-300', text: 'text-ink-500' },
  online: { label: 'Service online', dot: 'bg-mint-500', text: 'text-mint-700' },
  offline: { label: 'Service unreachable', dot: 'bg-brand-700', text: 'text-brand-800' },
};

export const LoginPage = () => {
  const { admin, isLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const serviceStatus = useServiceStatus();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!isLoading && admin) {
    const target = (location.state as { from?: string } | null)?.from ?? '/dashboard';
    return <Navigate to={target} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await signIn(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Unable to sign in. Please try again.',
      );
    }
  });

  const status = STATUS_COPY[serviceStatus];

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #dde7f0 1px, transparent 1px), linear-gradient(to bottom, #dde7f0 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 35%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 40%, #000 35%, transparent 100%)',
        }}
      />

      <div className="relative w-full max-w-[25.5rem]">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <CheckCircle2 className="size-5" aria-hidden />
          </span>
          <span className="text-[0.95rem] font-semibold tracking-tight text-ink-900">
            Workforce Console
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-float">
          <div className="h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-mint-500" />

          <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-brand-700">
              <Lock className="size-3" aria-hidden />
              Restricted
            </span>
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', status.text)}>
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  status.dot,
                  serviceStatus === 'checking' && 'animate-pulse',
                )}
                aria-hidden
              />
              {status.label}
            </span>
          </div>

          <div className="px-6 pb-6 pt-6">
            <h1 className="text-[1.35rem] font-semibold tracking-tight text-ink-900">
              Administrator sign in
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-ink-500">
              Manage the employee directory, task assignments and workload reporting.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="admin@company.com"
                autoFocus
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              {formError ? (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800 ring-1 ring-brand-200"
                >
                  <KeyRound className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {formError}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full justify-center"
                isLoading={isSubmitting}
              >
                Sign in
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </form>
          </div>

          <p className="border-t border-line bg-surface/70 px-6 py-3 text-center text-xs leading-relaxed text-ink-500">
            Sessions last 8 hours and are stored in a secure http-only cookie. Repeated failed
            attempts are temporarily blocked.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-ink-300">
          Internal tool · Authorised personnel only
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
