'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function getColor(pct: number) {
  if (pct >= 75) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-amber-500';
  if (pct >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

interface AnimatedScoreBarProps {
  label: string;
  score: number; // 0–1 or 0–100
  delay?: number;
}

export function AnimatedScoreBar({ label, score, delay = 0 }: AnimatedScoreBarProps) {
  const pct = score > 1 ? score : Math.round(score * 100);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <motion.span
          className="font-semibold text-foreground tabular-nums"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: delay + 0.3, duration: 0.3 }}
        >
          {pct}%
        </motion.span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getColor(pct)}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
