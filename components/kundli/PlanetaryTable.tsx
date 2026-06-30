'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';

interface Planet {
  name:          string;
  rashi:         number;
  rashiName:     string;
  nakshatra:     number;
  nakshatraName: string;
  house:         number;
  degree:        number;
  isRetrograde:  boolean;
}

interface PlanetaryTableProps {
  planets: Planet[];
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿',
  Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

export function PlanetaryTable({ planets }: PlanetaryTableProps) {
  const t = useTranslations('kundli');

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[400px] text-sm">
        <thead>
          <tr className="border-b border-navy/10">
            <th className="text-left py-2 pr-3 text-xs font-semibold text-navy/50 uppercase tracking-wide">{t('planet')}</th>
            <th className="text-left py-2 pr-3 text-xs font-semibold text-navy/50 uppercase tracking-wide">{t('rashi')}</th>
            <th className="text-left py-2 pr-3 text-xs font-semibold text-navy/50 uppercase tracking-wide">{t('nakshatra')}</th>
            <th className="text-left py-2 pr-3 text-xs font-semibold text-navy/50 uppercase tracking-wide">{t('house')}</th>
            <th className="text-right py-2 text-xs font-semibold text-navy/50 uppercase tracking-wide">{t('degree')}</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((planet) => (
            <tr key={planet.name} className="border-b border-navy/5 hover:bg-navy/2">
              <td className="py-2.5 pr-3 font-medium text-navy flex items-center gap-1.5">
                <span className="text-gold text-base" aria-hidden="true">{PLANET_SYMBOLS[planet.name]}</span>
                <span>{planet.name}</span>
                {planet.isRetrograde && (
                  <Badge variant="warning" className="text-[10px] px-1 py-0">R</Badge>
                )}
              </td>
              <td className="py-2.5 pr-3 text-navy/80">{planet.rashiName}</td>
              <td className="py-2.5 pr-3 text-navy/80">{planet.nakshatraName}</td>
              <td className="py-2.5 pr-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-navy/10 text-navy text-xs font-semibold">
                  {planet.house}
                </span>
              </td>
              <td className="py-2.5 text-right text-navy/60 font-mono text-xs">
                {planet.degree.toFixed(2)}°
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
