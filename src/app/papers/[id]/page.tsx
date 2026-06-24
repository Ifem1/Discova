'use client';

import { use } from 'react';
import { FileText, ExternalLink, Calendar, Users, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const paper = {
    id,
    title: 'CRISPR-Cas9 in Gene Therapy: A Systematic Review',
    authors: 'Zhang, Y.; Smith, J.; Lee, K.',
    doi: '10.1234/abc',
    year: 2024,
    lab: 'Genomics Research Lab',
    status: 'active',
    metadataHash: 'abc123...',
    txHash: '0xabc123...',
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{paper.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{paper.lab}</p>
          </div>
        </div>
        <Badge variant="approved">{paper.status}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Authors:</span>
            <span className="text-foreground">{paper.authors}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Year:</span>
            <span className="text-foreground">{paper.year}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">DOI:</span>
            <span className="text-primary">{paper.doi}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tx Hash:</span>
            <span className="text-foreground font-mono text-xs">{paper.txHash}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
