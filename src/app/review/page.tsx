'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClipboardCheck, ArrowRight, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge, verdictToBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { humanReviewHypothesis, markHypothesisActivated } from '@/lib/genlayer';
import { syncHumanReview } from '@/lib/supabase-sync';
import { supabase } from '@/lib/supabase';
import { useWallet } from '@/hooks/useWallet';

type ReviewDecision = 'APPROVED' | 'UNSUPPORTED' | 'NEEDS_REVISION';

export default function ReviewPage() {
  const wallet = useWallet();
  const [queue, setQueue] = useState<{ id: string; research_question?: string; status?: string; created_at?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from('hypothesis_requests')
      .select('id, research_question, status, created_at')
      .in('status', ['NEEDS_REVIEW', 'NEEDS_REVISION', 'pending'])
      .order('created_at', { ascending: false })
      .then(({ data }) => { setQueue(data ?? []); setLoading(false); });
  }, []);

  async function handleReview(decision: ReviewDecision) {
    if (!selected) return;
    if (!wallet.privateKey) { setSubmitError('Please set up your wallet in Settings first.'); return; }
    if (!reviewReason.trim()) {
      setSubmitError('Please provide a review reason before submitting.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const evidenceHash = '0x' + Array.from(
        new Uint8Array(
          await crypto.subtle.digest('SHA-256', new TextEncoder().encode(reviewReason + selected + new Date().toISOString()))
        )
      ).map((b) => b.toString(16).padStart(2, '0')).join('');

      const result = await humanReviewHypothesis(
        wallet.privateKey!,
        selected,
        decision,
        reviewReason,
        reviewerNotes,
        evidenceHash,
      );

      if (decision === 'APPROVED') {
        await markHypothesisActivated(wallet.privateKey!, selected, evidenceHash, reviewerNotes);
      }

      await syncHumanReview({
        id: result.txHash,
        request_id: selected,
        reviewer_address: wallet.address ?? '',
        decision: decision === 'APPROVED' ? 'approve' : decision === 'UNSUPPORTED' ? 'reject' : 'revise',
        comments: [reviewReason, reviewerNotes].filter(Boolean).join('\n\n'),
        created_at: new Date().toISOString(),
      });

      // Update status in Supabase
      const newStatus = decision === 'APPROVED' ? 'HUMAN_APPROVED' : decision === 'UNSUPPORTED' ? 'HUMAN_REJECTED' : 'NEEDS_REVISION';
      await supabase.from('hypothesis_requests').update({ status: newStatus }).eq('id', selected);

      setCompleted((prev) => new Set([...prev, selected]));
      setSelected(null);
      setReviewReason('');
      setReviewerNotes('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  const pending = queue.filter((item) => !completed.has(item.id));

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Human Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hypotheses flagged for human review by GenLayer consensus validators.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Review Queue
          </CardTitle>
          <CardDescription>
            These hypotheses received a NEEDS_REVIEW verdict and require human scientific assessment
            before activation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hypotheses pending review.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pending.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between py-3 -mx-2 px-2 rounded-lg transition-colors cursor-pointer ${
                    selected === item.id
                      ? 'bg-primary/5 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelected(selected === item.id ? null : item.id);
                    setSubmitError('');
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.research_question || item.id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge variant={verdictToBadgeVariant(item.status ?? '')}>
                      {item.status ?? 'REVIEW'}
                    </Badge>
                    <Link
                      href={`/hypothesis/${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Review Decision</CardTitle>
            <CardDescription>
              Your decision will be recorded on GenLayer as a human review event.
              View the{' '}
              <Link href={`/hypothesis/${selected}`} className="text-primary hover:underline">
                full hypothesis case file
              </Link>{' '}
              before deciding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}
            <Textarea
              id="reason"
              label="Review Reason (required)"
              placeholder="Summarize your scientific assessment. What evidence supports or undermines this hypothesis?"
              value={reviewReason}
              onChange={(e) => setReviewReason(e.target.value)}
              required
              className="min-h-[100px]"
            />
            <Textarea
              id="notes"
              label="Additional Notes (optional)"
              placeholder="Methodological concerns, suggested experiments, literature gaps…"
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              className="min-h-[70px]"
            />
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                onClick={() => handleReview('APPROVED')}
                loading={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve & Activate
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReview('NEEDS_REVISION')}
                loading={submitting}
              >
                <RefreshCw className="h-4 w-4" />
                Request Revision
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReview('UNSUPPORTED')}
                loading={submitting}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
