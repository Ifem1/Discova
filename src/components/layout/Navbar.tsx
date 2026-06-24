'use client';

import Link from 'next/link';
import { useTheme } from '@/components/layout/ThemeProvider';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu, X, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/useWallet';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/hypothesis/new', label: 'Generate' },
  { href: '/review', label: 'Review' },
  { href: '/audit', label: 'Audit' },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = pathname === '/';
  const wallet = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">D</span>
          </div>
          <span className="text-xl font-bold font-heading tracking-tight text-foreground">
            Discova
          </span>
        </Link>

        {!isLanding && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 hidden dark:block text-foreground" />
            <Moon className="h-4 w-4 block dark:hidden text-foreground" />
          </button>

          {isLanding ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!wallet.connected ? (
                <Link href="/settings" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary/40 hover:text-primary transition-colors text-muted-foreground">
                  <Wallet className="h-3 w-3" />
                  Setup Wallet
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {wallet.shortenAddress}
                </div>
              )}
              <Link href="/settings">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary cursor-pointer">
                  U
                </div>
              </Link>
            </div>
          )}

          {!isLanding && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted cursor-pointer"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {mobileOpen && !isLanding && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
