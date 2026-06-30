'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CitySearch } from '@/components/ui/CitySearch';
import { TimeInput } from '@/components/ui/TimeInput';

interface ProfileData {
  name:      string;
  dob:       string;
  tob:       string;
  birthCity: string;
  lat:       number;
  lng:       number;
  timezone:  string;
  isDefault: boolean;
}

export default function EditProfilePage() {
  const t = useTranslations('profile');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';

  const [form, setForm] = useState<ProfileData>({
    name: '', dob: '', tob: '', birthCity: 'New Delhi',
    lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata', isDefault: false,
  });
  const [loading, setLoading]   = useState(!isNew);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (isNew || !id) { setLoading(false); return; }
    fetch(`/api/profile/${id}`).then((r) => r.json()).then((data) => {
      setForm({
        name: data.name, dob: data.dob, tob: data.tob,
        birthCity: data.birthCity, lat: data.lat, lng: data.lng,
        timezone: data.timezone, isDefault: data.isDefault,
      });
      setLoading(false);
    });
  }, [id, isNew]);

  function update(field: keyof ProfileData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const method = isNew ? 'POST' : 'PATCH';
    const url    = isNew ? '/api/profile' : `/api/profile/${id}`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Save failed');
      return;
    }

    router.push('/profile');
  }

  async function handleDelete() {
    if (!confirm(t('deleteConfirm'))) return;
    await fetch(`/api/profile/${id}`, { method: 'DELETE' });
    router.push('/profile');
  }

  if (loading) return null;

  return (
    <>
      <Header title={isNew ? t('addProfile') : t('editProfile')} />
      <div className="p-4">
        <form onSubmit={handleSave} className="space-y-4">
          <Card className="space-y-3">
            <Input label={t('name')} type="text" value={form.name} onChange={update('name')} required minLength={2} />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t('dob')} type="date" value={form.dob} onChange={update('dob')} required />
              <TimeInput label={t('tob')} value={form.tob} onChange={v => setForm(p => ({ ...p, tob: v }))} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy/60 mb-1">{t('birthCity')}</label>
              <CitySearch
                value={form.birthCity}
                onChange={(city) => setForm(prev => ({
                  ...prev,
                  birthCity: city.name,
                  lat: city.lat,
                  lng: city.lng,
                  timezone: city.timezone,
                }))}
                required
              />
              {form.lat !== 0 && (
                <p className="text-xs text-navy/40 mt-1">
                  {form.lat.toFixed(4)}, {form.lng.toFixed(4)} · {form.timezone}
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={update('isDefault')} className="accent-saffron" />
              <span className="text-sm text-navy">{t('setDefault')}</span>
            </label>
          </Card>

          {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={saving}>{t('saveChanges')}</Button>

          {!isNew && (
            <Button type="button" variant="danger" fullWidth onClick={handleDelete}>
              {t('deleteProfile')}
            </Button>
          )}
        </form>
      </div>
    </>
  );
}
