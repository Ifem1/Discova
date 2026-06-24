'use client';

import { useState, useEffect } from 'react';
import { Shield, FlaskConical, FileText, FolderOpen, Lightbulb, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getLaboratoryIndex, getLaboratoryRequestIndex, getRequestAuditIndex, getAuditLog, getExplorerUrl } from '@/lib/genlayer';

const EVENT_ICONS: Record<string, typeof Shield> = {
  LABORATORY_CREATED: FlaskConical,
  PAPER_REGISTERED: FileText,
  RESEARCH_PROJECT_CREATED: FolderOpen,
  HYPOTHESIS_REQUEST_SUBMITTED: Lightbulb,
  GENLAYER_HYPOTHESIS_CONSENSUS_DECISION: CheckCircle2,
  LABORATORY_ROLE_ADDED: Shield,
};

const EVENT_COLORS: Record<string, string> = {
  LABORATORY_CREATED: 'text-blue-500',
  PAPER_REGISTERED: 'text-emerald-500',
  RESEARCH_PROJECT_CREATED: 'text-amber-500',
  HYPOTHESIS_REQUEST_SUBMITTED: 'text-purple-500',
  GENLAYER_HYPOTHESIS_CONSENSUS_DECISION: 'text-primary',
  LABORATORY_ROLE_ADDED: 'text-muted-foreground',
};

interface AuditEntry {
  audit_id: string;
  lab_id: string;
  request_id: string;
  event_type: string;
  actor: string;
  summary: string;
  data_hash: string;
  created_at: string;
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      try {
        const labIds = await getLaboratoryIndex();
        const allAuditIds: string[] = [];

        // Get audit events from all labs' requests
        for (const labId of labIds) {
          const requestIds = await getLaboratoryRequestIndex(labId);
          for (const reqId of requestIds) {
            const auditIds = await getRequestAuditIndex(reqId);
            allAuditIds.push(...auditIds);
          }
        }

        // Also try to get lab-level audit events (lab creation, paper registration, etc.)
        // These are stored with request_id="" so we check a few known audit IDs
        for (let i = 1; i <= 20; i++) {
          const auditId = `AUDIT-${i}`;
          try {
            const log = await getAuditLog(auditId);
            if (log && log.audit_id) {
              if (!allAuditIds.includes(auditId)) {
                allAuditIds.push(auditId);
              }
            }
          } catch {
            break;
          }
        }

        // Fetch all audit entries
        const entries: AuditEntry[] = [];
        for (const auditId of allAuditIds) {
          try {
            const log = await getAuditLog(auditId);
            if (log && log.audit_id) {
              entries.push(log as AuditEntry);
            }
          } catch {
            // skip failed entries
          }
        }

        // Sort by created_at descending
        entries.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        setEvents(entries);
      } catch (err) {
        console.error('Failed to load audit trail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, []);

  function formatEventType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/Genlayer/i, 'GenLayer');
  }

  function shortenAddress(addr: string): string {
    if (!addr || addr.length < 12) return addr;
    if (addr === 'GENLAYER_CONSENSUS') return 'GenLayer Consensus';
    return addr.slice(0, 6) + '…' + addr.slice(-4);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Trail</h1>
        <p className="text-sm text-muted-foreground mt-1">Immutable on-chain record of all GenLayer decisions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />On-Chain Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading audit trail from GenLayer…</div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No audit events yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">Every hypothesis submission, consensus decision, and human review is recorded here permanently on GenLayer StudioNet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {events.map((event, i) => {
                const Icon = EVENT_ICONS[event.event_type] || Shield;
                const color = EVENT_COLORS[event.event_type] || 'text-muted-foreground';
                return (
                  <div key={event.audit_id || i} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                    <div className={`mt-0.5 shrink-0 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{event.summary}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{formatEventType(event.event_type)}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>by {shortenAddress(event.actor)}</span>
                        {event.created_at && <span>{new Date(event.created_at).toLocaleString()}</span>}
                        {event.request_id && <span className="font-mono">{event.request_id}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
