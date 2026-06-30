import type { MilanResult } from '@/types/engine';
import { useTranslations } from 'next-intl';

interface CompatibilityMeterProps {
  totalScore: number;
  recommendation: MilanResult['recommendation'];
}

const COLOR_MAP: Record<string, string> = {
  HIGHLY_COMPATIBLE: 'text-green-600',
  COMPATIBLE:        'text-green-500',
  AVERAGE:           'text-yellow-600',
  NOT_RECOMMENDED:   'text-red-500',
};

const STROKE_MAP: Record<string, string> = {
  HIGHLY_COMPATIBLE: 'stroke-green-500',
  COMPATIBLE:        'stroke-green-400',
  AVERAGE:           'stroke-yellow-500',
  NOT_RECOMMENDED:   'stroke-red-400',
};

export function CompatibilityMeter({ totalScore, recommendation }: CompatibilityMeterProps) {
  const t = useTranslations('milan');
  const pct = (totalScore / 36) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          className={STROKE_MAP[recommendation]}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="48" textAnchor="middle" className="font-display" fontSize="16" fontWeight="bold" fill="#0F1F3D">
          {totalScore}
        </text>
        <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#9CA3AF">/36</text>
      </svg>
      <p className={['text-sm font-semibold', COLOR_MAP[recommendation]].join(' ')}>
        {t(`recommendation.${recommendation}` as 'recommendation.HIGHLY_COMPATIBLE')}
      </p>
    </div>
  );
}
