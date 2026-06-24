'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FlaskConical, FileText, FolderOpen, Lightbulb,
  ClipboardCheck, ArrowRight, Plus, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, verdictToBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } } as const;
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } } as const;

export default function DashboardPage() {
  const [counts, setCounts] = useState({ labs: 0, papers: 0, projects: 0, hypotheses: 0 });
  const [recentHypotheses, setRecentHypotheses] = useState<{ id: string; research_question?: string; status?: string; created_at?: string }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('laboratories').select('id', { count: 'exact', head: true }),
      supabase.from('papers').select('id', { count: 'exact', head: true }),
      supabase.from('research_projects').select('id', { count: 'exact', head: true }),
      supabase.from('hypothesis_requests').select('id', { count: 'exact', head: true }),
    ]).then(([l, p, pr, h]) => {
      setCounts({ labs: l.count ?? 0, papers: p.count ?? 0, projects: pr.count ?? 0, hypotheses: h.count ?? 0 });
    });
    supabase.from('hypothesis_requests').select('id, research_question, status, created_at').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setRecentHypotheses(data ?? []));
  }, []);

  const statCards = [
    { label: 'Laboratories', icon: FlaskConical, href: '/laboratory', count: counts.labs, cta: 'View all' },
    { label: 'Papers', icon: FileText, href: '/papers', count: counts.papers, cta: 'View all' },
    { label: 'Projects', icon: FolderOpen, href: '/projects', count: counts.projects, cta: 'View all' },
    { label: 'Hypotheses', icon: Lightbulb, href: '/hypothesis/new', count: counts.hypotheses, cta: 'Generate' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your laboratories, papers, and hypothesis requests.</p>
        </div>
        <Link href="/hypothesis/new">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button><Sparkles className="h-4 w-4" />New Hypothesis</Button>
          </motion.div>
        </Link>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Link href={stat.href}>
                <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{stat.count}</p>
                          <p className="text-xs text-primary mt-1 flex items-center gap-1"><Plus className="h-3 w-3" />{stat.cta}</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Recent GenLayer Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentHypotheses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No hypotheses yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs">Once you generate a hypothesis, GenLayer validators will produce a decision that appears here.</p>
                  <Link href="/hypothesis/new">
                    <Button size="sm" variant="outline"><Sparkles className="h-3.5 w-3.5" />Generate your first hypothesis</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentHypotheses.map((h) => (
                    <Link key={h.id} href={`/hypothesis/${h.id}`} className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{h.research_question || h.id}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{h.created_at ? new Date(h.created_at).toLocaleDateString() : ''}</p>
                      </div>
                      <Badge variant={verdictToBadgeVariant(h.status ?? '')}>{h.status ?? 'PENDING'}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ClipboardCheck className="h-4 w-4 text-primary" />Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-2">No pending reviews.</p>
                <Link href="/review" className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                  Go to review queue <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Plus className="h-4 w-4 text-primary" />Get Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: 'Create a Laboratory', href: '/laboratory/new', icon: FlaskConical },
                    { label: 'Register a Paper', href: '/papers/new', icon: FileText },
                    { label: 'Start a Project', href: '/projects/new', icon: FolderOpen },
                    { label: 'Generate Hypothesis', href: '/hypothesis/new', icon: Lightbulb },
                  ].map((l) => {
                    const Icon = l.icon;
                    return (
                      <Link key={l.href} href={l.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                        <Icon className="h-3.5 w-3.5 text-primary shrink-0" />{l.label}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
