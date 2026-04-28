# Phase 2: Functional vs. Structural Thinking

> **This is the single most important rule in FFBD creation — and the most violated.**

## Prerequisites
- [ ] You have completed [Phase 1 — FFBD Foundations](01_FFBD-FOUNDATIONS.md)
- [ ] You have a system concept to describe
- [ ] You have a list of components or technologies you *think* the system will use (we will challenge that list)

## Context (Why This Matters)

Every first-time FFBD contains the same mistake: **block names that describe components instead of functions**. A block labeled "Stripe" tells you what the team has decided to use. A block labeled "Process Payment" tells you what the team has decided the system must **do**.

These two framings produce radically different outcomes.

- "Stripe" locks you into a solution before you have evaluated alternatives. If Stripe's pricing changes, if a region is unsupported, if a merchant refuses to use a US-based processor, you are stuck re-architecting.
- "Process Payment" keeps your options open. Stripe may be the right choice — but so might Adyen, Braintree, Square, a direct bank integration, or even an in-house payment service. The FFBD does not care which. It cares that the function is performed.

**The FFBD describes what must happen, not what will do it.**

## The Mantra

> **Think functionally, not structurally. Think functionally, not structurally.**

Repeat this. Write it on your whiteboard. Have your team say it out loud when anyone proposes a block name.

## The Rule

**Do not list the structural element that fulfills a function. List the function that must be achieved.**

## Examples

### Hardware Examples

| Structural (WRONG) | Functional (RIGHT) |
|--------------------|--------------------|
| Thermometer | Measure Temperature |
| Motor | Adjust Position / Provide Thrust / Locomotion |
| Fan | Cool Component |
| Battery | Supply Power |
| Accelerometer | Measure Motion |
| LED | Indicate Status |
| Heart-rate sensor | Measure Heart Rate |

### Software Examples

| Structural (WRONG) | Functional (RIGHT) |
|--------------------|--------------------|
| PostgreSQL | Store Persistent Data |
| Redis | Cache Frequently Accessed Data |
| Stripe | Process Payment |
| SendGrid | Deliver Transactional Email |
| OAuth 2.0 | Authenticate Identity |
| JWT | Validate Session |
| Datadog | Monitor System Health |
| Kubernetes | Orchestrate Containers |
| CloudFront | Deliver Static Content to Edge |
| RabbitMQ | Queue Asynchronous Events |
| Elasticsearch | Index and Search Documents |
| Stripe Radar | Score Fraud Risk |

## Why This Matters: The Cooling Example

Imagine you want to cool a component. You might initially think: *"Oh, I've got to have a fan for this — I'll put 'fan' into my FFBD."* This locks the team in.

- What if **liquid cooling** is more effective?
- What if a **heat sink** is cheaper and passive?
- What if **intermittent operation** of the device eliminates the heat problem?
- What if **redesigning the housing** for passive airflow removes the need for active cooling entirely?

If "fan" is in the FFBD, your teammates will assume the answer is a fan and stop exploring. If "cool component" is in the FFBD, all of those options remain on the table — and you pick the best one in Module 4, not Module 3.

## Why This Matters: The PostgreSQL Example

Same pattern in software. "PostgreSQL" in a block locks the team into:

- Relational schema design
- A specific operational footprint
- Specific HA/replication patterns
- Specific licensing and cloud costs
- A specific query language

"Store Persistent Data" keeps all of PostgreSQL, MongoDB, DynamoDB, Cassandra, SQLite, even a flat file system on the table. You will pick the right one in Module 4 when you have performance criteria to evaluate against.

## Functional Granularity

Functions can be written at any level:

| Level | Example |
|-------|---------|
| **Very high** | Determine Best Option / Evaluate Data / Operate System |
| **High** (use-case level) | Onboard Merchant / Process Order / Fulfill Order |
| **Medium** | Validate Inventory / Calculate Shipping Cost |
| **Low** | Increment Counter / Input Voltage |
| **Very low** | Write Byte to Register |

You can mix levels freely within a single FFBD. Later, hierarchical decomposition (Phase 7) will let you replace a high-level block with its own detailed FFBD. For now, **start high and drill down only where complexity demands it.**

## Worked Example: E-Commerce Platform Block Names

Here is how the e-commerce platform's functional block names should look — and how they **should not**:

| ❌ Structural | ✅ Functional |
|----------------|----------------|
| Stripe Checkout | Process Payment |
| SendGrid Send | Deliver Order Confirmation |
| Redis Cart Session | Maintain Shopping Cart State |
| Elasticsearch Query | Search Product Catalog |
| PostgreSQL Insert Order | Persist Order Record |
| CloudFront Cache | Serve Static Content |
| RabbitMQ Publish | Dispatch Fulfillment Event |
| Stripe Radar Check | Score Payment Fraud Risk |

Notice that the functional names **remove vendor specificity** and **describe the business outcome**. In Module 4 we compare alternatives (Shopify Plus, a custom build, and our open-source platform); had we named blocks "Stripe" throughout our FFBD, those comparisons would have been meaningless because Shopify Plus bundles its own payment stack.

## Common Violations — How to Catch Yourself

If a team member proposes a block name, run it through these checks:

1. **Could a different vendor/library/component perform this function?** If yes and the name references the vendor, rewrite.
2. **Is the name a noun (a thing)?** Functions are usually verbs + objects. "Thermometer" is a thing. "Measure Temperature" is a function.
3. **Would this name still be correct if you swapped to an alternative implementation?** "Store Persistent Data" survives a database swap. "PostgreSQL" does not.
4. **Does the name describe what the system DOES for the user/outcome, or what it IS MADE OF?** The FFBD is about doing.

## Scripted Correction (for an AI agent using this KB)

When a user or teammate proposes a structural block name, respond with the following pattern:

```
Hold on — "{structural_name}" is a STRUCTURAL element, not a function.

What FUNCTION does that component serve?
- Option 1: "{functional_option_1}"
- Option 2: "{functional_option_2}"
- Option 3: "{functional_option_3}"

The FFBD describes what must HAPPEN, not what will DO it. {structural_name}
might be the right choice later — but what if {alternative_1} or {alternative_2}
would work better? Keeping the name functional preserves your options.

Let's rename this to the function it achieves. Which functional name fits best?
```

## Validation Checklist (STOP-GAP)
- [ ] Can you state the mantra from memory? ("Think functionally, not structurally.")
- [ ] Can you give three examples of structural names and their functional replacements?
- [ ] Do you understand why structural naming closes off design options too early?
- [ ] Have you reviewed your system concept for any component-name temptations you need to resist?

> **STOP: Do not proceed to Phase 3 until all items pass.**
> If you have draft block names already, rewrite any structural ones before moving on.

## Output Artifact

A commitment to functional naming and a mental checklist to catch structural names when drafting. No blocks drawn yet — but you now know what to write in them.

## Handoff to Next Phase

You know the rule. Phase 3 covers the **anatomy of a functional block** — header, body, IDs, sizing, and formatting — so your blocks look professional the first time.

---

**Next →** [03 — Creating Functional Blocks](03_CREATING-FUNCTIONAL-BLOCKS.md) | **Back:** [01 — FFBD Foundations](01_FFBD-FOUNDATIONS.md)
