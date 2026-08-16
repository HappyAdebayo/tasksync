'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { signupApi } from '@/lib/api';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await signupApi({ name: name.trim(), email: email.trim(), password });
      router.push('/login');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-7 flex flex-col items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4C5FD5] text-white">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <h1 className="text-[19px] font-semibold text-[#101828]">Create your account</h1>
          <p className="text-[13px] text-[#667085]">Start organizing your work in minutes.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-[0_8px_20px_rgba(23,26,33,0.05)]"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[12.5px] font-medium text-[#C4453D]">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="mb-1.5 block text-[12.5px] font-medium text-[#101828]">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-[#EAECF0] px-3 py-2.5 text-[13.5px] text-[#101828] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#4C5FD5]"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-[#101828]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className="w-full rounded-lg border border-[#EAECF0] px-3 py-2.5 text-[13.5px] text-[#101828] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#4C5FD5]"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-medium text-[#101828]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-[#EAECF0] px-3 py-2.5 pr-10 text-[13.5px] text-[#101828] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#4C5FD5]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#667085]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#4C5FD5] py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-[#667085]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#4C5FD5] hover:text-[#3E4EC0]">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}