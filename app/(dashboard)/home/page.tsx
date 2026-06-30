import Link from 'next/link';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { BookOpen, Heart, Calendar, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');
  const tc = await getTranslations('common');
  const user = await getServerSession();

  const defaultProfile = user?.uid
    ? await prisma.profile.findFirst({ where: { uid: user.uid, isDefault: true }, select: { id: true, name: true } }).catch(() => null)
    : null;

  const firstName = user?.name?.split(' ')[0] ?? t('welcome');

  return (
    <>
      <Header
        title="AstroVeda"
        right={
          <span className="text-sm text-navy/60">
            {t('welcome')}, {firstName}
          </span>
        }
      />

      <div className="p-4 space-y-4">
        {/* Quick links */}
        <section>
          <h2 className="text-sm font-semibold text-navy/60 uppercase tracking-wider mb-3">
            {t('quickLinks')}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/kundli" className="block">
              <Card padding="sm" className="flex flex-col items-center gap-2 py-4 hover:border-saffron/30 transition-colors">
                <BookOpen className="w-7 h-7 text-saffron" />
                <span className="text-xs font-medium text-navy text-center">{t('generateKundli')}</span>
              </Card>
            </Link>
            <Link href="/milan" className="block">
              <Card padding="sm" className="flex flex-col items-center gap-2 py-4 hover:border-saffron/30 transition-colors">
                <Heart className="w-7 h-7 text-saffron" />
                <span className="text-xs font-medium text-navy text-center">{t('checkMilan')}</span>
              </Card>
            </Link>
            <Link href="/panchang/muhurta" className="block">
              <Card padding="sm" className="flex flex-col items-center gap-2 py-4 hover:border-saffron/30 transition-colors">
                <Star className="w-7 h-7 text-saffron" />
                <span className="text-xs font-medium text-navy text-center">{t('findMuhurta')}</span>
              </Card>
            </Link>
          </div>
        </section>

        {/* Today's panchang quick link */}
        <Link href="/panchang">
          <Card className="flex items-center gap-3 hover:border-gold/30 transition-colors">
            <Calendar className="w-10 h-10 text-gold flex-shrink-0" />
            <div>
              <p className="font-semibold text-navy font-display">{t('todayPanchang')}</p>
              <p className="text-sm text-navy/60">Tithi, Nakshatra, Choghadiya</p>
            </div>
          </Card>
        </Link>

        {defaultProfile && (
          <Link href="/kundli">
            <Card className="flex items-center gap-3 hover:border-gold/30 transition-colors">
              <BookOpen className="w-10 h-10 text-gold flex-shrink-0" />
              <div>
                <p className="font-semibold text-navy font-display">{defaultProfile.name}</p>
                <p className="text-sm text-navy/60">{t('currentDasha')} · {t('generateKundli')}</p>
              </div>
            </Card>
          </Link>
        )}

        {!defaultProfile && (
          <Link href="/profile">
            <Card className="border-dashed border-2 border-navy/20 flex items-center justify-center py-6 gap-2 hover:border-saffron/50 transition-colors">
              <span className="text-sm text-navy/60">Add your birth profile to get started →</span>
            </Card>
          </Link>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-navy/40 text-center px-2 pb-2">
          {tc('disclaimer')}
        </p>
      </div>
    </>
  );
}
