# Phase 5: Corrective Actions and Failure Mode Identifiers

## Knowledge

Corrective actions are steps taken to mitigate risk by reducing the severity, the likelihood, or both. This is where the FMEA transitions from analysis to action planning.

### Types of corrective actions:
1. **Architecture/design changes** -- modify the system to prevent the failure (e.g., add circuit breakers, implement retry with backoff, add redundant instances, introduce idempotency keys). See [Resiliency Patterns KB](resilliency-patterns-kb.md) and [API Design KB](api-design-sys-design-kb.md)
2. **Operational/process changes** -- change how the system is deployed and maintained (e.g., add canary deployments, enforce code review, implement runbooks, add load testing to release process). See [Deployment & CI/CD KB](deployment-release-cicd-kb.md)
3. **Project plan changes** -- adjust timelines, budgets, or resources (e.g., allocate sprint for performance hardening, budget for managed search service, hire SRE)
4. **Fallback/alternative plans** -- backup plans if the failure occurs despite prevention (e.g., "failover to secondary payment provider", "switch to read-only mode during outage", "queue emails for retry"). See [Message Queues KB](message-queues-kb.md)
5. **Severity reducers** -- actions that don't prevent the failure but limit its impact (e.g., graceful degradation — show cached search results when search service is down, display "order received" page even if email confirmation is delayed). See [Caching KB](caching-system-design-kb.md) and [Observability KB](observability-kb.md) for how monitoring enables fast detection and containment

### Prioritization rules:
- Address **HIGH risk** items first -- these MUST have corrective actions
- Address **MEDIUM HIGH risk** items next -- almost all should have corrective actions
- MEDIUM and lower risk items should be addressed if feasible, but are lower priority

### Writing style:
- Short phrases are acceptable in a spreadsheet format
- Can reference external documents: "Please see the timeline alternative Plan B"
- Multiple corrective actions per cause row are acceptable (list them together)

### Post-corrective-action severity review:
After writing corrective actions, revisit severity scores. Formalizing corrective actions sometimes reveals that the true cost/time/impact is different than initially estimated. Adjust severity if warranted.

### Failure Mode identifiers:
After completing corrective actions, assign a unique ID to each distinct failure mode:
- Format: **F.1**, **F.2**, **F.3**, etc.
- All cause rows sharing the same failure mode share the same F.# identifier
- This numbering enables traceability between corrective actions and specific failure modes

### Example (E-Commerce Platform — corrective actions across system layers):

| F.# | Possible Cause | Corrective Action | Action Type |
|---|---|---|---|
| F.1 | Stripe API timeout with no retry | Implement retry with exponential backoff (3 attempts, 1s/2s/4s). Add circuit breaker that opens after 5 consecutive failures. Add Stripe webhook listener as async fallback. See [Resiliency Patterns KB](resilliency-patterns-kb.md) | Architecture change |
| F.1 | Developer breaks Stripe integration | Add integration tests against Stripe test mode in CI pipeline. Block deploy if payment tests fail. Add API key rotation to deploy checklist. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) | Process change |
| F.2 | Missing idempotency key on checkout | Add UUID idempotency key to every checkout request. Payment Service rejects duplicates. Store processed keys in Redis with 24hr TTL. See [API Design KB](api-design-sys-design-kb.md) | Architecture change |
| F.6 | Auto-scaling threshold too high | Lower threshold from 80% to 60% CPU. Add predictive scaling before known peaks. Quarterly load test at 5x traffic. See [Load Balancing KB](load-balancing-kb.md) | Process change + architecture |
| F.6 | Database connection pool exhausted | Add PgBouncer connection pooler. Create read replicas for search queries. Alert at 75% pool utilization. See [Data Model KB](data-model-kb.md) | Architecture change |
| F.4 | CDN cache invalidation failure | Event-driven purge: price update → SNS → CloudFront invalidation. Reduce TTL on price-sensitive pages to 5min. See [Caching KB](caching-system-design-kb.md) | Architecture change |
| F.10 | Monitoring alerts misconfigured | Implement SLO-based alerting (error budget burn rate). Add synthetic monitoring — automated checkout every 5min. Weekly alert review. See [Observability KB](observability-kb.md) | Process change |
| F.8 | Insufficient test coverage | Enforce 85% coverage gate in CI. Add canary deployment — 5% traffic first, auto-rollback on error spike. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) | Process change + severity reducer |

## Input Required

- Confirmed FMEA table with Severity, Likelihood, RPN, and Risk Criticality from Phase 4

## Instructions for the LLM

1. Sort or group the table by Risk Criticality (HIGH first, then MEDIUM HIGH, etc.).
2. For each cause row rated HIGH or MEDIUM HIGH:
   - Propose at least one corrective action addressing the cause
   - Consider all five corrective action types listed above
   - Prefer actions that reduce likelihood (prevent the cause) over those that only reduce severity (limit the damage)
3. For MEDIUM risk items, propose corrective actions where feasible.
4. After writing all corrective actions, review: should any severity scores change?
5. Add the `Failure Mode #` column (F.1, F.2, ...) to the leftmost position. All cause rows sharing the same failure mode text get the same F.# identifier.

## Output Format

Add two columns to the table:

```markdown
| F.# | Subsystem | Failure Mode | Failure Effects | Possible Cause | Severity | Likelihood | RPN | Risk Criticality | Corrective Action |
|---|---|---|---|---|---|---|---|---|---|
| F.1 | ... | ... | ... | ... | ... | ... | ... | HIGH | [action(s)] |
| F.1 | ... | ... | ... | ... | ... | ... | ... | MEDIUM HIGH | [action(s)] |
| F.2 | ... | ... | ... | ... | ... | ... | ... | MEDIUM | [action(s) or "N/A - acceptable risk"] |
```

---

## STOP GAP -- Checkpoint 5

**Present the updated table to the user and ask:**

> "Here are the corrective actions for all HIGH and MEDIUM HIGH risk items, plus [N] additional MEDIUM risk items. Please review:
> 1. Are the corrective actions feasible given your project constraints (time, budget, resources)?
> 2. Are there better alternatives for any of these actions?
> 3. Should any severity scores be adjusted now that corrective actions are formalized?
> 4. Are the failure mode identifiers (F.1, F.2, ...) correctly grouped?
> 5. Are there any HIGH or MEDIUM HIGH risk items missing corrective actions?
>
> Confirm before I proceed to Phase 6 (Adjusted Ratings and Stoplight Charts)."

**Do NOT proceed until the user confirms.**
