# Phase 2: Failure Effects Documentation

## Knowledge

For each failure mode, determine the **effects** -- the consequences that would result if this failure actually occurred. Effects answer the question:

> "Because of this failure, what goals, use cases, requirements, or performance metrics are affected, and in what way?"

### Types of effects to consider:
- **Performance loss** -- degraded system output, reduced accuracy, slower response
- **Budget / cost impact** -- additional costs incurred due to the failure
- **Schedule delays** -- time lost, missed deadlines
- **Equipment / parts damage** -- physical damage to the system or related hardware
- **Human harm** -- injury risk to operators, users, or bystanders
- **Cascading consequences** -- ripple effects through the system (especially for component-level FMEAs)
- **Requirement violations** -- "project/mission failure" if a hard requirement can no longer be met

### Cascading effects pattern (service-level):
Trace the failure through the system to its end-user and business impact. Example from the Payment Service:
1. Stripe API call times out after 500ms →
2. Payment Service returns error to Order Service →
3. Order Service leaves order in "pending" state →
4. Customer sees "processing" spinner indefinitely →
5. Customer refreshes and retries checkout → potential double charge →
6. **Customer is charged twice, receives no confirmation, calls support** (end-user impact) →
7. **Refund required, chargeback fees incurred, trust permanently damaged** (business impact)

See [Resiliency Patterns KB](resilliency-patterns-kb.md) for how circuit breakers and retry policies interrupt this cascade, and [API Design KB](api-design-sys-design-kb.md) for how idempotency keys prevent double-charging.

### Key rules:
- Each failure mode can have **multiple effects** -- list them all
- Effects can optionally be broken into separate rows, but this is not required at this stage
- Include effects at all levels: local (component), system, and mission/project level
- The more complete the effects list, the better you can assess severity later

### Example (E-Commerce Platform — effects spanning multiple system layers):

| Failure Mode | Failure Effects |
|---|---|
| Failed to process payment | Order stuck in pending state, customer uncertain if charged, potential duplicate checkout attempt, manual refund required, support escalation, chargeback fees if unresolved |
| Platform unresponsive during traffic spike | Complete revenue loss during outage (~$X/minute depending on traffic), SLA violation triggering contractual penalties, negative social media coverage, customer loss to competitors. See [Load Balancing KB](load-balancing-kb.md) |
| CDN serves stale content | Incorrect prices displayed → customer anger at checkout when real price is higher, out-of-stock items appear purchasable → orders that cannot be fulfilled, inventory mismatch across channels. See [Caching KB](caching-system-design-kb.md) |
| Deployment introduces regression | Previously working feature breaks in production, rollback required (downtime during rollback), developer time spent debugging instead of building features, customer-facing impact if regression hits checkout or search. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |

## Input Required

- Confirmed failure modes table from Phase 1

## Instructions for the LLM

1. For each failure mode, ask: "If this failure occurred, what would happen next?"
2. Trace the chain of consequences to the end-user or project-level impact.
3. Consider all effect types listed in the knowledge section above.
4. Write effects as concise but complete descriptions. Multiple effects for one failure mode should be separated by commas or listed explicitly.
5. Add the Failure Effects column to the existing table.

## Output Format

Extend the table from Phase 1:

```markdown
| Subsystem | Failure Mode | Failure Effects |
|-----------|-------------|----------------|
| [Subsystem 1] | [Failure mode 1a] | [Effect 1, Effect 2, ...] |
| [Subsystem 1] | [Failure mode 1b] | [Effect 1, Effect 2, ...] |
| ... | ... | ... |
```

---

## STOP GAP -- Checkpoint 2

**Present the updated table to the user and ask:**

> "Here are the failure effects for each failure mode. Please review:
> 1. Do the effects capture the full downstream impact on the system and end users?
> 2. Are there any cascading consequences I have missed?
> 3. Are there any effects listed that seem inaccurate or unlikely?
>
> Confirm this is complete before I proceed to Phase 3 (Possible Causes)."

**Do NOT proceed until the user confirms.**
