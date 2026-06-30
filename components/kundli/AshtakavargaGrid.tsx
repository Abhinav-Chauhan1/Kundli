'use client';

import type { AshtakavargaResult, SarvashtakavargaResult } from '@/lib/kundli/ashtakavarga';

const RASHI_ABBR = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];

interface AshtakavargaGridProps {
  planets: AshtakavargaResult[];
  sarva:   SarvashtakavargaResult;
}

export function AshtakavargaGrid({ planets, sarva }: AshtakavargaGridProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[480px] text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-2 font-semibold text-navy/60 uppercase tracking-wide text-[10px]">Planet</th>
            {RASHI_ABBR.map((r, i) => (
              <th key={i} className="text-center py-2 w-8 font-semibold text-navy/60 uppercase tracking-wide text-[10px]">{r}</th>
            ))}
            <th className="text-center py-2 font-semibold text-navy/60 uppercase tracking-wide text-[10px]">Total</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((row) => (
            <tr key={row.planet} className="border-t border-navy/5">
              <td className="py-2 pr-2 font-medium text-navy whitespace-nowrap">{row.planet.slice(0, 3)}</td>
              {row.bindus.map((bindu, i) => (
                <td key={i} className="text-center py-2">
                  <span className={[
                    'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold',
                    bindu >= 5 ? 'bg-green-100 text-green-800' :
                    bindu >= 3 ? 'bg-yellow-50 text-yellow-800' :
                    'bg-red-50 text-red-700',
                  ].join(' ')}>
                    {bindu}
                  </span>
                </td>
              ))}
              <td className="text-center py-2 font-bold text-navy">{row.total}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-navy/20 bg-cream">
            <td className="py-2 pr-2 font-bold text-navy">Sarva</td>
            {sarva.bindus.map((bindu, i) => (
              <td key={i} className="text-center py-2">
                <span className={[
                  'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold',
                  bindu >= 28 ? 'bg-green-200 text-green-900' :
                  bindu >= 20 ? 'bg-yellow-100 text-yellow-900' :
                  'bg-red-100 text-red-800',
                ].join(' ')}>
                  {bindu}
                </span>
              </td>
            ))}
            <td className="text-center py-2 font-bold text-saffron">{sarva.total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
