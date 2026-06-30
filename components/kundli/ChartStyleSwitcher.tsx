'use client';

import { useTranslations } from 'next-intl';

type ChartStyle = 'NORTH' | 'SOUTH' | 'EAST';

interface ChartStyleSwitcherProps {
  value:    ChartStyle;
  onChange: (style: ChartStyle) => void;
}

const STYLES: { key: ChartStyle; labelKey: string }[] = [
  { key: 'NORTH', labelKey: 'north' },
  { key: 'SOUTH', labelKey: 'south' },
  { key: 'EAST',  labelKey: 'east'  },
];

export function ChartStyleSwitcher({ value, onChange }: ChartStyleSwitcherProps) {
  const t = useTranslations('kundli');

  return (
    <div className="flex rounded-xl overflow-hidden border border-navy/20 self-start">
      {STYLES.map(({ key, labelKey }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={[
            'px-3 py-1.5 text-xs font-medium transition-colors',
            value === key
              ? 'bg-navy text-white'
              : 'bg-white text-navy/60 hover:text-navy hover:bg-navy/5',
          ].join(' ')}
          aria-pressed={value === key}
        >
          {t(labelKey as 'north' | 'south' | 'east')}
        </button>
      ))}
    </div>
  );
}
