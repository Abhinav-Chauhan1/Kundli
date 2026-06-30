'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import type { TransitResult } from '@/types/engine';

const RASHI_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

export default function TransitPage() {
  const t  = useTranslations('kundli');
  const tc = useTranslations('common');
  const [transit, setTransit] = useState<TransitResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r1 = await fetch('/api/profile');
      if (!r1.ok) { setLoading(false); return; }
      const profiles: { id: string; isDefault: boolean }[] = await r1.json();
      const p = profiles.find((x) => x.isDefault) ?? profiles[0];
      if (!p) { setLoading(false); return; }
      const res = await fetch('/api/transit/current', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: p.id }),
      });
      if (!res.ok) { setLoading(false); return; }
      setTransit(await res.json());
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Header title={t('transit')} />
      <div className="p-4 space-y-4">
        {loading && <SkeletonCard />}

        {transit?.significantTransits && transit.significantTransits.length > 0 && (
          <Card>
            <h2 className="font-semibold text-navy font-display mb-3">Recent Sign Changes</h2>
            {transit.significantTransits.map((tr, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <Badge variant="saffron">{tr.planet}</Badge>
                <span className="text-sm text-navy/80">{RASHI_NAMES[tr.fromRashi]} → {RASHI_NAMES[tr.toRashi]}</span>
              </div>
            ))}
          </Card>
        )}

        {transit?.currentPlanetPositions && (
          <Card>
            <h2 className="font-semibold text-navy font-display mb-3">Current Planet Positions</h2>
            <div className="space-y-1.5">
              {transit.currentPlanetPositions.map((p) => (
                <div key={p.name} className="flex justify-between items-center py-1 border-b border-navy/5 last:border-0 text-sm">
                  <span className="font-medium text-navy">{p.name}</span>
                  <span className="text-navy/60">{p.rashiName}</span>
                  <span className="text-xs text-navy/40">{p.degree.toFixed(1)}°</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <p className="text-xs text-navy/40 text-center px-2">{tc('disclaimer')}</p>
      </div>
    </>
  );
}
