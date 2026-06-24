import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus, ExecutionResult } from 'genlayer-js/types';
import { privateKeyToAccount } from 'viem/accounts';

const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_DISCOVA_CONTRACT_ADDRESS || ''
) as `0x${string}`;

const EXPLORER_URL =
  process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ||
  'https://explorer-studio.genlayer.com';

// ------------------------------------------------------------------
// Client factories
// Read client â€” no wallet needed, safe to create anywhere
// ------------------------------------------------------------------

function getReadClient() {
  return createClient({ chain: studionet });
}

// Write client — signs with the locally generated private key (no MetaMask needed)
function getWriteClient(privateKey: `0x${string}`) {
  if (typeof window === 'undefined')
    throw new Error('Write client only available in browser');
  const account = privateKeyToAccount(privateKey);
  // Pass the full LocalAccount object so genlayer-js uses it to sign directly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient({ chain: studionet, account: account as any });
}


// ------------------------------------------------------------------
// Core call helpers
// ------------------------------------------------------------------

function requireContract(): `0x${string}` {
  if (!CONTRACT_ADDRESS)
    throw new Error(
      'Contract address not configured. Deploy DiscovaContract to StudioNet and set NEXT_PUBLIC_DISCOVA_CONTRACT_ADDRESS.'
    );
  return CONTRACT_ADDRESS;
}

