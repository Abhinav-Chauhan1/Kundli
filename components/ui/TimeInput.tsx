'use client';

interface TimeInputProps {
  label?: string;
  value: string; // HH:MM (24h)
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

function to12h(hhmm: string): { hour: string; minute: string; ampm: 'AM' | 'PM' } {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { hour: String(hour), minute: String(m ?? 0).padStart(2, '0'), ampm };
}

function to24h(hour: string, minute: string, ampm: string): string {
  let h = parseInt(hour, 10);
  if (ampm === 'AM' && h === 12) h = 0;
  if (ampm === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

export function TimeInput({ label, value, onChange, required, className = '' }: TimeInputProps) {
  const parsed = value && value.includes(':') ? to12h(value) : { hour: '12', minute: '00', ampm: 'AM' as const };

  function handleChange(field: 'hour' | 'minute' | 'ampm', val: string) {
    const next = { ...parsed, [field]: val };
    onChange(to24h(next.hour, next.minute, next.ampm));
  }

  const selectClass = [
    'flex-1 px-2 py-3 rounded-xl border border-navy/20 bg-white text-navy text-center',
    'focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent',
    'transition-colors duration-150 appearance-none',
    className,
  ].join(' ');

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-navy">{label}</label>}
      <div className="flex gap-2">
        <select value={parsed.hour} onChange={e => handleChange('hour', e.target.value)} required={required} className={selectClass}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <select value={parsed.minute} onChange={e => handleChange('minute', e.target.value)} className={selectClass}>
          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={parsed.ampm} onChange={e => handleChange('ampm', e.target.value)} className={selectClass}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
