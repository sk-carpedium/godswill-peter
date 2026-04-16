import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { sanitizeReturnPath } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkUserAuth, isAuthenticated, isLoadingAuth, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const returnTo = sanitizeReturnPath(searchParams.get('return'));

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user) {
      navigate(returnTo, { replace: true });
    }
  }, [isLoadingAuth, isAuthenticated, user, navigate, returnTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.auth.login({ email: email.trim(), password });
      await checkUserAuth();
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div
          className="h-9 w-9 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/Landing"
            className="flex items-center gap-2 text-slate-900 hover:opacity-90 transition-opacity"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0a0a] ring-1 ring-slate-200">
              {/* <span className="text-[#d4af37] text-lg font-bold leading-none">N</span> */}
              <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/120b4afa8_logo.png"
              alt=""
              className="w-9 h-9 rounded-lg object-contain"
            />
            </span>
            <span className="font-semibold text-slate-900">Nexus Social</span>
          </Link>
          <Link
            to="/Landing"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[420px] rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/60">
          {/* Logo block — circular badge + wordmark */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-[#0a0a0a] shadow-md ring-1 ring-black/5">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/120b4afa8_logo.png"
              alt=""
              className="w-9 h-9 rounded-lg object-contain"
            />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b8962e]">
              Nexus Social
            </p>
          </div>

          <h1 className="text-center text-2xl font-bold text-[#0F172A] tracking-tight">
            Welcome to Nexus Social
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10 rounded-lg border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 rounded-lg border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error ? (
              <p
                className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-[#0F172A] text-white font-semibold shadow-sm hover:bg-[#0c1424] focus-visible:ring-slate-400"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link
              to="/Help"
              className="text-slate-500 hover:text-[#0F172A] transition-colors"
            >
              Forgot password?
            </Link>
            <p className="text-slate-500">
              Need an account?{' '}
              <Link
                to="/Landing"
                className="font-semibold text-[#0F172A] hover:underline underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
