'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { registerPaper, getLaboratoryPaperIndex } from '@/lib/genlayer';
import { syncPaper, fetchAllLaboratories } from '@/lib/supabase-sync';
import { useWallet } from '@/hooks/useWallet';

export default function NewPaperPage() {
  const router = useRouter();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [labs, setLabs] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ labId: '', title: '', authors: '', doi: '', year: '', summary: '' });

  useEffect(() => {
    fetchAllLaboratories().then(setLabs);
  }, []);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet.privateKey) { setError('Please set up your wallet in Settings first.'); return; }
    if (!form.labId) { setError('Please select a laboratory.'); return; }
    setLoading(true); setError('');
    try {
      const metadata_hash = Array.from(new TextEncoder().encode(JSON.stringify({ title: form.title, doi: form.doi }))).map(b => b.toString(16).padStart(2, '0')).join('');
      const result = await registerPaper(wallet.privateKey, form.labId, form.title, form.authors, form.doi, parseInt(form.year), form.summary, metadata_hash);
      const paperIds = await getLaboratoryPaperIndex(form.labId);
      const paperId = paperIds[paperIds.length - 1] || result.txHash;
      await syncPaper({ id: paperId, laboratory_id: form.labId, title: form.title, authors: form.authors, doi: form.doi, publication_year: parseInt(form.year), metadata_hash, status: 'active', created_at: new Date().toISOString() });
      router.push('/papers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register paper.');
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Register Paper</CardTitle>
          <CardDescription>Register a scientific paper on GenLayer for use in hypothesis generation.</CardDescription>
        </CardHeader>
        <CardContent>
          {!wallet.connected && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <Wallet className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Wallet required</span> — go to Settings to set up your wallet.</div>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/settings'}>Setup</Button>
            </div>
          )}
          {error && <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select id="lab" label="Laboratory" options={[{ value: '', label: labs.length ? 'Select laboratory…' : 'No laboratories yet — create one first' }, ...labs.map(l => ({ value: l.id, label: l.name }))]} value={form.labId} onChange={field('labId')} required />
            <Input id="title" label="Paper Title" placeholder="Full title of the paper" value={form.title} onChange={field('title')} required />
            <Input id="authors" label="Authors" placeholder="e.g., Zhang, Y.; Smith, J." value={form.authors} onChange={field('authors')} required />
            <div className="grid grid-cols-2 gap-4">
              <Input id="doi" label="DOI / Source URL" placeholder="10.xxxx/xxxxx or https://..." value={form.doi} onChange={field('doi')} />
              <Input id="year" label="Publication Year" type="number" placeholder="2024" value={form.year} onChange={field('year')} required />
            </div>
            <Textarea id="summary" label="Summary / Abstract" placeholder="Paste the abstract or a brief summary of the paper's findings…" value={form.summary} onChange={field('summary')} className="min-h-[100px]" hint="Stored on-chain and used by GenLayer validators when generating hypotheses." />
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} disabled={!wallet.connected}>Register Paper</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
