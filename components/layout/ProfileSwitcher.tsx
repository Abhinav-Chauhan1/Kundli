'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, UserCircle } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  photoUrl?: string | null;
}

interface ProfileSwitcherProps {
  profiles: Profile[];
  activeProfileId: string;
  onSwitch: (profileId: string) => void;
}

export function ProfileSwitcher({ profiles, activeProfileId, onSwitch }: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active = profiles.find((p) => p.id === activeProfileId) ?? profiles[0];

  if (!active) {
    return (
      <Link href="/profile" className="flex items-center gap-1 text-sm text-saffron font-medium">
        Add Profile
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Active profile: ${active.name}`}
      >
        <span className="w-8 h-8 rounded-full bg-navy/10 overflow-hidden flex items-center justify-center">
          {active.photoUrl ? (
            <Image src={active.photoUrl} alt={active.name} width={32} height={32} className="object-cover" />
          ) : (
            <UserCircle className="w-5 h-5 text-navy/40" />
          )}
        </span>
        <span className="text-sm font-medium text-navy max-w-20 truncate hidden sm:block">{active.name}</span>
        <ChevronDown className={['w-4 h-4 text-navy/60 transition-transform', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            aria-label="Switch profile"
            className="absolute right-0 top-10 w-48 bg-white border border-navy/10 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {profiles.map((p) => (
              <li key={p.id}>
                <button
                  role="option"
                  aria-selected={p.id === activeProfileId}
                  onClick={() => { onSwitch(p.id); setOpen(false); }}
                  className={[
                    'w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-cream transition-colors',
                    p.id === activeProfileId ? 'text-saffron font-medium' : 'text-navy',
                  ].join(' ')}
                >
                  <span className="w-7 h-7 rounded-full bg-navy/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {p.photoUrl ? (
                      <Image src={p.photoUrl} alt={p.name} width={28} height={28} className="object-cover" />
                    ) : (
                      <UserCircle className="w-4 h-4 text-navy/40" />
                    )}
                  </span>
                  <span className="truncate">{p.name}</span>
                </button>
              </li>
            ))}
            <li className="border-t border-navy/10">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm text-saffron font-medium hover:bg-cream transition-colors"
              >
                Manage Profiles
              </Link>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}
