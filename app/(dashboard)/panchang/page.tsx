'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { PanchangCard } from '@/components/panchang/PanchangCard';
import { ChoghadiyaTable } from '@/components/panchang/ChoghadiyaTable';
import type { PanchangResult } from '@/types/engine';

// Default to New Delhi for non-logged-in or no profile case
const DEFAULT_LAT = 28.6139;
const DEFAULT_LNG = 77.2090;
const DEFAULT_TZ  = 'Asia/Kolkata';

export default function PanchangPage() {
  const t  = useTranslations('panchang');
  const tc = useTranslations('common');

  const [panchang, setPanchang] = useState<PanchangResult | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/panchang/daily', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ date: today, lat: DEFAULT_LAT, lng: DEFAULT_LNG, tz: DEFAULT_TZ }),
      });
      setLoading(false);
      if (!res.ok) { setError(tc('error')); return; }
      setPanchang(await res.json());
    })();
  }, [today]);

  return (
    <>
      <Header title={t('title')} />

      <div className="p-4 space-y-4">
        <p className="text-sm text-navy/60 font-medium">{t('today')}: {new Date(today).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

        {loading && <SkeletonCard />}
        {error && <Card><p className="text-red-600 text-sm">{error}</p></Card>}

        {panchang && (
          <>
            <PanchangCard panchang={panchang} />

            <Card>
              <h2 className="font-semibold text-navy font-display mb-3">{t('choghadiya')}</h2>
              <ChoghadiyaTable day={panchang.choghadiya.day} night={panchang.choghadiya.night} />
            </Card>
          </>
        )}

        <p className="text-xs text-navy/40 text-center px-2">{tc('disclaimer')}</p>
      </div>
    </>
  );
}
