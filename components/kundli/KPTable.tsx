import type { KPSignificator } from '@/lib/kundli/kp';

interface KPTableProps {
  significators: KPSignificator[];
}

export function KPTable({ significators }: KPTableProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[360px] text-sm">
        <thead>
          <tr className="border-b border-navy/10">
            <th className="text-left py-2 pr-3 text-xs font-semibold text-navy/50 uppercase tracking-wide">Planet</th>
            <th className="text-left py-2 pr-3 text-xs font-semibold text-navy/50 uppercase tracking-wide">Nakshatra Lord</th>
            <th className="text-left py-2 text-xs font-semibold text-navy/50 uppercase tracking-wide">Sub Lord</th>
          </tr>
        </thead>
        <tbody>
          {significators.map((sig) => (
            <tr key={sig.planet} className="border-b border-navy/5">
              <td className="py-2.5 pr-3 font-medium text-navy">{sig.planet}</td>
              <td className="py-2.5 pr-3 text-navy/80">{sig.nakshatra}</td>
              <td className="py-2.5 font-semibold text-saffron">{sig.sublord}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
