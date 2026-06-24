'use client';

import { use } from 'react';
import Link from 'next/link';
import { FolderOpen, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <h1 className="text-xl font-bold text-foreground">Project #{id}</h1>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Project details will appear here</p>
          <p className="text-xs text-muted-foreground max-w-xs">Live data fetched from GenLayer once the contract read functions are wired up.</p>
        </CardContent>
      </Card>
    </div>
  );
}