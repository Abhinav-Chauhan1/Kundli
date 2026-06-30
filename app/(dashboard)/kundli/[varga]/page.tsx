'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getVargaRashi, VARGA_LABELS, ALL_VARGAS, type VargaId } from '@/lib/kundli/varga';

const NorthIndianChart = lazy(() =>
  import('@/components/kundli/NorthIndianChart').then((m) => ({ default: m.NorthIndianChart }))
);

export default function VargaPage() {
  const { varga } = useParams<{ varga: string }>();
  const t  = useTranslations('kundli');
  const tc = useTranslations('common');

  const vargaId = varga?.toUpperCase() as VargaId;
  const label = ALL_VARGAS.includes(vargaId) ? VARGA_LABELS[vargaId] : varga;

  const [chartData, setChartData] = useState<Record<string, unknown> | null>(null);
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
      setChartData(await res.json());
      setLoading(false);
    })();
  }, []);

  const basePlanets = (chartData as { planets?: { name: string; longitude: number; house: number }[] })?.planets;
  const ascendant   = (chartData as { ascendant?: number })?.ascendant ?? 0;

  const vargaPlanets = basePlanets?.map((p) => ({
    name:  p.name,
    rashi: ALL_VARGAS.includes(vargaId) ? getVargaRashi(p.longitude, vargaId) : p.house - 1,
    house: p.house,
  }));

  return (
    <>
      <Header title={label ?? t('chart')} />
      <div className="p-4 space-y-4">
        {loading && <SkeletonCard />}
        {vargaPlanets && (
          <Card padding="sm">
            <Suspense fallback={<SkeletonCard />}>
              <NorthIndianChart planets={vargaPlanets} ascendant={ascendant} />
            </Suspense>
          </Card>
        )}
        <p className="text-xs text-navy/40 text-center px-2">{tc('disclaimer')}</p>
      </div>
    </>
  );
}
