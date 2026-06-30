'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ChartStyleSwitcher } from '@/components/kundli/ChartStyleSwitcher';
import { PlanetaryTable } from '@/components/kundli/PlanetaryTable';
import Link from 'next/link';

// Dynamic imports to keep bundle under 30MB
const NorthIndianChart = lazy(() =>
  import('@/components/kundli/NorthIndianChart').then((m) => ({ default: m.NorthIndianChart }))
);
const SouthIndianChart = lazy(() =>
  import('@/components/kundli/SouthIndianChart').then((m) => ({ default: m.SouthIndianChart }))
);
const EastIndianChart = lazy(() =>
  import('@/components/kundli/EastIndianChart').then((m) => ({ default: m.EastIndianChart }))
);

type ChartStyle = 'NORTH' | 'SOUTH' | 'EAST';

export default function KundliPage() {
  const t  = useTranslations('kundli');
  const tc = useTranslations('common');

  const [chartStyle, setChartStyle] = useState<ChartStyle>('NORTH');
  const [chartData, setChartData]   = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Load default profile's existing kundli on mount
  useEffect(() => {
    loadKundli();
  }, []);

  async function loadKundli(forceRegen = false) {
    setLoading(true);
    setError('');

    // Get default profile
    const profilesRes = await fetch('/api/profile');
    if (!profilesRes.ok) { setLoading(false); return; }
    const profiles: { id: string; isDefault: boolean }[] = await profilesRes.json();
    const defaultProfile = profiles.find((p) => p.isDefault) ?? profiles[0];
    if (!defaultProfile) { setLoading(false); return; }

    const res = await fetch('/api/kundli/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ profileId: defaultProfile.id, forceRegen }),
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.status === 504 ? 'Chart generation timed out. Please retry.' : tc('error'));
      return;
    }

    setChartData(await res.json());
  }

  const planets = (chartData as { planets?: unknown[] })?.planets as { name: string; rashi: number; house: number; isRetrograde: boolean; rashiName: string; nakshatra: number; nakshatraName: string; degree: number }[] | undefined;
  const ascendant = (chartData as { ascendant?: number })?.ascendant ?? 0;

  return (
    <>
      <Header
        title={t('title')}
        right={
          <div className="flex items-center gap-2">
            <ChartStyleSwitcher value={chartStyle} onChange={setChartStyle} />
          </div>
        }
      />

      <div className="p-4 space-y-4">
        {loading && <SkeletonCard />}

        {error && (
          <Card>
            <p className="text-red-600 text-sm">{error}</p>
            <Button size="sm" variant="ghost" onClick={() => loadKundli(true)} className="mt-2">
              {tc('retry')}
            </Button>
          </Card>
        )}

        {chartData && !loading && (
          <>
            {/* Chart */}
            <Card padding="sm">
              <Suspense fallback={<SkeletonCard />}>
                {chartStyle === 'NORTH' && planets && (
                  <NorthIndianChart planets={planets} ascendant={ascendant} />
                )}
                {chartStyle === 'SOUTH' && planets && (
                  <SouthIndianChart planets={planets} ascendant={ascendant} />
                )}
                {chartStyle === 'EAST' && planets && (
                  <EastIndianChart planets={planets} ascendant={ascendant} />
                )}
              </Suspense>
            </Card>

            {/* Quick nav */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/kundli/dasha',         label: t('dasha') },
                { href: '/kundli/transit',        label: t('transit') },
                { href: '/kundli/ashtakavarga',   label: t('ashtakavarga') },
                { href: '/kundli/kp',             label: t('kp') },
              ].map(({ href, label }) => (
                <Link key={href} href={href}>
                  <Card padding="sm" className="text-center text-sm font-medium text-navy hover:border-saffron/30 transition-colors py-3">
                    {label}
                  </Card>
                </Link>
              ))}
            </div>

            {/* Planetary table */}
            <Card>
              <h2 className="font-semibold text-navy font-display mb-3">{t('planets')}</h2>
              {planets && <PlanetaryTable planets={planets} />}
            </Card>

            {/* Disclaimer */}
            <p className="text-xs text-navy/40 text-center px-2">
              {tc('disclaimer')}
            </p>
          </>
        )}

        {!chartData && !loading && !error && (
          <Card className="text-center py-8 space-y-3">
            <p className="text-navy/60">No kundli generated yet.</p>
            <Link href="/profile">
              <Button variant="primary" size="sm">Add Birth Profile</Button>
            </Link>
          </Card>
        )}
      </div>
    </>
  );
}
