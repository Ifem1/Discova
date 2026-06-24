import { supabase } from './supabase';

// All column names are snake_case to match the Postgres schema.

export async function syncLaboratory(lab: {
  id: string; name: string; research_area?: string; metadata_hash?: string;
  owner?: string; status?: string; created_at?: string;
}) {
  const { error } = await supabase.from('laboratories').upsert(lab);
  if (error) throw new Error('Failed to sync laboratory: ' + error.message);
}

export async function syncPaper(paper: {
  id: string; laboratory_id?: string; title?: string; authors?: string;
  doi?: string; publication_year?: number; metadata_hash?: string;
  status?: string; pdf_url?: string; created_at?: string;
}) {
  const { error } = await supabase.from('papers').upsert(paper);
  if (error) throw new Error('Failed to sync paper: ' + error.message);
}

export async function syncProject(project: {
  id: string; laboratory_id?: string; title?: string; objective?: string;
  domain?: string; metadata_hash?: string; status?: string; created_at?: string;
}) {
  const { error } = await supabase.from('research_projects').upsert(project);
  if (error) throw new Error('Failed to sync project: ' + error.message);
}

export async function syncHypothesisRequest(req: {
  id: string; laboratory_id?: string; project_id?: string;
  research_question?: string; existing_evidence?: string; constraints?: string;
  desired_outcome?: string; paper_ids?: string[]; status?: string; created_at?: string;
}) {
  const { error } = await supabase.from('hypothesis_requests').upsert(req);
  if (error) throw new Error('Failed to sync hypothesis request: ' + error.message);
}

export async function syncDecision(decision: {
  id: string; request_id?: string; verdict?: string; hypothesis?: string;
  scores?: object; findings?: object; tx_hash?: string; explorer_url?: string; created_at?: string;
}) {
  const { error } = await supabase.from('hypothesis_decisions').upsert(decision);
  if (error) throw new Error('Failed to sync decision: ' + error.message);
}

export async function syncHumanReview(review: {
  id: string; request_id?: string; reviewer_address?: string;
  decision?: string; comments?: string; created_at?: string;
}) {
  const { error } = await supabase.from('human_reviews').upsert(review);
  if (error) throw new Error('Failed to sync human review: ' + error.message);
}

export async function syncAuditEvent(event: {
  id: string; request_id?: string; action?: string; actor?: string;
  details?: string; tx_hash?: string; created_at?: string;
}) {
  const { error } = await supabase.from('audit_events').upsert(event);
  if (error) throw new Error('Failed to sync audit event: ' + error.message);
}

// ------------------------------------------------------------------
// Fetch helpers (used by dropdowns and list pages)
// ------------------------------------------------------------------

export async function fetchLaboratories(ownerAddress: string) {
  const { data, error } = await supabase
    .from('laboratories')
    .select('id, name, research_area, status, created_at')
    .eq('owner', ownerAddress)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function fetchAllLaboratories() {
  const { data, error } = await supabase
    .from('laboratories')
    .select('id, name, research_area, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function fetchPapers(labId: string) {
  const { data, error } = await supabase
    .from('papers')
    .select('id, title, authors, doi, publication_year, status')
    .eq('laboratory_id', labId)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function fetchProjects(labId?: string) {
  let q = supabase.from('research_projects').select('id, title, domain, laboratory_id, status').eq('status', 'active');
  if (labId) q = q.eq('laboratory_id', labId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function fetchHypothesisRequests(labId?: string) {
  let q = supabase.from('hypothesis_requests').select('*').order('created_at', { ascending: false });
  if (labId) q = q.eq('laboratory_id', labId);
  const { data, error } = await q;
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function fetchDecisions(requestId: string) {
  const { data, error } = await supabase
    .from('hypothesis_decisions')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function fetchAuditEvents(requestId: string) {
  const { data, error } = await supabase
    .from('audit_events')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}