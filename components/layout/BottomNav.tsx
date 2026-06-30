'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, BookOpen, Heart, Calendar } from 'lucide-react';

const tabs = [
  { href: '/home',      key: 'home',     Icon: Home },
  { href: '/kundli',    key: 'kundli',   Icon: BookOpen },
  { href: '/milan',     key: 'milan',    Icon: Heart },
  { href: '/panchang',  key: 'panchang', Icon: Calendar },
] as const;

export function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-navy/10 flex items-stretch z-40 max-w-app mx-auto"
      aria-label="Main navigation"
    >
      {tabs.map(({ href, key, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
              active ? 'text-saffron' : 'text-navy/40 hover:text-navy/70',
            ].join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              className={['w-5 h-5', active ? 'text-saffron' : ''].join(' ')}
              aria-hidden="true"
            />
            <span>{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
