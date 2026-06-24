export type Verdict = 'APPROVED' | 'NEEDS_REVISION' | 'UNSUPPORTED' | 'NEEDS_REVIEW';

export type LabRole = 'owner' | 'admin' | 'researcher' | 'reviewer';
export type PaperStatus = 'active' | 'archived' | 'retracted';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type HypothesisStatus = 'pending' | 'adjudicating' | 'decided' | 'reviewed' | 'activated' | 'rejected';
export type SubscriptionTier = 'free' | 'pro';

export interface Laboratory {
  id: string;
  name: string;
  researchArea: string;
  metadataHash: string;
  owner: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Paper {
  id: string;
  laboratoryId: string;
  title: string;
  authors: string;
  doi: string;
  publicationYear: number;
  metadataHash: string;
  status: PaperStatus;
  pdfUrl?: string;
  createdAt: string;
}

export interface ResearchProject {
  id: string;
  laboratoryId: string;
  title: string;
  objective: string;
  domain: string;
  metadataHash: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface HypothesisRequest {
  id: string;
  laboratoryId: string;
  projectId: string;
  researchQuestion: string;
  existingEvidence: string;
  constraints: string;
  desiredOutcome: string;
  paperIds: string[];
  status: HypothesisStatus;
  createdAt: string;
}

export interface HypothesisDecision {
  id: string;
  requestId: string;
  verdict: Verdict;
  hypothesis: string;
  scores: {
    evidenceSupport: number;
    novelty: number;
    citationQuality: number;
    plausibility: number;
    explainability: number;
    testability: number;
    confidence: number;
  };
  findings: {
    supportingEvidence: string[];
    conflictingEvidence: string[];
    missingCitations: string[];
    noveltyAssessment: string;
    recommendations: string[];
    rationale: string;
    auditSummary: string;
  };
  txHash: string;
  explorerUrl: string;
  createdAt: string;
}

export interface HumanReview {
  id: string;
  requestId: string;
  reviewerAddress: string;
  decision: 'approve' | 'reject' | 'revise';
  comments: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  requestId: string;
  action: string;
  actor: string;
  details: string;
  txHash: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  walletAddress?: string;
  subscription: SubscriptionTier;
  generationsUsed: number;
  generationsLimit: number;
  createdAt: string;
}

export interface ContractTransaction {
  id: string;
  method: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  explorerUrl: string;
  createdAt: string;
}
