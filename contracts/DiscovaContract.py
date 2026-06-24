# v0.2.18
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

import json
import typing


class DiscovaContract(gl.Contract):
    """
    DiscovaContract

    A GenLayer-native scientific hypothesis generation and evidence accountability
    contract.

    Product purpose:
    Discova helps researchers and laboratories generate evidence-backed, testable
    hypotheses from uploaded literature collections. A researcher submits a
    research question, existing evidence summaries, constraints, and referenced
    paper hashes. GenLayer validators independently assess whether the proposed
    hypothesis is grounded in cited evidence, demonstrates credible novelty,
    forms logical connections across literature, and produces a scientifically
    defensible research direction.

    The contract returns an authoritative on-chain verdict and a structured
    hypothesis evaluation report.

    What belongs on-chain:
    - laboratory and researcher role registry
    - research project registry
    - paper and literature collection hashes
    - hypothesis generation requests
    - GenLayer consensus hypothesis verdicts with full scoring
    - novelty assessments and evidence findings
    - citation verification results
    - human review outcomes
    - hypothesis activation / blocking registry
    - immutable audit trail

    What should stay off-chain (Supabase):
    - full PDFs, long literature content, lab reports, images
    - subscription plans, usage limits, analytics
    - cached embeddings and search indexes
    - user profiles, payment status, notification preferences
    - explorer link indexing and transaction history for UI
    Store hashes or structured summaries here; store documents in Supabase Storage.
    """

    owner: str
    paused: bool

    lab_counter: u256
    paper_counter: u256
    project_counter: u256
    request_counter: u256
    decision_counter: u256
    audit_counter: u256
    escalation_counter: u256
    human_review_counter: u256
    activation_counter: u256

    laboratories: TreeMap[str, str]
    lab_roles: TreeMap[str, str]
    lab_index: TreeMap[str, str]

    papers: TreeMap[str, str]
    lab_paper_index: TreeMap[str, str]

    projects: TreeMap[str, str]
    lab_project_index: TreeMap[str, str]

    hypothesis_requests: TreeMap[str, str]
    request_decisions: TreeMap[str, str]
    lab_request_index: TreeMap[str, str]
    project_request_index: TreeMap[str, str]

    decisions: TreeMap[str, str]
    escalations: TreeMap[str, str]
    human_reviews: TreeMap[str, str]
    activated_hypotheses: TreeMap[str, str]

    audit_logs: TreeMap[str, str]
    request_audit_index: TreeMap[str, str]

    reviewer_reputation: TreeMap[str, str]
    reviewer_decision_index: TreeMap[str, str]

    approved_hypothesis_hashes: TreeMap[str, str]
    blocked_hypothesis_hashes: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address.as_hex
        self.paused = False

        self.lab_counter = u256(0)
        self.paper_counter = u256(0)
        self.project_counter = u256(0)
        self.request_counter = u256(0)
        self.decision_counter = u256(0)
        self.audit_counter = u256(0)
        self.escalation_counter = u256(0)
        self.human_review_counter = u256(0)
        self.activation_counter = u256(0)

        self.laboratories = TreeMap()
        self.lab_roles = TreeMap()
        self.lab_index = TreeMap()

        self.papers = TreeMap()
        self.lab_paper_index = TreeMap()

        self.projects = TreeMap()
        self.lab_project_index = TreeMap()

        self.hypothesis_requests = TreeMap()
        self.request_decisions = TreeMap()
        self.lab_request_index = TreeMap()
        self.project_request_index = TreeMap()

        self.decisions = TreeMap()
        self.escalations = TreeMap()
        self.human_reviews = TreeMap()
        self.activated_hypotheses = TreeMap()

        self.audit_logs = TreeMap()
        self.request_audit_index = TreeMap()

        self.reviewer_reputation = TreeMap()
        self.reviewer_decision_index = TreeMap()

        self.approved_hypothesis_hashes = TreeMap()
        self.blocked_hypothesis_hashes = TreeMap()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _sender(self) -> str:
        return gl.message.sender_address.as_hex.lower()

    def _json(self, value: typing.Any) -> str:
        return json.dumps(value, sort_keys=True)

    def _load(self, raw: str) -> typing.Any:
        if raw is None or raw == "":
            return {}
        return json.loads(raw)

    def _require_owner(self) -> None:
        if self._sender() != self.owner.lower():
            raise gl.vm.UserError("Only contract owner")

    def _require_not_paused(self) -> None:
        if self.paused:
            raise gl.vm.UserError("Contract is paused")

    def _require_non_empty(self, value: str, field_name: str) -> None:
        if value is None or len(value.strip()) == 0:
            raise gl.vm.UserError(field_name + " is required")

    def _key2(self, a: str, b: str) -> str:
        return a + "::" + b

    def _key3(self, a: str, b: str, c: str) -> str:
        return a + "::" + b + "::" + c

    def _append(self, existing: str, item: str) -> str:
        if existing is None or existing == "":
            return item
        return existing + "|" + item

    def _append_unique(self, existing: str, item: str) -> str:
        if existing is None or existing == "":
            return item
        parts = existing.split("|")
        for part in parts:
            if part == item:
                return existing
        return existing + "|" + item

    def _limit(self, value: typing.Any, max_len: int) -> str:
        text = str(value) if value is not None else ""
        if len(text) > max_len:
            return text[:max_len]
        return text

    def _to_int(self, value: typing.Any, fallback: int) -> int:
        try:
            return int(value)
        except Exception:
            return fallback

    def _bounded_score(self, value: typing.Any, fallback: int) -> int:
        score = self._to_int(value, fallback)
        if score < 0:
            return 0
        if score > 100:
            return 100
        return score

    def _list_of_strings(self, value: typing.Any, max_items: int, max_len: int) -> typing.List[str]:
        result: typing.List[str] = []
        if isinstance(value, list):
            for item in value:
                if len(result) >= max_items:
                    break
                result.append(self._limit(item, max_len))
            return result
        if value is None:
            return result
        text = str(value)
        if len(text.strip()) == 0:
            return result
        result.append(self._limit(text, max_len))
        return result

    def _next_id(self, prefix: str, counter_name: str) -> str:
        if counter_name == "lab":
            self.lab_counter = self.lab_counter + u256(1)
            return prefix + "-" + str(self.lab_counter)
        if counter_name == "paper":
            self.paper_counter = self.paper_counter + u256(1)
            return prefix + "-" + str(self.paper_counter)
        if counter_name == "project":
            self.project_counter = self.project_counter + u256(1)
            return prefix + "-" + str(self.project_counter)
        if counter_name == "request":
            self.request_counter = self.request_counter + u256(1)
            return prefix + "-" + str(self.request_counter)
        if counter_name == "decision":
            self.decision_counter = self.decision_counter + u256(1)
            return prefix + "-" + str(self.decision_counter)
        if counter_name == "audit":
            self.audit_counter = self.audit_counter + u256(1)
            return prefix + "-" + str(self.audit_counter)
        if counter_name == "escalation":
            self.escalation_counter = self.escalation_counter + u256(1)
            return prefix + "-" + str(self.escalation_counter)
        if counter_name == "human_review":
            self.human_review_counter = self.human_review_counter + u256(1)
            return prefix + "-" + str(self.human_review_counter)
        if counter_name == "activation":
            self.activation_counter = self.activation_counter + u256(1)
            return prefix + "-" + str(self.activation_counter)
        raise gl.vm.UserError("Unknown counter: " + counter_name)

    def _normalise_status(self, value: str, allowed: str, field_name: str) -> str:
        status = value.strip().upper()
        for item in allowed.split("|"):
            if status == item:
                return status
        raise gl.vm.UserError("Invalid " + field_name + ": " + value)

    def _normalise_verdict(self, value: typing.Any) -> str:
        v = str(value).strip().upper()
        if v in ["APPROVE", "APPROVED", "PASS", "VALID", "ACCEPTED", "SUPPORTED", "CONFIRMED"]:
            return "APPROVED"
        if v in ["UNSUPPORTED", "REJECT", "REJECTED", "FAIL", "INVALID", "UNFOUNDED", "UNSUBSTANTIATED"]:
            return "UNSUPPORTED"
        if v in ["NEEDS_REVIEW", "REVIEW", "ESCALATE", "HUMAN_REVIEW", "EXPERT_REVIEW", "VET_REVIEW"]:
            return "NEEDS_REVIEW"
        if v in ["NEEDS_REVISION", "REVISION", "REVISE", "REFINE", "REFORMULATE", "REGENERATE", "REWRITE"]:
            return "NEEDS_REVISION"
        return "NEEDS_REVIEW"

    def _normalise_novelty_band(self, value: typing.Any) -> str:
        band = str(value).strip().upper()
        if band in ["LOW", "MODERATE", "HIGH", "INCREMENTAL", "SIGNIFICANT", "BREAKTHROUGH"]:
            return band
        return "MODERATE"

    def _assert_no_predecided_output(self, text: str) -> None:
        """
        Prevent prompt injection where callers try to pre-decide the
        hypothesis verdict through their input fields.
        """
        lower = text.lower()
        forbidden = [
            '"verdict"',
            "'verdict'",
            "verdict:",
            '"approved"',
            "'approved'",
            "approved:",
            '"unsupported"',
            "'unsupported'",
            "unsupported:",
            '"needs_revision"',
            "'needs_revision'",
            "needs_revision:",
            '"evidence_score"',
            "'evidence_score'",
            "evidence_score:",
            '"novelty_score"',
            "'novelty_score'",
            "novelty_score:",
            '"final_decision"',
            "'final_decision'",
            "final_decision:",
            '"hypothesis_approved"',
            "'hypothesis_approved'",
            "hypothesis_approved:",
        ]
        for item in forbidden:
            if item in lower:
                raise gl.vm.UserError(
                    "Caller input contains pre-decided hypothesis language: " + item
                )

    def _record_audit(
        self,
        lab_id: str,
        request_id: str,
        event_type: str,
        actor: str,
        summary: str,
        data_hash: str,
        created_at: str,
    ) -> str:
        audit_id = self._next_id("AUDIT", "audit")
        entry = {
            "audit_id": audit_id,
            "lab_id": lab_id,
            "request_id": request_id,
            "event_type": event_type,
            "actor": actor.lower(),
            "summary": self._limit(summary, 800),
            "data_hash": data_hash,
            "created_at": created_at,
        }
        self.audit_logs[audit_id] = self._json(entry)
        if request_id != "":
            self.request_audit_index[request_id] = self._append(
                self.request_audit_index.get(request_id, ""),
                audit_id,
            )
        return audit_id

    def _require_lab_exists(self, lab_id: str) -> typing.Any:
        raw = self.laboratories.get(lab_id, "")
        if raw == "":
            raise gl.vm.UserError("Laboratory not found: " + lab_id)
        return self._load(raw)

    def _require_paper_exists(self, paper_id: str) -> typing.Any:
        raw = self.papers.get(paper_id, "")
        if raw == "":
            raise gl.vm.UserError("Paper not found: " + paper_id)
        return self._load(raw)

    def _require_project_exists(self, project_id: str) -> typing.Any:
        raw = self.projects.get(project_id, "")
        if raw == "":
            raise gl.vm.UserError("Research project not found: " + project_id)
        return self._load(raw)

    def _is_lab_owner_or_admin(self, lab_id: str, wallet: str) -> bool:
        role = self.lab_roles.get(self._key2(lab_id, wallet.lower()), "")
        return role == "OWNER" or role == "ADMIN"

    def _is_lab_member(self, lab_id: str, wallet: str) -> bool:
        role = self.lab_roles.get(self._key2(lab_id, wallet.lower()), "")
        return role in ["OWNER", "ADMIN", "RESEARCHER", "REVIEWER"]

    def _require_lab_owner_or_admin(self, lab_id: str) -> None:
        if not self._is_lab_owner_or_admin(lab_id, self._sender()):
            raise gl.vm.UserError("Only laboratory owner or admin")

    def _require_lab_member(self, lab_id: str) -> None:
        if not self._is_lab_member(lab_id, self._sender()):
            raise gl.vm.UserError("Only laboratory members may perform this action")

    def _collect_paper_packet(self, lab_id: str, paper_ids_csv: str) -> str:
        """
        Build a structured summary of registered papers for the consensus prompt.
        """
        collected: typing.List[typing.Any] = []
        for raw_id in paper_ids_csv.split(","):
            paper_id = raw_id.strip()
            if paper_id == "":
                continue
            paper = self._require_paper_exists(paper_id)
            if paper.get("lab_id", "") != lab_id:
                raise gl.vm.UserError("Paper does not belong to this laboratory: " + paper_id)
            if paper.get("status", "") != "ACTIVE":
                raise gl.vm.UserError("Paper is not active: " + paper_id)
            collected.append(
                {
                    "paper_id": paper_id,
                    "title": paper.get("title", ""),
                    "authors": paper.get("authors", ""),
                    "doi": paper.get("doi", ""),
                    "publication_year": paper.get("publication_year", ""),
                    "summary": paper.get("summary", ""),
                    "metadata_hash": paper.get("metadata_hash", ""),
                }
            )
        return self._json(collected)

    def _normalise_ai_review(self, raw: typing.Any) -> typing.Any:
        if isinstance(raw, str):
            parsed = json.loads(raw)
        else:
            parsed = raw

        verdict = self._normalise_verdict(parsed.get("verdict", "NEEDS_REVIEW"))
        novelty_band = self._normalise_novelty_band(parsed.get("novelty_band", "MODERATE"))

        supporting_evidence = self._list_of_strings(parsed.get("supporting_evidence", []), 14, 400)
        conflicting_evidence = self._list_of_strings(parsed.get("conflicting_evidence", []), 10, 400)
        missing_citations = self._list_of_strings(parsed.get("missing_citations", []), 10, 300)
        exaggeration_flags = self._list_of_strings(parsed.get("exaggeration_flags", []), 8, 300)
        recommendations = self._list_of_strings(parsed.get("recommendations", []), 12, 380)
        testability_conditions = self._list_of_strings(parsed.get("testability_conditions", []), 10, 360)
        reviewer_required = bool(parsed.get("reviewer_required", False))
        revision_required = bool(parsed.get("revision_required", False))

        if verdict == "UNSUPPORTED":
            reviewer_required = False
            revision_required = False
        if verdict == "NEEDS_REVIEW":
            reviewer_required = True
        if verdict == "NEEDS_REVISION":
            revision_required = True

        return {
            "verdict": verdict,
            "evidence_support_score": self._bounded_score(parsed.get("evidence_support_score", 0), 0),
            "novelty_score": self._bounded_score(parsed.get("novelty_score", 0), 0),
            "citation_quality_score": self._bounded_score(parsed.get("citation_quality_score", 0), 0),
            "plausibility_score": self._bounded_score(parsed.get("plausibility_score", 0), 0),
            "explainability_score": self._bounded_score(parsed.get("explainability_score", 0), 0),
            "testability_score": self._bounded_score(parsed.get("testability_score", 0), 0),
            "confidence": self._bounded_score(parsed.get("confidence", 50), 50),
            "novelty_band": novelty_band,
            "reviewer_required": reviewer_required,
            "revision_required": revision_required,
            "generated_hypothesis": self._limit(parsed.get("generated_hypothesis", ""), 3000),
            "mechanism_summary": self._limit(parsed.get("mechanism_summary", ""), 1400),
            "novelty_assessment": self._limit(parsed.get("novelty_assessment", ""), 1400),
            "supporting_evidence": supporting_evidence,
            "conflicting_evidence": conflicting_evidence,
            "missing_citations": missing_citations,
            "exaggeration_flags": exaggeration_flags,
            "recommendations": recommendations,
            "testability_conditions": testability_conditions,
            "rationale": self._limit(parsed.get("rationale", ""), 2000),
            "audit_summary": self._limit(parsed.get("audit_summary", ""), 1000),
        }

    def _apply_hypothesis_thresholds(self, review: typing.Any, lab: typing.Any) -> typing.Any:
        """
        Apply laboratory-level approval thresholds after the AI review is
        normalised. These are configurable per-laboratory so that different
        research contexts can enforce stricter or looser bars.
        """
        config = lab.get("approval_config", {})

        min_evidence = self._bounded_score(config.get("min_approve_evidence_support", 70), 70)
        min_novelty = self._bounded_score(config.get("min_approve_novelty", 55), 55)
        min_citation = self._bounded_score(config.get("min_approve_citation_quality", 65), 65)
        min_plausibility = self._bounded_score(config.get("min_approve_plausibility", 65), 65)
        min_testability = self._bounded_score(config.get("min_approve_testability", 60), 60)
        min_confidence = self._bounded_score(config.get("min_approve_confidence", 60), 60)
        auto_review_exaggeration = bool(config.get("auto_review_on_exaggeration", True))
        auto_review_missing_citations = self._to_int(config.get("auto_review_missing_citations_threshold", 3), 3)

        verdict = review["verdict"]

        # Auto-escalate if exaggeration flags exist and threshold enforcement is on
        if auto_review_exaggeration and len(review["exaggeration_flags"]) > 0 and verdict == "APPROVED":
            verdict = "NEEDS_REVIEW"

        # Auto-escalate if too many missing citations
        if (
            len(review["missing_citations"]) >= auto_review_missing_citations
            and verdict == "APPROVED"
        ):
            verdict = "NEEDS_REVIEW"

        # Score-based threshold gate — downgrade to NEEDS_REVIEW if any score is below bar
        if (
            verdict == "APPROVED"
            and (
                review["evidence_support_score"] < min_evidence
                or review["novelty_score"] < min_novelty
                or review["citation_quality_score"] < min_citation
                or review["plausibility_score"] < min_plausibility
                or review["testability_score"] < min_testability
                or review["confidence"] < min_confidence
            )
        ):
            verdict = "NEEDS_REVIEW"

        review["verdict"] = verdict
        review["reviewer_required"] = verdict == "NEEDS_REVIEW"
        review["revision_required"] = verdict == "NEEDS_REVISION"

        if verdict == "UNSUPPORTED":
            review["reviewer_required"] = False
            review["revision_required"] = False

        return review

    def _create_hypothesis_request(
        self,
        request_id: str,
        lab_id: str,
        project_id: str,
        paper_ids_csv: str,
        research_question: str,
        existing_evidence_summary: str,
        constraints_summary: str,
        desired_outcome_summary: str,
        domain_context_summary: str,
        evidence_manifest_hash: str,
        submitted_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(lab_id, "lab_id")
        self._require_non_empty(project_id, "project_id")
        self._require_non_empty(research_question, "research_question")
        self._require_non_empty(evidence_manifest_hash, "evidence_manifest_hash")
        self._require_non_empty(submitted_at, "submitted_at")

        self._assert_no_predecided_output(
            research_question
            + " "
            + existing_evidence_summary
            + " "
            + constraints_summary
            + " "
            + desired_outcome_summary
            + " "
            + domain_context_summary
        )

        lab = self._require_lab_exists(lab_id)
        if lab.get("status", "") != "ACTIVE":
            raise gl.vm.UserError("Laboratory is not active")

        project = self._require_project_exists(project_id)
        if project.get("lab_id", "") != lab_id:
            raise gl.vm.UserError("Project does not belong to this laboratory")
        if project.get("status", "") != "ACTIVE":
            raise gl.vm.UserError("Research project is not active")

        self._require_lab_member(lab_id)

        final_request_id = request_id
        if final_request_id.strip() == "":
            final_request_id = self._next_id("REQ", "request")
        if self.hypothesis_requests.get(final_request_id, "") != "":
            raise gl.vm.UserError("Hypothesis request already exists: " + final_request_id)

        record = {
            "request_id": final_request_id,
            "lab_id": lab_id,
            "project_id": project_id,
            "paper_ids_csv": paper_ids_csv,
            "research_question": self._limit(research_question, 1800),
            "existing_evidence_summary": self._limit(existing_evidence_summary, 2200),
            "constraints_summary": self._limit(constraints_summary, 1200),
            "desired_outcome_summary": self._limit(desired_outcome_summary, 1200),
            "domain_context_summary": self._limit(domain_context_summary, 1000),
            "evidence_manifest_hash": evidence_manifest_hash,
            "submitted_by": self._sender(),
            "submitted_at": submitted_at,
            "status": "PENDING",
        }

        self.hypothesis_requests[final_request_id] = self._json(record)

        self.lab_request_index[lab_id] = self._append(
            self.lab_request_index.get(lab_id, ""),
            final_request_id,
        )
        self.project_request_index[project_id] = self._append(
            self.project_request_index.get(project_id, ""),
            final_request_id,
        )

        self._record_audit(
            lab_id,
            final_request_id,
            "HYPOTHESIS_REQUEST_SUBMITTED",
            self._sender(),
            "Hypothesis generation request submitted",
            evidence_manifest_hash,
            submitted_at,
        )

        return final_request_id

    def _run_consensus_hypothesis_review(
        self,
        request_record: typing.Any,
        lab: typing.Any,
        project: typing.Any,
        paper_packet: str,
    ) -> typing.Any:
        request_json = self._json(request_record)
        lab_json = self._json(
            {
                "lab_id": lab.get("lab_id", ""),
                "name": lab.get("name", ""),
                "research_area": lab.get("research_area", ""),
                "approval_config": lab.get("approval_config", {}),
            }
        )
        project_json = self._json(
            {
                "project_id": project.get("project_id", ""),
                "title": project.get("title", ""),
                "domain": project.get("domain", ""),
                "objective": project.get("objective", ""),
            }
        )

        def evaluate_once() -> str:
            prompt = f"""
You are a decentralized scientific hypothesis reviewer for Discova.

Your job is to:
1. Generate a scientifically defensible, evidence-backed, testable hypothesis
   that responds to the research question, grounded in the referenced literature.
2. Evaluate that hypothesis across multiple scientific quality dimensions.
3. Return a structured verdict with detailed findings.

Critical rules:
1. You are reviewing scientific literature for hypothesis generation — not providing
   medical advice, legal guidance, or veterinary/clinical recommendations.
2. Do not invent evidence, citations, or experimental results that are not
   referenced in the request context.
3. Treat the research question and existing evidence summary as primary inputs.
   Do not override them with external assumptions.
4. If conclusions are exaggerated beyond what the cited evidence supports,
   flag them explicitly in exaggeration_flags.
5. If important literature is clearly missing or ignored, list those gaps in
   missing_citations.
6. If the hypothesis requires domain expert review due to complexity or risk,
   choose NEEDS_REVIEW.
7. If the hypothesis is directionally valid but needs refinement, choose
   NEEDS_REVISION.
8. If evidence is entirely insufficient to support any coherent hypothesis,
   choose UNSUPPORTED.
9. Only choose APPROVED when the hypothesis is clearly grounded, novel,
   plausible, and testable given the submitted context.
10. Return only valid JSON matching the schema below.

Laboratory:
{lab_json}

Research project:
{project_json}

Referenced papers:
{paper_packet}

Hypothesis request:
{request_json}

Return this exact JSON object:
{{
  "verdict": "APPROVED | NEEDS_REVISION | UNSUPPORTED | NEEDS_REVIEW",
  "evidence_support_score": 0,
  "novelty_score": 0,
  "citation_quality_score": 0,
  "plausibility_score": 0,
  "explainability_score": 0,
  "testability_score": 0,
  "confidence": 0,
  "novelty_band": "LOW | MODERATE | HIGH | INCREMENTAL | SIGNIFICANT | BREAKTHROUGH",
  "reviewer_required": false,
  "revision_required": false,
  "generated_hypothesis": "The full generated hypothesis text — scientifically precise, evidence-grounded, testable",
  "mechanism_summary": "Brief description of the proposed biological/chemical/physical mechanism",
  "novelty_assessment": "Why this hypothesis is novel relative to existing literature",
  "supporting_evidence": ["specific supporting evidence item from the referenced papers"],
  "conflicting_evidence": ["specific conflicting evidence item or counter-finding"],
  "missing_citations": ["specific important paper or research area not referenced that is relevant"],
  "exaggeration_flags": ["specific claim that exceeds what the evidence supports"],
  "recommendations": ["specific actionable recommendation for the researcher"],
  "testability_conditions": ["specific experimental condition or assay needed to test this hypothesis"],
  "rationale": "Clear, detailed explanation for the verdict and all scores",
  "audit_summary": "Concise audit-ready summary of the consensus decision"
}}
"""
            raw = gl.nondet.exec_prompt(prompt, response_format="json")
            normalised = self._normalise_ai_review(raw)
            return json.dumps(normalised, sort_keys=True)

        consensus_json = gl.eq_principle.prompt_non_comparative(
            evaluate_once,
            task="Generate and evaluate a scientific hypothesis based on the research question and referenced literature. Return a structured JSON verdict with scores and findings.",
            criteria="The response must be valid JSON containing a verdict (APPROVED/NEEDS_REVISION/UNSUPPORTED/NEEDS_REVIEW), numeric scores between 0-100, a generated_hypothesis that addresses the research question, and a rationale explaining the verdict. Different validators may produce different but equally valid hypotheses.",
        )

        return self._normalise_ai_review(consensus_json)

    def _adjudicate_hypothesis_request(
        self, request_id: str, adjudicated_at: str
    ) -> str:
        self._require_not_paused()

        raw_request = self.hypothesis_requests.get(request_id, "")
        if raw_request == "":
            raise gl.vm.UserError("Hypothesis request not found: " + request_id)

        request_record = self._load(raw_request)
        status = request_record.get("status", "")
        if status not in ["PENDING", "RETRY_PENDING"]:
            raise gl.vm.UserError("Hypothesis request is not pending adjudication")

        lab_id = request_record.get("lab_id", "")
        project_id = request_record.get("project_id", "")
        paper_ids_csv = request_record.get("paper_ids_csv", "")

        lab = self._require_lab_exists(lab_id)
        project = self._require_project_exists(project_id)

        paper_packet = "[]"
        if paper_ids_csv.strip() != "":
            paper_packet = self._collect_paper_packet(lab_id, paper_ids_csv)

        review = self._run_consensus_hypothesis_review(
            request_record, lab, project, paper_packet
        )
        review = self._apply_hypothesis_thresholds(review, lab)

        decision_id = self._next_id("DEC", "decision")
        verdict = review["verdict"]

        request_status = "NEEDS_REVIEW"
        if verdict == "APPROVED":
            request_status = "APPROVED"
        elif verdict == "UNSUPPORTED":
            request_status = "UNSUPPORTED"
            self.blocked_hypothesis_hashes[request_record.get("evidence_manifest_hash", "")] = request_id
        elif verdict == "NEEDS_REVISION":
            request_status = "NEEDS_REVISION"
        elif verdict == "NEEDS_REVIEW":
            request_status = "NEEDS_REVIEW"

        decision_record = {
            "decision_id": decision_id,
            "request_id": request_id,
            "lab_id": lab_id,
            "project_id": project_id,
            "verdict": verdict,
            "request_status": request_status,
            "hypothesis_review": review,
            "adjudicated_by": "GENLAYER_CONSENSUS",
            "adjudicated_at": adjudicated_at,
        }

        self.decisions[decision_id] = self._json(decision_record)
        self.request_decisions[request_id] = decision_id

        request_record["status"] = request_status
        request_record["last_decision_id"] = decision_id
        request_record["adjudicated_at"] = adjudicated_at
        self.hypothesis_requests[request_id] = self._json(request_record)

        if request_status == "NEEDS_REVIEW":
            escalation_id = self._next_id("ESC", "escalation")
            escalation_record = {
                "escalation_id": escalation_id,
                "request_id": request_id,
                "lab_id": lab_id,
                "project_id": project_id,
                "decision_id": decision_id,
                "status": "OPEN",
                "reason": review.get("rationale", ""),
                "opened_at": adjudicated_at,
                "opened_by": "GENLAYER_CONSENSUS",
            }
            self.escalations[request_id] = self._json(escalation_record)

        self._record_audit(
            lab_id,
            request_id,
            "GENLAYER_HYPOTHESIS_CONSENSUS_DECISION",
            "GENLAYER_CONSENSUS",
            "Consensus hypothesis verdict: " + verdict,
            decision_id,
            adjudicated_at,
        )

        return self._json(decision_record)

    def _update_reviewer_reputation(
        self,
        reviewer: str,
        lab_id: str,
        accepted: bool,
        reviewed_at: str,
    ) -> None:
        key = self._key2(lab_id, reviewer.lower())
        raw = self.reviewer_reputation.get(key, "")
        if raw == "":
            record = {
                "lab_id": lab_id,
                "reviewer": reviewer.lower(),
                "reviews": 0,
                "accepted_reviews": 0,
                "rejected_reviews": 0,
                "last_reviewed_at": "",
            }
        else:
            record = self._load(raw)

        record["reviews"] = self._to_int(record.get("reviews", 0), 0) + 1
        if accepted:
            record["accepted_reviews"] = self._to_int(record.get("accepted_reviews", 0), 0) + 1
        else:
            record["rejected_reviews"] = self._to_int(record.get("rejected_reviews", 0), 0) + 1
        record["last_reviewed_at"] = reviewed_at
        self.reviewer_reputation[key] = self._json(record)

    # ------------------------------------------------------------------
    # Owner and contract status
    # ------------------------------------------------------------------

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner

    @gl.public.view
    def is_paused(self) -> bool:
        return self.paused

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self._json(
            {
                "owner": self.owner,
                "paused": self.paused,
                "lab_counter": str(self.lab_counter),
                "paper_counter": str(self.paper_counter),
                "project_counter": str(self.project_counter),
                "request_counter": str(self.request_counter),
                "decision_counter": str(self.decision_counter),
                "audit_counter": str(self.audit_counter),
            }
        )

    @gl.public.write
    def transfer_ownership(self, new_owner: str, updated_at: str) -> None:
        self._require_owner()
        self._require_non_empty(new_owner, "new_owner")
        previous = self.owner
        self.owner = new_owner
        self._record_audit(
            "",
            "",
            "OWNERSHIP_TRANSFERRED",
            previous,
            "Contract ownership transferred to " + new_owner,
            new_owner,
            updated_at,
        )

    @gl.public.write
    def pause(self) -> None:
        self._require_owner()
        self.paused = True

    @gl.public.write
    def unpause(self) -> None:
        self._require_owner()
        self.paused = False

    # ------------------------------------------------------------------
    # Laboratory management
    # ------------------------------------------------------------------

    @gl.public.write
    def create_laboratory(
        self,
        lab_id: str,
        name: str,
        research_area: str,
        location_context: str,
        metadata_hash: str,
        created_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(name, "name")
        self._require_non_empty(research_area, "research_area")

        final_lab_id = lab_id
        if final_lab_id.strip() == "":
            final_lab_id = self._next_id("LAB", "lab")
        if self.laboratories.get(final_lab_id, "") != "":
            raise gl.vm.UserError("Laboratory already exists: " + final_lab_id)

        record = {
            "lab_id": final_lab_id,
            "name": self._limit(name, 200),
            "research_area": self._limit(research_area, 180),
            "location_context": self._limit(location_context, 600),
            "metadata_hash": metadata_hash,
            "status": "ACTIVE",
            "created_by": self._sender(),
            "created_at": created_at,
            "approval_config": {
                "min_approve_evidence_support": "70",
                "min_approve_novelty": "55",
                "min_approve_citation_quality": "65",
                "min_approve_plausibility": "65",
                "min_approve_testability": "60",
                "min_approve_confidence": "60",
                "auto_review_on_exaggeration": "true",
                "auto_review_missing_citations_threshold": "3",
            },
        }

        self.laboratories[final_lab_id] = self._json(record)
        self.lab_roles[self._key2(final_lab_id, self._sender())] = "OWNER"
        self.lab_index["all"] = self._append_unique(
            self.lab_index.get("all", ""),
            final_lab_id,
        )

        self._record_audit(
            final_lab_id,
            "",
            "LABORATORY_CREATED",
            self._sender(),
            "Laboratory created: " + name,
            metadata_hash,
            created_at,
        )

        return final_lab_id

    @gl.public.write
    def add_laboratory_role(
        self,
        lab_id: str,
        wallet: str,
        role: str,
        added_at: str,
    ) -> None:
        self._require_not_paused()
        self._require_lab_exists(lab_id)
        self._require_lab_owner_or_admin(lab_id)
        self._require_non_empty(wallet, "wallet")

        final_role = self._normalise_status(role, "ADMIN|RESEARCHER|REVIEWER", "role")
        self.lab_roles[self._key2(lab_id, wallet.lower())] = final_role

        self._record_audit(
            lab_id,
            "",
            "LABORATORY_ROLE_ADDED",
            self._sender(),
            "Added " + final_role + " role for " + wallet.lower(),
            wallet.lower(),
            added_at,
        )

    @gl.public.write
    def remove_laboratory_role(
        self,
        lab_id: str,
        wallet: str,
        removed_at: str,
    ) -> None:
        self._require_not_paused()
        self._require_lab_exists(lab_id)
        self._require_lab_owner_or_admin(lab_id)

        key = self._key2(lab_id, wallet.lower())
        role = self.lab_roles.get(key, "")
        if role == "OWNER":
            raise gl.vm.UserError("Cannot remove laboratory owner role")

        self.lab_roles[key] = "REMOVED"

        self._record_audit(
            lab_id,
            "",
            "LABORATORY_ROLE_REMOVED",
            self._sender(),
            "Removed laboratory role for " + wallet.lower(),
            wallet.lower(),
            removed_at,
        )

    @gl.public.write
    def set_laboratory_status(
        self,
        lab_id: str,
        status: str,
        updated_at: str,
    ) -> None:
        self._require_not_paused()
        self._require_lab_owner_or_admin(lab_id)

        record = self._require_lab_exists(lab_id)
        final_status = self._normalise_status(status, "ACTIVE|SUSPENDED|ARCHIVED", "laboratory status")
        record["status"] = final_status
        record["updated_at"] = updated_at
        self.laboratories[lab_id] = self._json(record)

        self._record_audit(
            lab_id,
            "",
            "LABORATORY_STATUS_UPDATED",
            self._sender(),
            "Laboratory status set to " + final_status,
            final_status,
            updated_at,
        )

    @gl.public.write
    def set_laboratory_approval_config(
        self,
        lab_id: str,
        min_approve_evidence_support: u256,
        min_approve_novelty: u256,
        min_approve_citation_quality: u256,
        min_approve_plausibility: u256,
        min_approve_testability: u256,
        min_approve_confidence: u256,
        auto_review_on_exaggeration: bool,
        auto_review_missing_citations_threshold: u256,
        updated_at: str,
    ) -> None:
        self._require_not_paused()
        self._require_lab_owner_or_admin(lab_id)

        for val in [
            min_approve_evidence_support,
            min_approve_novelty,
            min_approve_citation_quality,
            min_approve_plausibility,
            min_approve_testability,
            min_approve_confidence,
        ]:
            if val > u256(100):
                raise gl.vm.UserError("Approval config scores must be 0–100")

        lab = self._require_lab_exists(lab_id)
        lab["approval_config"] = {
            "min_approve_evidence_support": str(min_approve_evidence_support),
            "min_approve_novelty": str(min_approve_novelty),
            "min_approve_citation_quality": str(min_approve_citation_quality),
            "min_approve_plausibility": str(min_approve_plausibility),
            "min_approve_testability": str(min_approve_testability),
            "min_approve_confidence": str(min_approve_confidence),
            "auto_review_on_exaggeration": str(auto_review_on_exaggeration).lower(),
            "auto_review_missing_citations_threshold": str(auto_review_missing_citations_threshold),
        }
        lab["updated_at"] = updated_at
        self.laboratories[lab_id] = self._json(lab)

        self._record_audit(
            lab_id,
            "",
            "LABORATORY_APPROVAL_CONFIG_UPDATED",
            self._sender(),
            "Hypothesis approval thresholds updated",
            self._json(lab["approval_config"]),
            updated_at,
        )

    # ------------------------------------------------------------------
    # Paper (literature) management
    # ------------------------------------------------------------------

    @gl.public.write
    def register_paper(
        self,
        paper_id: str,
        lab_id: str,
        title: str,
        authors: str,
        doi: str,
        publication_year: str,
        summary: str,
        metadata_hash: str,
        registered_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_lab_member(lab_id)
        self._require_non_empty(title, "title")
        self._require_non_empty(metadata_hash, "metadata_hash")

        lab = self._require_lab_exists(lab_id)
        if lab.get("status", "") != "ACTIVE":
            raise gl.vm.UserError("Laboratory is not active")

        final_paper_id = paper_id
        if final_paper_id.strip() == "":
            final_paper_id = self._next_id("PAPER", "paper")
        if self.papers.get(final_paper_id, "") != "":
            raise gl.vm.UserError("Paper already exists: " + final_paper_id)

        record = {
            "paper_id": final_paper_id,
            "lab_id": lab_id,
            "title": self._limit(title, 400),
            "authors": self._limit(authors, 600),
            "doi": self._limit(doi, 200),
            "publication_year": self._limit(publication_year, 10),
            "summary": self._limit(summary, 2000),
            "metadata_hash": metadata_hash,
            "status": "ACTIVE",
            "registered_by": self._sender(),
            "registered_at": registered_at,
        }

        self.papers[final_paper_id] = self._json(record)
        self.lab_paper_index[lab_id] = self._append_unique(
            self.lab_paper_index.get(lab_id, ""),
            final_paper_id,
        )

        self._record_audit(
            lab_id,
            "",
            "PAPER_REGISTERED",
            self._sender(),
            "Paper registered: " + self._limit(title, 140),
            metadata_hash,
            registered_at,
        )

        return final_paper_id

    @gl.public.write
    def update_paper_summary(
        self,
        paper_id: str,
        summary: str,
        metadata_hash: str,
        updated_at: str,
    ) -> None:
        self._require_not_paused()

        paper = self._require_paper_exists(paper_id)
        lab_id = paper.get("lab_id", "")
        self._require_lab_member(lab_id)

        paper["summary"] = self._limit(summary, 2000)
        paper["metadata_hash"] = metadata_hash
        paper["updated_at"] = updated_at
        self.papers[paper_id] = self._json(paper)

        self._record_audit(
            lab_id,
            "",
            "PAPER_SUMMARY_UPDATED",
            self._sender(),
            "Paper summary updated: " + paper_id,
            metadata_hash,
            updated_at,
        )

    @gl.public.write
    def set_paper_status(
        self,
        paper_id: str,
        status: str,
        updated_at: str,
    ) -> None:
        self._require_not_paused()

        paper = self._require_paper_exists(paper_id)
        lab_id = paper.get("lab_id", "")
        self._require_lab_owner_or_admin(lab_id)

        final_status = self._normalise_status(status, "ACTIVE|ARCHIVED|RETRACTED", "paper status")
        paper["status"] = final_status
        paper["updated_at"] = updated_at
        self.papers[paper_id] = self._json(paper)

        self._record_audit(
            lab_id,
            "",
            "PAPER_STATUS_UPDATED",
            self._sender(),
            "Paper " + paper_id + " status set to " + final_status,
            final_status,
            updated_at,
        )

    # ------------------------------------------------------------------
    # Research project management
    # ------------------------------------------------------------------

    @gl.public.write
    def create_research_project(
        self,
        project_id: str,
        lab_id: str,
        title: str,
        domain: str,
        objective: str,
        metadata_hash: str,
        created_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_lab_member(lab_id)
        self._require_non_empty(title, "title")
        self._require_non_empty(domain, "domain")
        self._require_non_empty(objective, "objective")

        lab = self._require_lab_exists(lab_id)
        if lab.get("status", "") != "ACTIVE":
            raise gl.vm.UserError("Laboratory is not active")

        final_project_id = project_id
        if final_project_id.strip() == "":
            final_project_id = self._next_id("PROJ", "project")
        if self.projects.get(final_project_id, "") != "":
            raise gl.vm.UserError("Research project already exists: " + final_project_id)

        record = {
            "project_id": final_project_id,
            "lab_id": lab_id,
            "title": self._limit(title, 300),
            "domain": self._limit(domain, 180),
            "objective": self._limit(objective, 1400),
            "metadata_hash": metadata_hash,
            "status": "ACTIVE",
            "created_by": self._sender(),
            "created_at": created_at,
        }

        self.projects[final_project_id] = self._json(record)
        self.lab_project_index[lab_id] = self._append_unique(
            self.lab_project_index.get(lab_id, ""),
            final_project_id,
        )

        self._record_audit(
            lab_id,
            "",
            "RESEARCH_PROJECT_CREATED",
            self._sender(),
            "Research project created: " + self._limit(title, 140),
            metadata_hash,
            created_at,
        )

        return final_project_id

    @gl.public.write
    def update_project_summary(
        self,
        project_id: str,
        objective: str,
        metadata_hash: str,
        updated_at: str,
    ) -> None:
        self._require_not_paused()

        project = self._require_project_exists(project_id)
        lab_id = project.get("lab_id", "")
        self._require_lab_member(lab_id)

        project["objective"] = self._limit(objective, 1400)
        project["metadata_hash"] = metadata_hash
        project["updated_at"] = updated_at
        self.projects[project_id] = self._json(project)

        self._record_audit(
            lab_id,
            "",
            "PROJECT_SUMMARY_UPDATED",
            self._sender(),
            "Research project summary updated: " + project_id,
            metadata_hash,
            updated_at,
        )

    @gl.public.write
    def set_project_status(
        self,
        project_id: str,
        status: str,
        updated_at: str,
    ) -> None:
        self._require_not_paused()

        project = self._require_project_exists(project_id)
        lab_id = project.get("lab_id", "")
        self._require_lab_owner_or_admin(lab_id)

        final_status = self._normalise_status(status, "ACTIVE|PAUSED|COMPLETED|ARCHIVED", "project status")
        project["status"] = final_status
        project["updated_at"] = updated_at
        self.projects[project_id] = self._json(project)

        self._record_audit(
            lab_id,
            "",
            "PROJECT_STATUS_UPDATED",
            self._sender(),
            "Research project " + project_id + " status set to " + final_status,
            final_status,
            updated_at,
        )

    # ------------------------------------------------------------------
    # Hypothesis generation — GenLayer consensus core
    # ------------------------------------------------------------------

    @gl.public.write
    def submit_hypothesis_request(
        self,
        request_id: str,
        lab_id: str,
        project_id: str,
        paper_ids_csv: str,
        research_question: str,
        existing_evidence_summary: str,
        constraints_summary: str,
        desired_outcome_summary: str,
        domain_context_summary: str,
        evidence_manifest_hash: str,
        submitted_at: str,
    ) -> str:
        return self._create_hypothesis_request(
            request_id,
            lab_id,
            project_id,
            paper_ids_csv,
            research_question,
            existing_evidence_summary,
            constraints_summary,
            desired_outcome_summary,
            domain_context_summary,
            evidence_manifest_hash,
            submitted_at,
        )

    @gl.public.write
    def adjudicate_hypothesis_request(
        self,
        request_id: str,
        adjudicated_at: str,
    ) -> str:
        return self._adjudicate_hypothesis_request(request_id, adjudicated_at)

    @gl.public.write
    def submit_and_generate_hypothesis(
        self,
        request_id: str,
        lab_id: str,
        project_id: str,
        paper_ids_csv: str,
        research_question: str,
        existing_evidence_summary: str,
        constraints_summary: str,
        desired_outcome_summary: str,
        domain_context_summary: str,
        evidence_manifest_hash: str,
        submitted_at: str,
        adjudicated_at: str,
    ) -> str:
        final_request_id = self._create_hypothesis_request(
            request_id,
            lab_id,
            project_id,
            paper_ids_csv,
            research_question,
            existing_evidence_summary,
            constraints_summary,
            desired_outcome_summary,
            domain_context_summary,
            evidence_manifest_hash,
            submitted_at,
        )
        return self._adjudicate_hypothesis_request(final_request_id, adjudicated_at)

    # ------------------------------------------------------------------
    # Human review and hypothesis activation
    # ------------------------------------------------------------------

    @gl.public.write
    def human_review_hypothesis(
        self,
        request_id: str,
        final_verdict: str,
        review_reason: str,
        review_evidence_hash: str,
        reviewer_notes: str,
        decided_at: str,
    ) -> str:
        self._require_not_paused()

        raw_request = self.hypothesis_requests.get(request_id, "")
        if raw_request == "":
            raise gl.vm.UserError("Hypothesis request not found: " + request_id)

        request_record = self._load(raw_request)
        lab_id = request_record.get("lab_id", "")

        if not self._is_lab_member(lab_id, self._sender()):
            raise gl.vm.UserError("Only laboratory members may submit human reviews")

        if request_record.get("status", "") not in ["NEEDS_REVIEW", "NEEDS_REVISION"]:
            raise gl.vm.UserError("Hypothesis request is not eligible for human review")

        verdict = self._normalise_verdict(final_verdict)
        if verdict == "NEEDS_REVIEW":
            raise gl.vm.UserError(
                "Human review must resolve to APPROVED, UNSUPPORTED, or NEEDS_REVISION"
            )

        human_review_id = self._next_id("HREV", "human_review")

        request_status = "HUMAN_APPROVED"
        accepted = True
        if verdict == "UNSUPPORTED":
            request_status = "HUMAN_REJECTED"
            accepted = False
            self.blocked_hypothesis_hashes[request_record.get("evidence_manifest_hash", "")] = request_id
        elif verdict == "NEEDS_REVISION":
            request_status = "NEEDS_REVISION"
            accepted = False
        else:
            self.approved_hypothesis_hashes[request_record.get("evidence_manifest_hash", "")] = request_id

        review_record = {
            "human_review_id": human_review_id,
            "request_id": request_id,
            "lab_id": lab_id,
            "reviewer": self._sender(),
            "final_verdict": verdict,
            "request_status": request_status,
            "review_reason": self._limit(review_reason, 1600),
            "review_evidence_hash": review_evidence_hash,
            "reviewer_notes": self._limit(reviewer_notes, 1200),
            "decided_at": decided_at,
        }

        self.human_reviews[request_id] = self._json(review_record)

        request_record["status"] = request_status
        request_record["human_review_id"] = human_review_id
        request_record["human_decided_at"] = decided_at
        self.hypothesis_requests[request_id] = self._json(request_record)

        escalation = self._load(self.escalations.get(request_id, "{}"))
        if escalation != {}:
            escalation["status"] = "CLOSED"
            escalation["closed_by"] = self._sender()
            escalation["closed_at"] = decided_at
            escalation["close_reason"] = "Human review: " + verdict
            self.escalations[request_id] = self._json(escalation)

        self._update_reviewer_reputation(self._sender(), lab_id, accepted, decided_at)
        self.reviewer_decision_index[self._key2(lab_id, self._sender())] = self._append(
            self.reviewer_decision_index.get(self._key2(lab_id, self._sender()), ""),
            request_id,
        )

        self._record_audit(
            lab_id,
            request_id,
            "HUMAN_HYPOTHESIS_REVIEW_DECISION",
            self._sender(),
            "Human hypothesis review decision: " + verdict,
            review_evidence_hash,
            decided_at,
        )

        return self._json(review_record)

    @gl.public.write
    def mark_hypothesis_activated(
        self,
        request_id: str,
        activation_hash: str,
        activation_notes: str,
        activated_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(activation_hash, "activation_hash")

        raw_request = self.hypothesis_requests.get(request_id, "")
        if raw_request == "":
            raise gl.vm.UserError("Hypothesis request not found: " + request_id)

        request_record = self._load(raw_request)
        lab_id = request_record.get("lab_id", "")
        self._require_lab_owner_or_admin(lab_id)

        if request_record.get("status", "") not in ["APPROVED", "HUMAN_APPROVED"]:
            raise gl.vm.UserError("Hypothesis is not approved for activation")

        activation_id = self._next_id("ACT", "activation")
        activation_record = {
            "activation_id": activation_id,
            "request_id": request_id,
            "lab_id": lab_id,
            "project_id": request_record.get("project_id", ""),
            "activation_hash": activation_hash,
            "activation_notes": self._limit(activation_notes, 1400),
            "activated_by": self._sender(),
            "activated_at": activated_at,
        }

        self.activated_hypotheses[request_id] = self._json(activation_record)
        self.approved_hypothesis_hashes[request_record.get("evidence_manifest_hash", "")] = request_id

        request_record["status"] = "ACTIVATED"
        request_record["activation_id"] = activation_id
        request_record["activated_at"] = activated_at
        self.hypothesis_requests[request_id] = self._json(request_record)

        self._record_audit(
            lab_id,
            request_id,
            "HYPOTHESIS_ACTIVATED",
            self._sender(),
            "Approved hypothesis activated",
            activation_hash,
            activated_at,
        )

        return self._json(activation_record)

    @gl.public.write
    def mark_hypothesis_rejected(
        self,
        request_id: str,
        block_reason: str,
        blocked_at: str,
    ) -> None:
        self._require_not_paused()

        raw_request = self.hypothesis_requests.get(request_id, "")
        if raw_request == "":
            raise gl.vm.UserError("Hypothesis request not found: " + request_id)

        request_record = self._load(raw_request)
        lab_id = request_record.get("lab_id", "")
        self._require_lab_owner_or_admin(lab_id)

        request_record["status"] = "REJECTED"
        request_record["block_reason"] = self._limit(block_reason, 1000)
        request_record["blocked_at"] = blocked_at
        self.hypothesis_requests[request_id] = self._json(request_record)
        self.blocked_hypothesis_hashes[request_record.get("evidence_manifest_hash", "")] = request_id

        self._record_audit(
            lab_id,
            request_id,
            "HYPOTHESIS_REJECTED",
            self._sender(),
            "Hypothesis manually rejected",
            block_reason,
            blocked_at,
        )

    # ------------------------------------------------------------------
    # Read methods — laboratories
    # ------------------------------------------------------------------

    @gl.public.view
    def get_laboratory(self, lab_id: str) -> str:
        return self.laboratories.get(lab_id, "")

    @gl.public.view
    def get_laboratory_role(self, lab_id: str, wallet: str) -> str:
        return self.lab_roles.get(self._key2(lab_id, wallet.lower()), "")

    @gl.public.view
    def get_laboratory_index(self) -> str:
        return self.lab_index.get("all", "")

    # ------------------------------------------------------------------
    # Read methods — papers
    # ------------------------------------------------------------------

    @gl.public.view
    def get_paper(self, paper_id: str) -> str:
        return self.papers.get(paper_id, "")

    @gl.public.view
    def get_laboratory_paper_index(self, lab_id: str) -> str:
        return self.lab_paper_index.get(lab_id, "")

    # ------------------------------------------------------------------
    # Read methods — projects
    # ------------------------------------------------------------------

    @gl.public.view
    def get_project(self, project_id: str) -> str:
        return self.projects.get(project_id, "")

    @gl.public.view
    def get_laboratory_project_index(self, lab_id: str) -> str:
        return self.lab_project_index.get(lab_id, "")

    # ------------------------------------------------------------------
    # Read methods — hypothesis requests and decisions
    # ------------------------------------------------------------------

    @gl.public.view
    def get_hypothesis_request(self, request_id: str) -> str:
        return self.hypothesis_requests.get(request_id, "")

    @gl.public.view
    def get_request_decision_id(self, request_id: str) -> str:
        return self.request_decisions.get(request_id, "")

    @gl.public.view
    def get_decision(self, decision_id: str) -> str:
        return self.decisions.get(decision_id, "")

    @gl.public.view
    def get_latest_decision_for_request(self, request_id: str) -> str:
        decision_id = self.request_decisions.get(request_id, "")
        if decision_id == "":
            return ""
        return self.decisions.get(decision_id, "")

    @gl.public.view
    def get_laboratory_request_index(self, lab_id: str) -> str:
        return self.lab_request_index.get(lab_id, "")

    @gl.public.view
    def get_project_request_index(self, project_id: str) -> str:
        return self.project_request_index.get(project_id, "")

    # ------------------------------------------------------------------
    # Read methods — human review and activation
    # ------------------------------------------------------------------

    @gl.public.view
    def get_escalation(self, request_id: str) -> str:
        return self.escalations.get(request_id, "")

    @gl.public.view
    def get_human_review(self, request_id: str) -> str:
        return self.human_reviews.get(request_id, "")

    @gl.public.view
    def get_activated_hypothesis(self, request_id: str) -> str:
        return self.activated_hypotheses.get(request_id, "")

    # ------------------------------------------------------------------
    # Read methods — audit trail
    # ------------------------------------------------------------------

    @gl.public.view
    def get_audit_log(self, audit_id: str) -> str:
        return self.audit_logs.get(audit_id, "")

    @gl.public.view
    def get_request_audit_index(self, request_id: str) -> str:
        return self.request_audit_index.get(request_id, "")

    @gl.public.view
    def get_reviewer_reputation(self, lab_id: str, reviewer_wallet: str) -> str:
        return self.reviewer_reputation.get(self._key2(lab_id, reviewer_wallet.lower()), "")

    @gl.public.view
    def is_hypothesis_hash_approved(self, hypothesis_hash: str) -> str:
        return self.approved_hypothesis_hashes.get(hypothesis_hash, "")

    @gl.public.view
    def is_hypothesis_hash_blocked(self, hypothesis_hash: str) -> str:
        return self.blocked_hypothesis_hashes.get(hypothesis_hash, "")
