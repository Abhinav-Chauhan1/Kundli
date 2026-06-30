import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  right?: ReactNode;
}

export function Header({ title, right }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-navy/10 sticky top-0 z-30">
      <h1 className="font-semibold text-lg text-navy font-display">{title}</h1>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}
