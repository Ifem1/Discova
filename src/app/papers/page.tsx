'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function PapersPage() {
  const [papers, setPapers] = useState<{ id: string; title?: string; authors?: string; doi?: string; status?: string; laboratory_id?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('papers').select('id, title, authors, doi, status, laboratory_id').order('created_at', { ascending: false })
      .then(({ data }) => { setPapers(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Papers</h1>
          <p className="text-sm text-muted-foreground mt-1">Research papers registered on GenLayer.</p>
        </div>
        <Link href="/papers/new">
          <Button><Plus className="h-4 w-4" />Register Paper</Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : papers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No papers registered</p>
            <p className="text-xs text-muted-foreground max-w-xs">Register research papers to use as evidence when generating hypotheses.</p>
            <Link href="/papers/new"><Button size="sm"><Plus className="h-3.5 w-3.5" />Register Paper</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((p) => (
            <Link key={p.id} href={`/papers/${p.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">{p.title ?? 'Untitled'}</h3>
                    </div>
                    <Badge variant="approved">{p.status ?? 'active'}</Badge>
                  </div>
                  {p.authors && <p className="text-xs text-muted-foreground line-clamp-1">{p.authors}</p>}
                  {p.doi && <p className="text-xs text-muted-foreground font-mono">{p.doi}</p>}
                  <div className="mt-auto pt-2 flex items-center gap-1 text-xs text-primary">
                    View details <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
