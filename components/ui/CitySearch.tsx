'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface CityResult {
  label: string;
  name: string;
  lat: number;
  lng: number;
  timezone: string;
  countryCode: string;
}

interface CitySearchProps {
  value?: string;
  onChange: (city: CityResult) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function CitySearch({ value = '', onChange, placeholder, required, className }: CitySearchProps) {
  const [query, setQuery]     = useState(value);
  const [results, setResults] = useState<CityResult[]>([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const timer  = useRef<ReturnType<typeof setTimeout>>();
  const wrapRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/profile/cities?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.cities ?? []);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (city: CityResult) => {
    setQuery(city.label);
    setOpen(false);
    setResults([]);
    onChange(city);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder ?? 'Search city…'}
          required={required}
          autoComplete="off"
          aria-label="Birth city search"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={className ?? 'w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy placeholder-navy/40 focus:outline-none focus:border-saffron/50 focus:ring-2 focus:ring-saffron/20'}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-navy/40">
            searching…
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-navy/10 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1"
        >
          {results.map((city, i) => (
            <li
              key={i}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(city)}
              className="px-4 py-2 text-sm text-navy cursor-pointer hover:bg-navy/5 transition-colors"
            >
              {city.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
