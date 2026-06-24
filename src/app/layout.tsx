import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { PageTransition } from '@/components/layout/PageTransition';

export const metadata: Metadata = {
  title: 'Discova — Evidence-backed hypothesis generation through AI consensus',
  description: 'Generate evidence-backed, testable hypotheses verified by GenLayer consensus. Upload literature, submit research questions, and receive scientifically defensible research directions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=sora@400,500,600,700&f[]=general-sans@400,500,600&f[]=cabinet-grotesk@700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
