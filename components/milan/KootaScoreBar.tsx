import type { Koota } from '@/lib/kundli/gunaMilan';

interface KootaScoreBarProps {
  koota: Koota;
}

export function KootaScoreBar({ koota }: KootaScoreBarProps) {
  const pct = (koota.score / koota.maxScore) * 100;
  const color = pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="flex items-center gap-3">
      <div className="w-28 flex-shrink-0">
        <p className="text-sm font-medium text-navy">{koota.name}</p>
        <p className="text-xs text-navy/50">{koota.description}</p>
      </div>
      <div className="flex-1 bg-navy/10 rounded-full h-2">
        <div
          className={['h-2 rounded-full transition-all', color].join(' ')}
          style={{ width: `${pct}%` }}
          aria-label={`${koota.score} out of ${koota.maxScore}`}
        />
      </div>
      <span className="text-sm font-bold text-navy w-12 text-right">
        {koota.score}/{koota.maxScore}
      </span>
    </div>
  );
}
