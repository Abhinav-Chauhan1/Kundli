import type { MilanResult } from '@/types/engine';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';

interface DoshaCardProps {
  mangalDosha: MilanResult['mangalDosha'];
  person1Name: string;
  person2Name: string;
}

export function DoshaCard({ mangalDosha, person1Name, person2Name }: DoshaCardProps) {
  const t = useTranslations('milan');

  return (
    <div className="space-y-2">
      {[
        { name: person1Name, dosha: mangalDosha.person1 },
        { name: person2Name, dosha: mangalDosha.person2 },
      ].map(({ name, dosha }) => (
        <div key={name} className="flex items-center justify-between">
          <span className="text-sm font-medium text-navy">{name}</span>
          <Badge variant={dosha.hasMangal ? 'warning' : 'success'}>
            {dosha.hasMangal ? t('hasMangal') : t('noMangal')}
          </Badge>
        </div>
      ))}

      {mangalDosha.cancellation && (
        <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg mt-1">
          {mangalDosha.cancellationReason}
        </p>
      )}
    </div>
  );
}
