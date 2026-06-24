'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FlaskConical, FileText, FolderOpen,
  Lightbulb, ClipboardCheck, Shield, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/laboratory', label: 'Laboratories', icon: FlaskConical },
  { href: '/papers', label: 'Papers', icon: FileText },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/hypothesis/new', label: 'Generate', icon: Lightbulb },
  { href: '/review', label: 'Review', icon: ClipboardCheck },
  { href: '/audit', label: 'Audit Trail', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-sidebar-border bg-sidebar h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex flex-col gap-1 p-4">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
