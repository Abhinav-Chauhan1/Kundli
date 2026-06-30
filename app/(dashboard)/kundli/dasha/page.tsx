'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getCurrentDasha } from '@/lib/kundli/dasha';
import type { MahaDasha } from '@/lib/kundli/dasha';

const DashaTimeline = lazy(() =>
  import('@/components/kundli/DashaTimeline').then((m) => ({ default: m.DashaTimeline }))
);

export default function DashaPage() {
  const t  = useTranslations('kundli');
  const tc = useTranslations('common');
  const [dashas, setDashas] = useState<MahaDasha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profilesRes = await fetch('/api/profile');
      if (!profilesRes.ok) { setLoading(false); return; }
      const profiles: { id: string; isDefault: boolean }[] = await profilesRes.json();
      const p = profiles.find((x) => x.isDefault) ?? profiles[0];
      if (!p) { setLoading(false); return; }

      const res = await fetch('/api/kundli/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ profileId: p.id }),
      });
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setDashas((data.dashas as MahaDasha[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const current = dashas.length > 0 ? getCurrentDasha(dashas) : null;

  return (
    <>
      <Header title={t('dasha')} />
      <div className="p-4 space-y-4">
        {loading && <SkeletonCard />}

        {current && (
          <Card>
            <h2 className="font-semibold text-navy font-display mb-3">{t('currentDasha')}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="saffron">{t('mahadasha')}: {current.maha.lord}</Badge>
              <Badge variant="gold">{t('antardasha')}: {current.antar.lord}</Badge>
            </div>
            <p className="text-xs text-navy/60 mt-2">
              {current.maha.startDate} → {current.maha.endDate}
            </p>
          </Card>
        )}

        {dashas.length > 0 && (
          <Card padding="sm">
            <h2 className="font-semibold text-navy font-display mb-3 px-1">Dasha Timeline</h2>
            <Suspense fallback={<SkeletonCard />}>
              <DashaTimeline dashas={dashas} />
            </Suspense>
          </Card>
        )}

        {dashas.length > 0 && (
          <Card>
            <h2 className="font-semibold text-navy font-display mb-3">All Mahadashas</h2>
            <div className="space-y-2">
              {dashas.map((d) => {
                const isCurrent = current?.maha.lord === d.lord && current?.maha.startDate === d.startDate;
                return (
                  <div
                    key={`${d.lord}-${d.startDate}`}
                    className={['flex justify-between items-center py-2 px-3 rounded-lg text-sm', isCurrent ? 'bg-saffron/10 border border-saffron/20' : 'bg-navy/3'].join(' ')}
                  >
                    <span className="font-medium text-navy">{d.lord}</span>
                    <span className="text-xs text-navy/60">{d.startDate} — {d.endDate}</span>
                    <span className="text-xs text-navy/40">{d.years.toFixed(1)}y</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <p className="text-xs text-navy/40 text-center px-2">{tc('disclaimer')}</p>
      </div>
    </>
  );
}
