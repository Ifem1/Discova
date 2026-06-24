'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, AlertCircle, Wallet, ArrowRight, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge, verdictToBadgeVariant } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { submitAndGenerateHypothesis, getProjectRequestIndex } from '@/lib/genlayer';
import { syncHypothesisRequest, fetchAllLaboratories, fetchProjects, fetchPapers, fetchHypothesisRequests } from '@/lib/supabase-sync';
import { useWallet } from '@/hooks/useWallet';

export default function NewHypothesisPage() {
  const router = useRouter();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [labs, setLabs] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [papers, setPapers] = useState<{ id: string; title?: string }[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [pastHypotheses, setPastHypotheses] = useState<{ id: string; research_question?: string; status?: string; created_at?: string }[]>([]);
  const [form, setForm] = useState({
    labId: '', projectId: '', researchQuestion: '',
    existingEvidenceSummary: '', constraintsSummary: '', desiredOutcomeSummary: '',
    domainContextSummary: '',
  });

  useEffect(() => {
    fetchAllLaboratories().then(setLabs);
    fetchHypothesisRequests().then(setPastHypotheses);
  }, []);
  useEffect(() => {
    if (form.labId) {
      fetchProjects(form.labId).then(setProjects);
      fetchPapers(form.labId).then(setPapers);
    } else {
      setProjects([]);
      setPapers([]);
    }
    setSelectedPapers(new Set());
  }, [form.labId]);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value });
  }

  function togglePaper(id: string) {
    setSelectedPapers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet.privateKey) { setError('Please set up your wallet in Settings first.'); return; }
    if (!form.labId || !form.projectId) { setError('Please select a laboratory and project.'); return; }
    if (!form.researchQuestion.trim()) { setError('Please enter a research question.'); return; }
    setLoading(true); setError('');
    try {
      const paperIdsCsv = Array.from(selectedPapers).join(',');
      const hashText = [form.researchQuestion, form.existingEvidenceSummary, paperIdsCsv, new Date().toISOString()].join('|');
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashText));
      const evidenceManifestHash = '0x' + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

      const result = await submitAndGenerateHypothesis(wallet.privateKey, {
        labId: form.labId, projectId: form.projectId, paperIdsCsv,
        researchQuestion: form.researchQuestion, existingEvidenceSummary: form.existingEvidenceSummary,
        constraintsSummary: form.constraintsSummary, desiredOutcomeSummary: form.desiredOutcomeSummary,
        domainContextSummary: form.domainContextSummary, evidenceManifestHash,
      });
      const reqIds = await getProjectRequestIndex(form.projectId);
      const reqId = reqIds[reqIds.length - 1] || result.txHash;
      await syncHypothesisRequest({
        id: reqId, laboratory_id: form.labId, project_id: form.projectId,
        research_question: form.researchQuestion, existing_evidence: form.existingEvidenceSummary,
        constraints: form.constraintsSummary, desired_outcome: form.desiredOutcomeSummary,
        paper_ids: Array.from(selectedPapers),
        status: 'pending', created_at: new Date().toISOString(),
      });
      router.push(`/hypothesis/${reqId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Make sure your wallet is set up in Settings.');
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      {pastHypotheses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-primary" />
              Previous Hypotheses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {pastHypotheses.map((h) => (
                <Link key={h.id} href={`/hypothesis/${h.id}`} className="flex items-center justify-between py-2.5 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground line-clamp-1">{h.research_question || h.id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{h.created_at ? new Date(h.created_at).toLocaleDateString() : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge variant={verdictToBadgeVariant(h.status ?? '')}>{h.status ?? 'PENDING'}</Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Generate Hypothesis</CardTitle>
          <CardDescription>Submit a research question to GenLayer consensus. Multiple AI validators independently assess evidence support, novelty, and plausibility.</CardDescription>
        </CardHeader>
        <CardContent>
          {!wallet.connected && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <Wallet className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Wallet required</span> — go to Settings to set up your wallet.</div>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/settings'}>Setup</Button>
            </div>
          )}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">On-Chain Transaction — takes 30–90 seconds</p>
              <p className="mt-1">The verdict is determined by consensus across multiple AI validators on GenLayer StudioNet.</p>
            </div>
          </div>
          {error && <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select id="lab" label="Laboratory" options={[{ value: '', label: labs.length ? 'Select laboratory…' : 'No labs yet' }, ...labs.map(l => ({ value: l.id, label: l.name }))]} value={form.labId} onChange={field('labId')} required />
              <Select id="project" label="Research Project" options={[{ value: '', label: form.labId ? (projects.length ? 'Select project…' : 'No projects in this lab') : 'Select a lab first' }, ...projects.map(p => ({ value: p.id, label: p.title }))]} value={form.projectId} onChange={field('projectId')} required />
            </div>

            {form.labId && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Referenced Papers {papers.length > 0 ? '(select all that apply)' : ''}</label>
                {papers.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No papers registered in this lab. You can still generate a hypothesis without papers.</p>
                ) : (
                  <div className="space-y-2 rounded-lg border border-border p-3 max-h-40 overflow-y-auto">
                    {papers.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground">
                        <input type="checkbox" checked={selectedPapers.has(p.id)} onChange={() => togglePaper(p.id)} className="rounded border-border" />
                        <span className="line-clamp-1">{p.title || p.id}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Textarea id="question" label="Research Question" placeholder="What specific research question do you want to investigate?" value={form.researchQuestion} onChange={field('researchQuestion')} required className="min-h-[80px]" />
            <Textarea id="evidence" label="Existing Evidence Summary" placeholder="Summarize what is already known from your registered papers…" value={form.existingEvidenceSummary} onChange={field('existingEvidenceSummary')} className="min-h-[100px]" />
            <Textarea id="domain" label="Domain Context" placeholder="Scientific domain, organism, tissue type, experimental model…" value={form.domainContextSummary} onChange={field('domainContextSummary')} />
            <Textarea id="constraints" label="Constraints & Scope" placeholder="Limitations, scope restrictions, excluded populations…" value={form.constraintsSummary} onChange={field('constraintsSummary')} />
            <Textarea id="outcome" label="Desired Outcome" placeholder="What type of hypothesis are you looking for?" value={form.desiredOutcomeSummary} onChange={field('desiredOutcomeSummary')} />
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} disabled={!wallet.connected} className="flex-1"><Sparkles className="h-4 w-4" />Submit to GenLayer Consensus</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