async function write(
  privateKey: `0x${string}`,
  functionName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[]
): Promise<{ txHash: string; explorerUrl: string }> {
  const client = getWriteClient(privateKey);
  const txHash = await client.writeContract({
    address: requireContract(),
    functionName,
    args,
    value: BigInt(0),
  });

  // Wait for ACCEPTED — poll every 4s for up to 5 minutes (75 retries)
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
    interval: 4000,
    retries: 75,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = receipt as any;
  if (r.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    const detail = r.error_message || 'execution error';
    throw new Error(
      `Transaction failed: ${detail}. Explorer: ${getExplorerUrl(txHash)}`
    );
  }

  return { txHash, explorerUrl: getExplorerUrl(txHash) };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function read(functionName: string, args: any[] = []): Promise<unknown> {
  const client = getReadClient();
  return client.readContract({
    address: requireContract(),
    functionName,
    args,
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

// ------------------------------------------------------------------
// URL helpers
// ------------------------------------------------------------------

export function getExplorerUrl(txHash: string): string {
  return `${EXPLORER_URL}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}

// ------------------------------------------------------------------
// Laboratory
// ------------------------------------------------------------------

export async function createLaboratory(
  privateKey: `0x${string}`,
  name: string,
  researchArea: string,
  locationContext: string,
  metadataHash: string
) {
  return write(privateKey, 'create_laboratory', [
    '',
    name,
    researchArea,
    locationContext,
    metadataHash,
    nowIso(),
  ]);
}

export async function addLaboratoryRole(
  privateKey: `0x${string}`,
  labId: string,
  wallet: string,
  role: string
) {
  return write(privateKey, 'add_laboratory_role', [labId, wallet, role, nowIso()]);
}

export async function setLaboratoryStatus(
  privateKey: `0x${string}`,
  labId: string,
  status: string
) {
  return write(privateKey, 'set_laboratory_status', [labId, status, nowIso()]);
}

export async function getLaboratory(labId: string) {
  const raw = await read('get_laboratory', [labId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getLaboratoryRole(labId: string, wallet: string) {
  return read('get_laboratory_role', [labId, wallet]);
}

export async function getLaboratoryIndex(): Promise<string[]> {
  const raw = await read('get_laboratory_index', []);
  if (!raw || raw === '') return [];
  return String(raw).split('|').filter(Boolean);
}

// ------------------------------------------------------------------
// Papers
// ------------------------------------------------------------------

export async function registerPaper(
  privateKey: `0x${string}`,
  labId: string,
  title: string,
  authors: string,
  doi: string,
  publicationYear: number,
  summary: string,
  metadataHash: string
) {
  return write(privateKey, 'register_paper', [
    '',
    labId,
    title,
    authors,
    doi,
    String(publicationYear),
    summary,
    metadataHash,
    nowIso(),
  ]);
}

export async function updatePaperSummary(
  privateKey: `0x${string}`,
  paperId: string,
  summary: string,
  metadataHash: string
) {
  return write(privateKey, 'update_paper_summary', [paperId, summary, metadataHash, nowIso()]);
}

export async function setPaperStatus(
  privateKey: `0x${string}`,
  paperId: string,
  status: string
) {
  return write(privateKey, 'set_paper_status', [paperId, status, nowIso()]);
}

export async function getPaper(paperId: string) {
  const raw = await read('get_paper', [paperId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getLaboratoryPaperIndex(labId: string): Promise<string[]> {
  const raw = await read('get_laboratory_paper_index', [labId]);
  if (!raw || raw === '') return [];
  return String(raw).split('|').filter(Boolean);
}

// ------------------------------------------------------------------
// Research Projects
// ------------------------------------------------------------------

export async function createResearchProject(
  privateKey: `0x${string}`,
  labId: string,
  title: string,
  domain: string,
  objective: string,
  metadataHash: string
) {
  return write(privateKey, 'create_research_project', [
    '',
    labId,
    title,
    domain,
    objective,
    metadataHash,
    nowIso(),
  ]);
}

export async function updateProjectSummary(
  privateKey: `0x${string}`,
  projectId: string,
  objective: string,
  metadataHash: string
) {
  return write(privateKey, 'update_project_summary', [projectId, objective, metadataHash, nowIso()]);
}

export async function setProjectStatus(
  privateKey: `0x${string}`,
  projectId: string,
  status: string
) {
  return write(privateKey, 'set_project_status', [projectId, status, nowIso()]);
}

export async function getProject(projectId: string) {
  const raw = await read('get_project', [projectId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getLaboratoryProjectIndex(labId: string): Promise<string[]> {
  const raw = await read('get_laboratory_project_index', [labId]);
  if (!raw || raw === '') return [];
  return String(raw).split('|').filter(Boolean);
}

// ------------------------------------------------------------------
// Hypothesis generation â€” core GenLayer consensus write
// ------------------------------------------------------------------

export async function submitAndGenerateHypothesis(
  privateKey: `0x${string}`,
  params: {
    labId: string;
    projectId: string;
    paperIdsCsv: string;
    researchQuestion: string;
    existingEvidenceSummary: string;
    constraintsSummary: string;
    desiredOutcomeSummary: string;
    domainContextSummary: string;
    evidenceManifestHash: string;
  }
) {
  const ts = nowIso();
  return write(privateKey, 'submit_and_generate_hypothesis', [
    '',
    params.labId,
    params.projectId,
    params.paperIdsCsv,
    params.researchQuestion,
    params.existingEvidenceSummary,
    params.constraintsSummary,
    params.desiredOutcomeSummary,
    params.domainContextSummary,
    params.evidenceManifestHash,
    ts,
    ts,
  ]);
}

export async function submitHypothesisRequest(
  privateKey: `0x${string}`,
  params: {
    labId: string;
    projectId: string;
    paperIdsCsv: string;
    researchQuestion: string;
    existingEvidenceSummary: string;
    constraintsSummary: string;
    desiredOutcomeSummary: string;
    domainContextSummary: string;
    evidenceManifestHash: string;
  }
) {
  return write(privateKey, 'submit_hypothesis_request', [
    '',
    params.labId,
    params.projectId,
    params.paperIdsCsv,
    params.researchQuestion,
    params.existingEvidenceSummary,
    params.constraintsSummary,
    params.desiredOutcomeSummary,
    params.domainContextSummary,
    params.evidenceManifestHash,
    nowIso(),
  ]);
}

export async function adjudicateHypothesisRequest(
  privateKey: `0x${string}`,
  requestId: string
) {
  return write(privateKey, 'adjudicate_hypothesis_request', [requestId, nowIso()]);
}

// ------------------------------------------------------------------
// Hypothesis reads
// ------------------------------------------------------------------

export async function getHypothesisRequest(requestId: string) {
  const raw = await read('get_hypothesis_request', [requestId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getLatestDecisionForRequest(requestId: string) {
  const raw = await read('get_latest_decision_for_request', [requestId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getDecision(decisionId: string) {
  const raw = await read('get_decision', [decisionId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getLaboratoryRequestIndex(labId: string): Promise<string[]> {
  const raw = await read('get_laboratory_request_index', [labId]);
  if (!raw || raw === '') return [];
  return String(raw).split('|').filter(Boolean);
}

export async function getProjectRequestIndex(projectId: string): Promise<string[]> {
  const raw = await read('get_project_request_index', [projectId]);
  if (!raw || raw === '') return [];
  return String(raw).split('|').filter(Boolean);
}

// ------------------------------------------------------------------
// Human review and activation
// ------------------------------------------------------------------

export async function humanReviewHypothesis(
  privateKey: `0x${string}`,
  requestId: string,
  finalVerdict: 'APPROVED' | 'UNSUPPORTED' | 'NEEDS_REVISION',
  reviewReason: string,
  reviewerNotes: string,
  reviewEvidenceHash: string
) {
  return write(privateKey, 'human_review_hypothesis', [
    requestId,
    finalVerdict,
    reviewReason,
    reviewEvidenceHash,
    reviewerNotes,
    nowIso(),
  ]);
}

export async function markHypothesisActivated(
  privateKey: `0x${string}`,
  requestId: string,
  activationHash: string,
  activationNotes: string
) {
  return write(privateKey, 'mark_hypothesis_activated', [
    requestId,
    activationHash,
    activationNotes,
    nowIso(),
  ]);
}

export async function markHypothesisRejected(
  privateKey: `0x${string}`,
  requestId: string,
  blockReason: string
) {
  return write(privateKey, 'mark_hypothesis_rejected', [requestId, blockReason, nowIso()]);
}

export async function getEscalation(requestId: string) {
  const raw = await read('get_escalation', [requestId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getHumanReview(requestId: string) {
  const raw = await read('get_human_review', [requestId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getActivatedHypothesis(requestId: string) {
  const raw = await read('get_activated_hypothesis', [requestId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

// ------------------------------------------------------------------
// Audit trail
// ------------------------------------------------------------------

export async function getAuditLog(auditId: string) {
  const raw = await read('get_audit_log', [auditId]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getRequestAuditIndex(requestId: string): Promise<string[]> {
  const raw = await read('get_request_audit_index', [requestId]);
  if (!raw || raw === '') return [];
  return String(raw).split('|').filter(Boolean);
}

export async function getReviewerReputation(labId: string, reviewerWallet: string) {
  const raw = await read('get_reviewer_reputation', [labId, reviewerWallet]);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function isHypothesisHashApproved(hypothesisHash: string) {
  return read('is_hypothesis_hash_approved', [hypothesisHash]);
}

export async function isHypothesisHashBlocked(hypothesisHash: string) {
  return read('is_hypothesis_hash_blocked', [hypothesisHash]);
}

// ------------------------------------------------------------------
// Contract meta
// ------------------------------------------------------------------

export async function getContractSummary() {
  const raw = await read('get_contract_summary', []);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getContractOwner() {
  return read('get_owner', []);
}

export async function isContractPaused() {
  return read('is_paused', []);
}

export { CONTRACT_ADDRESS, EXPLORER_URL };
