'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, Lightbulb, Sparkles, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, FileText, FlaskConical, ExternalLink, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, verdictToBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getHypothesisRequest, getLatestDecisionForRequest, getExplorerUrl } from '@/lib/genlayer';

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function VerdictIcon({ verdict }: { verdict: string }) {
  switch (verdict) {
    case 'APPROVED': return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
    case 'UNSUPPORTED': return <XCircle className="h-6 w-6 text-red-500" />;
    case 'NEEDS_REVISION': return <RefreshCw className="h-6 w-6 text-amber-500" />;
    case 'NEEDS_REVIEW': return <AlertTriangle className="h-6 w-6 text-blue-500" />;
    default: return <Clock className="h-6 w-6 text-muted-foreground" />;
  }
}

export default function HypothesisCaseFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [request, setRequest] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const req = await getHypothesisRequest(id);
        setRequest(req);
        if (req) {
          const dec = await getLatestDecisionForRequest(id);
          setDecision(dec);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hypothesis data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="py-16 text-center text-sm text-muted-foreground">Loading hypothesis data from GenLayer…</div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hypothesis Case File · Request #{id}</p>
          </div>
          <h1 className="text-xl font-bold text-foreground">Hypothesis #{id}</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{error || 'Hypothesis request not found. It may still be processing on GenLayer.'}</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}><RefreshCw className="h-3.5 w-3.5" />Retry</Button>
              <Link href="/hypothesis/new"><Button size="sm"><Sparkles className="h-3.5 w-3.5" />New Hypothesis</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const review = decision?.hypothesis_review || {};
  const verdict = review.verdict || request.status || 'PENDING';
  const scores = [
    { label: 'Evidence Support', score: review.evidence_support_score ?? 0 },
    { label: 'Novelty', score: review.novelty_score ?? 0 },
    { label: 'Citation Quality', score: review.citation_quality_score ?? 0 },
    { label: 'Plausibility', score: review.plausibility_score ?? 0 },
    { label: 'Explainability', score: review.explainability_score ?? 0 },
    { label: 'Testability', score: review.testability_score ?? 0 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hypothesis Case File · Request #{id}</p>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">Hypothesis #{id}</h1>
          <Badge variant={verdictToBadgeVariant(verdict)}>{verdict}</Badge>
        </div>
      </motion.div>

      {/* Verdict & Scores */}
      {decision && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <VerdictIcon verdict={verdict} />
                Consensus Verdict: {verdict}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {scores.map(s => (
                  <ScoreBar key={s.label} label={s.label} score={s.score} />
                ))}
              </div>
              {review.confidence !== undefined && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Confidence</span>
                    <span className="font-bold text-foreground">{review.confidence}%</span>
                  </div>
                </div>
              )}
              {review.novelty_band && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Novelty Band:</span>
                  <Badge variant="outline">{review.novelty_band}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Hypothesis */}
      {review.generated_hypothesis && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-primary" />
                Generated Hypothesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{review.generated_hypothesis}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mechanism & Novelty */}
      {(review.mechanism_summary || review.novelty_assessment) && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="grid gap-4 sm:grid-cols-2">
            {review.mechanism_summary && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Mechanism Summary</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{review.mechanism_summary}</p></CardContent>
              </Card>
            )}
            {review.novelty_assessment && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Novelty Assessment</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{review.novelty_assessment}</p></CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}

      {/* Evidence & Findings */}
      {(review.supporting_evidence?.length > 0 || review.conflicting_evidence?.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="grid gap-4 sm:grid-cols-2">
            {review.supporting_evidence?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Supporting Evidence</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {review.supporting_evidence.map((e: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-emerald-500 shrink-0">•</span>{e}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {review.conflicting_evidence?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4 text-red-500" />Conflicting Evidence</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {review.conflicting_evidence.map((e: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-red-500 shrink-0">•</span>{e}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}

      {/* Recommendations & Testability */}
      {(review.recommendations?.length > 0 || review.testability_conditions?.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="grid gap-4 sm:grid-cols-2">
            {review.recommendations?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Recommendations</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {review.recommendations.map((r: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary shrink-0">→</span>{r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {review.testability_conditions?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Testability Conditions</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {review.testability_conditions.map((t: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-blue-500 shrink-0">◆</span>{t}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}

      {/* Rationale */}
      {review.rationale && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader><CardTitle className="text-sm">Rationale</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{review.rationale}</p></CardContent>
          </Card>
        </motion.div>
      )}

      {/* Request Details */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Lab ID</span>
                <p className="font-mono text-xs text-foreground">{request.lab_id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Project ID</span>
                <p className="font-mono text-xs text-foreground">{request.project_id}</p>
              </div>
            </div>
            {request.research_question && (
              <div>
                <span className="text-muted-foreground">Research Question</span>
                <p className="text-foreground mt-1">{request.research_question}</p>
              </div>
            )}
            {request.submitted_at && (
              <div>
                <span className="text-muted-foreground">Submitted</span>
                <p className="text-foreground">{new Date(request.submitted_at).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/hypothesis/new"><Button size="sm"><Sparkles className="h-3.5 w-3.5" />New Hypothesis</Button></Link>
        {(verdict === 'NEEDS_REVIEW' || verdict === 'NEEDS_REVISION') && (
          <Link href="/review"><Button size="sm" variant="outline"><Shield className="h-3.5 w-3.5" />Submit Review</Button></Link>
        )}
        <Button size="sm" variant="outline" onClick={() => window.location.reload()}><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>
      </div>
    </div>
  );
}
