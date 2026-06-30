import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Plus, User, Edit } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function ProfilePage() {
  const t = await getTranslations('profile');
  const user = await getServerSession();

  const profiles = user?.uid
    ? await prisma.profile.findMany({
        where: { uid: user.uid },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      }).catch(() => [])
    : [];

  return (
    <>
      <Header title={t('title')} />
      <div className="p-4 space-y-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-navy/40" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-navy truncate">{profile.name}</p>
                {profile.isDefault && <Badge variant="saffron" className="text-[10px]">{t('default')}</Badge>}
              </div>
              <p className="text-xs text-navy/60">{profile.dob} · {profile.tob} · {profile.birthCity}</p>
            </div>
            <Link href={`/profile/${profile.id}`} className="p-2 hover:bg-navy/5 rounded-lg transition-colors" aria-label={t('editProfile')}>
              <Edit className="w-4 h-4 text-navy/40" />
            </Link>
          </Card>
        ))}

        {profiles.length < 5 && (
          <Link href="/profile/new">
            <Card className="flex items-center justify-center gap-2 border-dashed border-2 border-navy/20 py-5 hover:border-saffron/50 transition-colors">
              <Plus className="w-5 h-5 text-saffron" />
              <span className="text-sm font-medium text-saffron">{t('addProfile')}</span>
            </Card>
          </Link>
        )}

        {profiles.length >= 5 && (
          <p className="text-xs text-navy/50 text-center">{t('maxProfiles')}</p>
        )}
      </div>
    </>
  );
}
