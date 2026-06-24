'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FlaskConical, FileText, FolderOpen, Lightbulb,
  Sparkles, ArrowRight, X, Wallet, Zap, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const WELCOME_KEY = 'discova_welcome_seen';

const onboardingSteps = [
  {
    icon: Wallet,
    title: 'Set Up Your Wallet',
    description: 'Generate a GenLayer wallet in Settings. No MetaMask needed — everything runs in your browser.',
    href: '/settings',
    cta: 'Go to Settings',
  },
  {
    icon: FlaskConical,
    title: 'Create a Laboratory',
    description: 'Register your research lab on GenLayer StudioNet. You become the lab owner automatically.',
    href: '/laboratory/new',
    cta: 'Create Lab',
  },
  {
    icon: FileText,
    title: 'Register Your Papers',
    description: 'Add research papers with title, authors, and abstracts. These are referenced during hypothesis generation.',
    href: '/papers/new',
    cta: 'Add Paper',
  },
  {
    icon: FolderOpen,
    title: 'Start a Project',
    description: 'Organize hypothesis requests under a research project with specific objectives.',
    href: '/projects/new',
    cta: 'Create Project',
  },
  {
    icon: Lightbulb,
    title: 'Generate a Hypothesis',
    description: 'Submit a research question and let GenLayer AI validators produce a consensus-verified hypothesis.',
    href: '/hypothesis/new',
    cta: 'Generate',
  },
];

export function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0); // 0 = welcome, 1 = steps, 2 = pricing

  useEffect(() => {
    const seen = localStorage.getItem(WELCOME_KEY);
    if (!seen) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(WELCOME_KEY, 'true');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={dismiss} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {step === 0 && (
              <div className="p-8 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block mb-5"
                >
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground">Welcome to Discova</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  AI-powered hypothesis generation verified by GenLayer consensus.
                  Upload your research, submit questions, and get evidence-backed hypotheses — scored, cited, and recorded on-chain.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <Button onClick={() => setStep(1)} className="w-full">
                    <ArrowRight className="h-4 w-4" />
                    Get Started — Quick Setup Guide
                  </Button>
                  <button onClick={dismiss} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Skip, I know my way around
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-1">Quick Setup Guide</h2>
                <p className="text-sm text-muted-foreground mb-5">Follow these steps to generate your first hypothesis.</p>
                <div className="space-y-3">
                  {onboardingSteps.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.div
                        key={s.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary">Step {i + 1}</span>
                            <span className="text-sm font-semibold text-foreground">{s.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                        </div>
                        <Link href={s.href} onClick={dismiss} className="text-xs text-primary hover:underline shrink-0 mt-1">
                          {s.cta} →
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-5 flex gap-3">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                    View Plans
                  </Button>
                  <Button onClick={dismiss} className="flex-1">
                    <Sparkles className="h-4 w-4" />
                    Start Now
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-1">Choose Your Plan</h2>
                <p className="text-sm text-muted-foreground mb-5">Start free, upgrade when you need more.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Free</span>
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-foreground">8</span>
                      <span className="text-sm text-muted-foreground ml-1">Gen / month</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1.5">✓ 8 hypothesis generations</li>
                      <li className="flex items-center gap-1.5">✓ Full consensus scoring</li>
                      <li className="flex items-center gap-1.5">✓ On-chain audit trail</li>
                      <li className="flex items-center gap-1.5">✓ Unlimited papers & labs</li>
                    </ul>
                    <div className="pt-1">
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Current Plan</span>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 space-y-3 relative">
                    <div className="absolute -top-2.5 right-3">
                      <span className="text-[10px] font-bold uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Popular</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Pro</span>
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-foreground">50</span>
                      <span className="text-sm text-muted-foreground ml-1">Gen / month</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1.5">✓ 50 hypothesis generations</li>
                      <li className="flex items-center gap-1.5">✓ Priority consensus queue</li>
                      <li className="flex items-center gap-1.5">✓ Advanced analytics</li>
                      <li className="flex items-center gap-1.5">✓ Team collaboration</li>
                    </ul>
                    <Button size="sm" className="w-full text-xs">Upgrade to Pro</Button>
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
                  <Button onClick={dismiss} className="flex-1">
                    <Sparkles className="h-4 w-4" />
                    Get Started
                  </Button>
                </div>
              </div>
            )}

            {/* Step indicators */}
            <div className="flex justify-center gap-1.5 pb-5">
              {[0, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`h-1.5 rounded-full transition-all ${step === s ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
