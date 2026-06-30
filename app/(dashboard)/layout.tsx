import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/session';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToastProvider } from '@/components/ui/Toast';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (!user) redirect('/login');

  return (
    <ToastProvider>
      <div className="min-h-screen bg-cream flex flex-col max-w-app mx-auto relative">
        <main className="flex-1 pb-14 overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
