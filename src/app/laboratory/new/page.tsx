'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { createLaboratory, getLaboratoryIndex } from '@/lib/genlayer';
import { syncLaboratory } from '@/lib/supabase-sync';
import { useWallet } from '@/hooks/useWallet';

export default function NewLaboratoryPage() {
  const router = useRouter();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', researchArea: '', locationContext: '', description: '' });

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet.privateKey) {
      setError('Please connect your wallet first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const metadataHash = Array.from(new TextEncoder().encode(JSON.stringify({ description: form.description }))).map(b => b.toString(16).padStart(2, '0')).join('');
      const result = await createLaboratory(
        wallet.privateKey,
        form.name,
        form.researchArea,
        form.locationContext,
        metadataHash
      );
      // Read back the contract-assigned lab ID from the index
      const labIds = await getLaboratoryIndex();
      const labId = labIds[labIds.length - 1] || result.txHash;
      await syncLaboratory({
        id: labId,
        name: form.name,
        research_area: form.researchArea,
        metadata_hash: metadataHash,
        owner: wallet.address ?? '',
        status: 'active',
        created_at: new Date().toISOString(),
      });
      router.push('/laboratory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create laboratory.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Create Laboratory
          </CardTitle>
          <CardDescription>
            Register a new research laboratory on GenLayer StudioNet. This creates an on-chain record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!wallet.connected && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <Wallet className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Wallet required</span> â€” connect to sign the GenLayer transaction.
              </div>
              <Button size="sm" variant="outline" onClick={() => window.location.href = "/settings"}>
                Connect
              </Button>
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Laboratory Name"
              placeholder="e.g., Genomics Research Lab"
              value={form.name}
              onChange={field('name')}
              required
            />
            <Input
              id="area"
              label="Research Area"
              placeholder="e.g., Molecular Biology"
              value={form.researchArea}
              onChange={field('researchArea')}
              required
            />
            <Input
              id="location"
              label="Location / Institution (optional)"
              placeholder="e.g., MIT, Cambridge MA"
              value={form.locationContext}
              onChange={field('locationContext')}
            />
            <Textarea
              id="desc"
              label="Description"
              placeholder="Describe the laboratory's research focus, goals, and infrastructureâ€¦"
              value={form.description}
              onChange={field('description')}
              className="min-h-[80px]"
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} disabled={!wallet.connected}>
                Create Laboratory
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

