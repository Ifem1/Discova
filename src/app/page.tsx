'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  FlaskConical, Shield, Lightbulb, FileSearch,
  ArrowRight, Sparkles, Network, CheckCircle2,
  Quote, Star, Users, BookOpen, Atom, Zap, Crown, Check
} from 'lucide-react';
import { AnimatedScoreBar } from '@/components/ui/AnimatedScoreBar';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

// Curated Unsplash images — science / research
const HERO_IMAGE = 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&q=80&auto=format&fit=crop'; // lab glassware / science
const FEATURE_IMAGES = [
  'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&q=75&auto=format&fit=crop', // microscope
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=75&auto=format&fit=crop', // brain scan
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=75&auto=format&fit=crop', // data dashboard
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=75&auto=format&fit=crop', // lab
];
const LAB_IMAGE = 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1000&q=80&auto=format&fit=crop'; // scientist in lab

const features = [
  {
    icon: FileSearch,
    title: 'Literature Synthesis',
    description: 'Upload PDFs, papers, and datasets. Discova connects findings across your entire literature collection using semantic analysis.',
    image: FEATURE_IMAGES[0],
  },
  {
    icon: Lightbulb,
    title: 'Hypothesis Generation',
    description: 'Submit research questions and receive evidence-backed, testable hypotheses with cited supporting evidence from your papers.',
    image: FEATURE_IMAGES[1],
  },
  {
    icon: Network,
    title: 'AI Consensus Verification',
    description: 'GenLayer validators independently assess novelty, plausibility, and evidence support through non-deterministic consensus.',
    image: FEATURE_IMAGES[2],
  },
  {
    icon: Shield,
    title: 'On-Chain Audit Trail',
    description: 'Every hypothesis verdict, score, and review is recorded on-chain for transparent, tamper-proof auditability.',
    image: FEATURE_IMAGES[3],
  },
];

const steps = [
  { step: '01', title: 'Upload Literature', description: 'Add papers, PDFs, and research notes to your laboratory collection.' },
  { step: '02', title: 'Submit Research Question', description: 'Define your objective, domain, constraints, and desired outcome.' },
  { step: '03', title: 'Consensus Adjudication', description: 'GenLayer validators independently assess evidence support, novelty, and plausibility.' },
  { step: '04', title: 'Review & Activate', description: 'Inspect scores, citations, and rationale. Activate approved hypotheses on-chain.' },
];

const testimonials = [
  {
    quote: "Discova cut our hypothesis scoping phase from weeks to hours. The consensus scores give us instant confidence about which directions are worth pursuing.",
    name: "Dr. Sarah Chen",
    role: "Principal Investigator, Genomics Lab",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&q=80&auto=format&fit=crop&crop=face",
  },
  {
    quote: "The on-chain audit trail has been transformative for our grant reporting. Every hypothesis decision is traceable, timestamped, and independently verified.",
    name: "Prof. Marcus Rivera",
    role: "Research Director, Neuroscience Institute",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&q=80&auto=format&fit=crop&crop=face",
  },
  {
    quote: "We submitted three competing hypotheses and GenLayer consensus ranked them by evidence quality. It changed which experiment we ran first — and we were right to listen.",
    name: "Dr. Aisha Okonkwo",
    role: "Molecular Biologist, University of Lagos",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&q=80&auto=format&fit=crop&crop=face",
  },
];

const stats = [
  { icon: BookOpen, value: 12400, suffix: '+', label: 'Papers Indexed' },
  { icon: Lightbulb, value: 3800, suffix: '+', label: 'Hypotheses Generated' },
  { icon: FlaskConical, value: 420, suffix: '+', label: 'Active Laboratories' },
  { icon: Users, value: 98, suffix: '%', label: 'Consensus Accuracy' },
];

