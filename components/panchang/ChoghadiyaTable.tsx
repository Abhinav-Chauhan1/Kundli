'use client';

import { useTranslations } from 'next-intl';
import type { Choghadiya } from '@/types/engine';

interface ChoghadiyaTableProps {
  day:   Choghadiya[];
  night: Choghadiya[];
}

const QUALITY_STYLES = {
  GOOD:    'bg-green-50 text-green-800',
  NEUTRAL: 'bg-yellow-50 text-yellow-800',
  BAD:     'bg-red-50 text-red-700',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function ChoghadiyaRow({ slot }: { slot: Choghadiya }) {
  return (
    <div className={['flex justify-between items-center px-3 py-2 rounded-lg text-sm', QUALITY_STYLES[slot.quality]].join(' ')}>
      <span className="font-medium">{slot.name}</span>
      <span className="font-hindi text-xs opacity-80">{slot.nameHi}</span>
      <span className="text-xs opacity-70">{formatTime(slot.start)} – {formatTime(slot.end)}</span>
    </div>
  );
}

export function ChoghadiyaTable({ day, night }: ChoghadiyaTableProps) {
  const t = useTranslations('panchang');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-navy/50 uppercase tracking-wide mb-2">{t('day')}</h3>
        <div className="space-y-1">
          {day.map((slot, i) => <ChoghadiyaRow key={i} slot={slot} />)}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-navy/50 uppercase tracking-wide mb-2">{t('night')}</h3>
        <div className="space-y-1">
          {night.map((slot, i) => <ChoghadiyaRow key={i} slot={slot} />)}
        </div>
      </div>
    </div>
  );
}
