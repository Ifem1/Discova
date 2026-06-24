'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FlaskConical, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fetchAllLaboratories } from '@/lib/supabase-sync';

export default function LaboratoryPage() {
  const [labs, setLabs] = useState<{ id: string; name: string; research_area?: string; status?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllLaboratories().then((data) => { setLabs(data); setLoading(false); });
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laboratories</h1>
          <p className="text-sm text-muted-foreground mt-1">Your research laboratories on GenLayer.</p>
        </div>
        <Link href="/laboratory/new">
          <Button><Plus className="h-4 w-4" />New Laboratory</Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : labs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No laboratories yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">Create your first laboratory to start registering papers and generating hypotheses.</p>
            <Link href="/laboratory/new"><Button size="sm"><Plus className="h-3.5 w-3.5" />Create Laboratory</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => (
            <Link key={lab.id} href={`/laboratory/${lab.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-primary shrink-0" />
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">{lab.name}</h3>
                    </div>
                    <Badge variant="approved">{lab.status ?? 'active'}</Badge>
                  </div>
                  {lab.research_area && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{lab.research_area}</p>
                  )}
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
