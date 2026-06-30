'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { AshtakavargaGrid } from '@/components/kundli/AshtakavargaGrid';
import type { AshtakavargaResult, SarvashtakavargaResult } from '@/lib/kundli/ashtakavarga';

export default function AshtakavargaPage() {
  const t  = useTranslations('kundli');
  const tc = useTranslations('common');
  const [data, setData] = useState<{ planets: AshtakavargaResult[]; sarva: SarvashtakavargaResult } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r1 = await fetch('/api/profile');
      if (!r1.ok) { setLoading(false); return; }
      const profiles: { id: string; isDefault: boolean }[] = await r1.json();
      const p = profiles.find((x) => x.isDefault) ?? profiles[0];
      if (!p) { setLoading(false); return; }
      const res = await fetch('/api/kundli/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: p.id }),
      });
      if (!res.ok) { setLoading(false); return; }
      const d = await res.json();
      setData(d.ashtakavarga ?? null);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Header title={t('ashtakavarga')} />
      <div className="p-4 space-y-4">
        {loading && <SkeletonCard />}
        {data && (
          <Card>
            <AshtakavargaGrid planets={data.planets} sarva={data.sarva} />
          </Card>
        )}
        <p className="text-xs text-navy/40 text-center px-2">{tc('disclaimer')}</p>
      </div>
    </>
  );
}
