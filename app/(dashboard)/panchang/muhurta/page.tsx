'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { MuhurtaResult } from '@/types/engine';

const ACTIVITIES = ['MARRIAGE','GRIHA_PRAVESH','NAMKARAN','MUNDAN','VEHICLE','BUSINESS'] as const;

export default function MuhurtaPage() {
  const t  = useTranslations('panchang');
  const tc = useTranslations('common');

  const [activity, setActivity]   = useState<typeof ACTIVITIES[number]>('MARRIAGE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [result, setResult]       = useState<MuhurtaResult | null>(null);
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/panchang/muhurta', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ activity, startDate, endDate, lat: 28.6139, lng: 77.209, tz: 'Asia/Kolkata' }),
    });
    setLoading(false);
    if (!res.ok) return;
    setResult(await res.json());
  }

  return (
    <>
      <Header title={t('muhurta')} />
      <div className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="space-y-3">
            <Select
              label={t('muhurtaActivity')}
              value={activity}
              onChange={(e) => setActivity(e.target.value as typeof activity)}
              options={ACTIVITIES.map((a) => ({ value: a, label: t(`activities.${a}` as 'activities.MARRIAGE') }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t('muhurtaStart')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              <Input label={t('muhurtaEnd')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </Card>
          <Button type="submit" fullWidth loading={loading}>{t('findMuhurta')}</Button>
        </form>

        {result && (
          <Card>
            <h2 className="font-semibold text-navy font-display mb-3">{t('muhurtaSlots')}</h2>
            {result.slots.length === 0 && <p className="text-sm text-navy/60">No auspicious slots found in this range.</p>}
            <div className="space-y-2">
              {result.slots.map((slot, i) => (
                <div key={i} className="p-3 bg-green-50 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-navy text-sm">{new Date(slot.start).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      <p className="text-xs text-navy/60">{slot.nakshatra} · {slot.tithi}</p>
                    </div>
                    <span className="text-xs font-bold text-green-700">Score: {slot.qualityScore}/10</span>
                  </div>
                  <p className="text-xs text-navy/60 mt-1">{slot.notes}</p>
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
