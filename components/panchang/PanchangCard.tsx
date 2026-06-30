'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import type { PanchangResult } from '@/types/engine';

interface PanchangCardProps {
  panchang: PanchangResult;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function PanchangCard({ panchang }: PanchangCardProps) {
  const t = useTranslations('panchang');

  return (
    <div className="space-y-3">
      {/* Main 5 elements */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t('tithi'),     value: panchang.tithi.name,     sub: panchang.tithi.nameHi },
          { label: t('vara'),      value: panchang.vara.name,      sub: panchang.vara.nameHi },
          { label: t('nakshatra'), value: panchang.nakshatra.name, sub: panchang.nakshatra.nameHi },
          { label: t('yoga'),      value: panchang.yoga.name,      sub: panchang.yoga.nameHi },
        ].map(({ label, value, sub }) => (
          <Card key={label} padding="sm" className="space-y-0.5">
            <p className="text-xs text-navy/50 font-medium uppercase tracking-wide">{label}</p>
            <p className="font-semibold text-navy font-display">{value}</p>
            <p className="text-xs text-navy/60 font-hindi">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Sun/Moon times */}
      <Card padding="sm">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('sunrise'),  value: formatTime(panchang.sunrise) },
            { label: t('sunset'),   value: formatTime(panchang.sunset) },
            { label: t('moonrise'), value: formatTime(panchang.moonrise) },
            { label: t('moonset'),  value: formatTime(panchang.moonset) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-xs text-navy/50">{label}</span>
              <span className="text-xs font-semibold text-navy">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Inauspicious times */}
      <Card padding="sm">
        <p className="text-xs font-semibold text-navy/60 uppercase tracking-wide mb-2">Times Worth Noting</p>
        {[
          { label: t('rahuKaal'),   ...panchang.rahuKaal },
          { label: t('yamagandam'), ...panchang.yamagandam },
          { label: t('gulikaiKaal'),...panchang.gulikaiKaal },
        ].map(({ label, start, end }) => (
          <div key={label} className="flex justify-between items-center py-1">
            <span className="text-xs text-navy/70">{label}</span>
            <span className="text-xs font-medium text-navy/80">
              {formatTime(start)} – {formatTime(end)}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
