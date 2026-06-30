'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CitySearch, CityResult } from '@/components/ui/CitySearch';

interface PersonForm {
  name:      string;
  dob:       string;
  tob:       string;
  birthCity: string;
  lat:       string;
  lng:       string;
  tz:        string;
}

const EMPTY: PersonForm = { name: '', dob: '', tob: '', birthCity: 'New Delhi', lat: '28.6139', lng: '77.209', tz: 'Asia/Kolkata' };

export default function MilanPage() {
  const t  = useTranslations('milan');
  const tc = useTranslations('common');
  const router = useRouter();

  const [p1, setP1]       = useState<PersonForm>({ ...EMPTY });
  const [p2, setP2]       = useState<PersonForm>({ ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function update(setter: typeof setP1) {
    return (field: keyof PersonForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function updateCity(setter: typeof setP1) {
    return (city: CityResult) => {
      setter(prev => ({ ...prev, birthCity: city.name, lat: String(city.lat), lng: String(city.lng), tz: city.timezone }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const body = {
      person1: { ...p1, lat: parseFloat(p1.lat), lng: parseFloat(p1.lng) },
      person2: { ...p2, lat: parseFloat(p2.lat), lng: parseFloat(p2.lng) },
    };

    const res = await fetch('/api/milan/calculate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? tc('error'));
      return;
    }

    const result = await res.json();
    sessionStorage.setItem('milanResult', JSON.stringify(result));
    router.push('/milan/result');
  }

  function PersonForm({ label, data, onChange, onCityChange }: {
    label: string;
    data: PersonForm;
    onChange: (f: keyof PersonForm) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCityChange: (city: CityResult) => void;
  }) {
    return (
      <Card>
        <h2 className="font-semibold text-navy font-display mb-3">{label}</h2>
        <div className="space-y-3">
          <Input label={tc('save') === 'Save' ? 'Full Name' : 'पूरा नाम'} type="text" value={data.name} onChange={onChange('name')} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date of Birth" type="date" value={data.dob} onChange={onChange('dob')} required />
            <Input label="Time of Birth" type="time" value={data.tob} onChange={onChange('tob')} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy/60 mb-1">Birth City</label>
            <CitySearch value={data.birthCity} onChange={onCityChange} required />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Header title={t('title')} />
      <div className="p-4 space-y-4">
        <p className="text-sm text-navy/60">{t('subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PersonForm label={t('person1')} data={p1} onChange={update(setP1)} onCityChange={updateCity(setP1)} />
          <PersonForm label={t('person2')} data={p2} onChange={update(setP2)} onCityChange={updateCity(setP2)} />

          {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? t('calculating') : t('calculate')}
          </Button>
        </form>

        <p className="text-xs text-navy/40 text-center px-2">{tc('disclaimer')}</p>
      </div>
    </>
  );
}
