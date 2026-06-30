'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // POST to /api/auth/reset-password — stub (Resend integration in Phase G)
    await fetch('/api/auth/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    }).catch(() => null);
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gold font-display">{t('forgotPassword')}</h1>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-cream/80">{t('emailSent')}</p>
            <Link href="/login" className="text-gold hover:text-gold-light text-sm font-medium">
              ← {t('signInLink')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label={t('email')} type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" required
              className="bg-navy-light border-navy-light text-cream placeholder:text-cream/30"
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              {t('resetPassword')}
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-gold hover:text-gold-light text-sm">
                ← {t('signInLink')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
