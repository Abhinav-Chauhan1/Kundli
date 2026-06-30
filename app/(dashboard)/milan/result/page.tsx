'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { CompatibilityMeter } from '@/components/milan/CompatibilityMeter';
import { KootaScoreBar } from '@/components/milan/KootaScoreBar';
import { DoshaCard } from '@/components/milan/DoashaCard';
import type { MilanResult } from '@/types/engine';

export default function MilanResultPage() {
  const t  = useTranslations('milan');
  const tc = useTranslations('common');
  const router = useRouter();
  const [result, setResult] = useState<(MilanResult & { person1: { name: string }; person2: { name: string } }) | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('milanResult');
    if (!stored) { router.replace('/milan'); return; }
    setResult(JSON.parse(stored));
  }, [router]);

  if (!result) return null;

  return (
    <>
      <Header title={t('title')} />
      <div className="p-4 space-y-4">

        {/* Score meter */}
        <Card className="flex flex-col items-center py-6">
          <CompatibilityMeter totalScore={result.totalScore} recommendation={result.recommendation} />
          <p className="text-xs text-navy/50 mt-2">{result.totalScore} {t('outOf36')}</p>
        </Card>

        {/* Koota breakdown */}
        <Card>
          <h2 className="font-semibold text-navy font-display mb-4">{t('kootas')}</h2>
          <div className="space-y-3">
            {result.kootas.map((koota) => (
              <KootaScoreBar key={koota.name} koota={koota} />
            ))}
          </div>
        </Card>

        {/* Mangal Dosha */}
        <Card>
          <h2 className="font-semibold text-navy font-display mb-3">{t('mangalDosha')}</h2>
          <DoshaCard
            mangalDosha={result.mangalDosha}
            person1Name={result.person1.name}
            person2Name={result.person2.name}
          />
        </Card>

        {/* Compatibility */}
        <Card>
          <h2 className="font-semibold text-navy font-display mb-3">{t('compatibility')}</h2>
          <div className="space-y-2">
            {Object.entries(result.compatibility).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-1 border-b border-navy/5 last:border-0">
                <span className="text-sm text-navy/70 capitalize">{t(key as 'mental')}</span>
                <span className="text-sm font-medium text-navy">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-xs text-navy/40 text-center px-2">{tc('disclaimer')}</p>
      </div>
    </>
  );
}
