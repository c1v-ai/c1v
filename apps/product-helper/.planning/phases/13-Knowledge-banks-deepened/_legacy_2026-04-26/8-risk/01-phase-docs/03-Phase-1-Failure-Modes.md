# Phase 1: Failure Mode Identification

## Knowledge

A **failure mode** is a loss or degradation of functionality -- NOT a description of what broke or what component failed. It describes what the system can no longer do or cannot do well.

### How to think about failure modes:
- "Unable to [function]"
- "Failure to [verb]" (e.g., failure to stop, failure to lock, failure to release)
- "Degraded [function]" (e.g., delayed release, reduced output)
- "Excessive [output]" (e.g., excessive energy transfer)
- "No [output] provided" (e.g., no signal provided)
- "Incorrect [output]" (e.g., reported value too high / too low)

### Where to brainstorm failure modes:
- **Functional requirements** -- each requirement is a function that could be lost
- **Use cases / operational flow diagrams** -- each step is a potential failure point
- **Interface definitions** -- failures commonly happen where subsystems exchange information, energy, or material
- **Performance targets** -- any target that could be missed is a potential failure mode

### What a failure mode is NOT:
- NOT a root cause ("the bolt sheared" is a cause, not a failure mode)
- NOT a specific broken component ("broken motor" is a cause, not a failure mode)
- NOT an effect ("bicycle goes too fast" is an effect, not a failure mode)

### Example (E-Commerce Platform — across multiple subsystems):

| Subsystem | Failure Mode | Why it qualifies | Related KB |
|---|---|---|---|
| Payment Service | Failed to process payment | Loss of function — the service cannot complete its primary task | [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| Payment Service | Customer charged twice for same order | Excessive output — the function executes more than intended | [API Design KB](api-design-sys-design-kb.md) |
| Search Service | Search results not returned within 500ms | Degraded function — the service works but too slowly | [Data Model KB](data-model-kb.md) |
| Storefront Service | CDN serves stale or incorrect content | Incorrect output — content does not reflect current state | [Caching KB](caching-system-design-kb.md) |
| Order Service | Incorrect order total calculated | Incorrect output — the calculation is wrong | [API Design KB](api-design-sys-design-kb.md) |
| All Services | Platform unresponsive during traffic spike | Total loss of function — nothing works | [Load Balancing KB](load-balancing-kb.md) |
| Notification Service | Order confirmation email not sent | Loss of function — event not delivered | [Message Queues KB](message-queues-kb.md) |
| All Services | Deployment introduces regression | Degraded function — previously working feature breaks | [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| Cart Service | Cart state lost mid-session | Loss of data — user's work is destroyed | [Caching KB](caching-system-design-kb.md) |
| All Services | Undetected performance degradation | Degraded function over time — no one notices until it is severe | [Observability KB](observability-kb.md) |

Notice: failures come from every layer of the system — payment processing, search performance, caching, load handling, message delivery, deployment processes, session management, and monitoring. A thorough FMEA covers all of them, not just the most obvious.

## Input Required

- Confirmed System Context Summary from Phase 0
- User should select which subsystem/component to start with (or LLM can suggest starting with the most critical one)

## Instructions for the LLM

1. Take the first subsystem/component from the confirmed list.
2. Review its function, interfaces, and the functional requirements it serves.
3. Brainstorm failure modes by systematically asking:
   - What if this subsystem cannot perform its primary function at all?
   - What if it performs the function but with degraded quality/accuracy?
   - What if it performs the function excessively or beyond acceptable bounds?
   - What if it performs the function at the wrong time (too early, too late, intermittent)?
   - What if it cannot properly interface with connected subsystems?
4. List each failure mode in the output table.
5. Repeat for each subsystem/component.

## Output Format

Build the first two columns of the FMEA table:

```markdown
| Subsystem | Failure Mode |
|-----------|-------------|
| [Subsystem 1] | [Failure mode 1a] |
| [Subsystem 1] | [Failure mode 1b] |
| [Subsystem 1] | [Failure mode 1c] |
| [Subsystem 2] | [Failure mode 2a] |
| ... | ... |
```

---

## STOP GAP -- Checkpoint 1

**Present the failure modes table to the user and ask:**

> "Here are the failure modes I have identified for each subsystem. Please review:
> 1. Are there failure modes missing for any subsystem?
> 2. Are any of these not actually failure modes (i.e., they describe a cause or an effect rather than a loss of functionality)?
> 3. Are there any additional subsystems that should be analyzed?
>
> Confirm this list is complete before I proceed to Phase 2 (Failure Effects)."

**Do NOT proceed until the user confirms.**
