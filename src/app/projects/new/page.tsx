'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createResearchProject, getLaboratoryProjectIndex } from '@/lib/genlayer';
import { syncProject, fetchAllLaboratories } from '@/lib/supabase-sync';
import { useWallet } from '@/hooks/useWallet';

export default function NewProjectPage() {
  const router = useRouter();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [labs, setLabs] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ labId: '', title: '', domain: '', objective: '' });

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
      const metadata_hash = Array.from(new TextEncoder().encode(JSON.stringify({ objective: form.objective }))).map(b => b.toString(16).padStart(2, '0')).join('');
      const result = await createResearchProject(wallet.privateKey, form.labId, form.title, form.domain, form.objective, metadata_hash);
      const projectIds = await getLaboratoryProjectIndex(form.labId);
      const projectId = projectIds[projectIds.length - 1] || result.txHash;
      await syncProject({ id: projectId, laboratory_id: form.labId, title: form.title, objective: form.objective, domain: form.domain, metadata_hash, status: 'active', created_at: new Date().toISOString() });
      router.push('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project.');
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-primary" />Create Research Project</CardTitle>
          <CardDescription>Register a new research project on GenLayer StudioNet.</CardDescription>
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
            <Input id="title" label="Project Title" placeholder="e.g., Metabolic Neuroprotection Initiative" value={form.title} onChange={field('title')} required />
            <Input id="domain" label="Research Domain" placeholder="e.g., Computational Neuroscience" value={form.domain} onChange={field('domain')} required />
            <Textarea id="objective" label="Research Objective" placeholder="Describe the primary research objective, hypotheses being explored, and expected outcomes…" value={form.objective} onChange={field('objective')} required className="min-h-[100px]" />
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} disabled={!wallet.connected}>Create Project</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
