'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { KPTable } from '@/components/kundli/KPTable';
import type { KPSignificator } from '@/lib/kundli/kp';

export default function KPPage() {
  const t  = useTranslations('kundli');
  const tc = useTranslations('common');
  const [sigs, setSigs] = useState<KPSignificator[]>([]);
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
      setSigs(d.kpSignificators ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Header title={t('kp')} />
      <div className="p-4 space-y-4">
        {loading && <SkeletonCard />}
        {sigs.length > 0 && (
          <Card>
            <KPTable significators={sigs} />
          </Card>
        )}
        <p className="text-xs text-navy/40 text-center px-2">{tc('disclaimer')}</p>
      </div>
    </>
  );
}
