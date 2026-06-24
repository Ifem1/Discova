import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