function FloatingParticles() {
  const particles = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function FadeInSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Research laboratory"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-background/80 dark:bg-background/88" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        </div>
        <FloatingParticles />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/20 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                Powered by GenLayer Intelligent Contracts
              </span>
            </motion.div>

            {['Evidence-backed', 'hypothesis generation', 'through AI consensus'].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                className={`block text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] ${
                  i === 2 ? 'text-primary' : 'text-foreground'
                }`}
              >
                {word}
              </motion.span>
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            >
              Discova helps researchers generate testable hypotheses verified by multiple AI validators.
              Every verdict is scored, cited, and permanently recorded on GenLayer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all hover:gap-3 shadow-lg shadow-primary/25"
              >
                Start Generating Hypotheses
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                How It Works
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <div className="h-10 w-6 rounded-full border-2 border-border flex items-start justify-center pt-1.5">
            <div className="h-2 w-1 rounded-full bg-muted-foreground" />
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-muted/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <FadeInSection key={stat.label} delay={i * 0.08}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground tabular-nums">
                        <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Scientific rigor meets decentralized verification
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Not a chatbot. Not a search engine. A consensus-driven hypothesis generation platform.
            </p>
          </FadeInSection>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeInSection key={f.title} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-shadow"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <Image
                        src={f.image}
                        alt={f.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/90 backdrop-blur-sm">
                          <Icon className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-2 flex-1">
                      <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                    </div>
                  </motion.div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              From literature to verified hypothesis
            </h2>
            <p className="mt-4 text-muted-foreground">
              Four steps. One consensus verdict. Permanently on-chain.
            </p>
          </FadeInSection>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <FadeInSection key={s.step} delay={i * 0.12}>
                  <div className="flex flex-col gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20"
                    >
                      <span className="text-sm font-bold text-primary">{s.step}</span>
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Consensus Explainer with animated scores */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <FadeInSection>
              <div className="relative">
                <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden">
                  <Image
                    src={LAB_IMAGE}
                    alt="Scientific consensus"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                </div>
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-5 -right-4 rounded-xl border border-border bg-card/95 backdrop-blur-sm p-4 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <Atom className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">GenLayer Consensus</p>
                      <p className="text-xs text-muted-foreground">5 validators · FINALIZED</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </motion.div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    Why consensus matters for scientific hypotheses
                  </h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Scientific interpretation is inherently non-deterministic. Different AI models can interpret
                    the same evidence differently, connect papers in different ways, and propose different mechanisms.
                  </p>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    GenLayer&apos;s Intelligent Contracts send each hypothesis through multiple independent validators
                    who assess evidence support, novelty, and plausibility — producing a consensus verdict
                    that no single model could reliably deliver alone.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Live Consensus Scores
                  </h3>
                  {[
                    { label: 'Evidence Support', value: 87 },
                    { label: 'Novelty', value: 72 },
                    { label: 'Citation Quality', value: 91 },
                    { label: 'Plausibility', value: 78 },
                    { label: 'Testability', value: 85 },
                  ].map((s, i) => (
                    <AnimatedScoreBar key={s.label} label={s.label} score={s.value} delay={i * 0.1} />
                  ))}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                    className="flex items-center gap-2 pt-1"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Verdict: APPROVED — Consensus Reached
                    </span>
                  </motion.div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Trusted by researchers worldwide
            </h2>
            <p className="mt-4 text-muted-foreground">
              From genomics to neuroscience, Discova is accelerating discovery.
            </p>
          </FadeInSection>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeInSection key={t.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 h-full"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-primary/40" />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t.quote}</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0">
                      <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Start generating hypotheses for free. Upgrade when you need more.
            </p>
          </FadeInSection>

          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            <FadeInSection>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-border bg-card p-8 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-lg font-bold text-foreground">Free</span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">8</span>
                  <span className="text-muted-foreground ml-2">Gen / month</span>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                  {['8 hypothesis generations per month', 'Full 6-dimension consensus scoring', 'On-chain audit trail', 'Unlimited papers & laboratories', 'Human review workflow'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors w-full">
                  Get Started Free
                </Link>
              </motion.div>
            </FadeInSection>

            <FadeInSection delay={0.1}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-8 h-full flex flex-col relative">
                <div className="absolute -top-3 right-6">
                  <span className="text-xs font-bold uppercase bg-primary text-primary-foreground px-3 py-1 rounded-full">Popular</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Crown className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-lg font-bold text-foreground">Pro</span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">50</span>
                  <span className="text-muted-foreground ml-2">Gen / month</span>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                  {['50 hypothesis generations per month', 'Priority consensus queue', 'Advanced analytics dashboard', 'Team collaboration & roles', 'API access for integrations'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity w-full shadow-lg shadow-primary/25">
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Pro
                </Link>
              </motion.div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8" />
        </div>
        <FloatingParticles />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <FadeInSection>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block mb-6"
            >
              <FlaskConical className="h-14 w-14 text-primary mx-auto" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Ready to discover your next hypothesis?
            </h2>
            <p className="mt-5 text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Upload your literature, define your research question, and let GenLayer consensus
              verify your next breakthrough. Free to start.
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block mt-10"
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-10 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xl shadow-primary/30"
              >
                <Sparkles className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </FadeInSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">D</span>
              </div>
              <span className="text-base font-bold text-foreground">Discova</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
              <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GenLayer Docs</a>
            </div>
            <p className="text-xs text-muted-foreground">
              Built on GenLayer StudioNet · Chain ID 61999
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
