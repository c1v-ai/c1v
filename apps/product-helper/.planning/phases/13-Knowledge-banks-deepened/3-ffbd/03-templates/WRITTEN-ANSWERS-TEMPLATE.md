# Written Answers Template — Part 1 and Part 2

> Fill in each answer below. Guiding prompts tell you what to include, and the example answers (from a C1V agent-deployment platform project) show the depth and structure expected.

---

## System Description (Step 1 — ≤ 250 words)

**Prompt:** Briefly describe the system your project work will be based on and how it relates to the FFBD you created.

**Example (C1V Platform):**
> *My system is an AI Native Platform-as-a-Service for enterprise internal and external Agent deployment. Think lovable but for AI agent deployment for both internal process improvement and external customer-facing agentic workflows.*

**Your answer:**

```
[Your system description here — ≤ 250 words]
```

---

# Part 1 — Basic FFBD Written Answers

## Q1. Explain the logical flow within your FFBD

**What to include:**
- Where the flow starts (first function) and ends (terminal function)
- The sequence through each major block — in plain English
- Where branches, parallelism, or loops occur (and why those logic gates were chosen)
- Any important precedes-arrow gaps (real elapsed time between functions)
- How the flow maps to the real operational reality of your system

**Depth target:** 100–200 words.

**Example (C1V):**
> The flow begins with F.1 Register Org and F.2 Verify Identity (account creation and identity check), then F.3 Configure Governance sets the compliance rules for all downstream behavior. F.4 Create Department establishes the org unit that owns agents, then the flow branches: F.5 Connect Data / F.6 Validate Data run in parallel with F.7 Define Agent KPIs, since data integration and success metrics are independent workstreams. Once both complete, F.8 Build Agent creates the agent from a template, F.9 Configure Consent sets up bilateral consent contracts, and F.10 Test in Sandbox validates behavior. F.11 Review Compliance checks against F.3's policies, leading to either F.12 Approve Agent or F.13 Revise Agent (looping back to F.8). Once approved, F.14 Deploy Agent provisions to production, and F.15 Operate System handles runtime.

**Your answer:**

```
[Your logical flow narrative here]
```

---

## Q2. Explain the flow defined by your logic gates

**What to include:**
- For each gate pair: what opens the branch/loop, what closes it, and WHY that gate type (AND vs. OR vs. IT)
- For AND gates: explain the concurrent prerequisites that make AND correct (not OR)
- For OR gates: name the mutually exclusive conditions
- For IT gates: state the termination condition

**Depth target:** 100–200 words.

**Example (C1V):**
> **AND pair** (after F.4, before F.8): Splits into parallel workstreams — data connection/validation and KPI definition happen simultaneously. The closing AND enforces that both must complete before building agents. These are concurrent prerequisites, not alternatives.
>
> **OR pair** (after F.11, before F.14): Compliance review produces one of two outcomes — approve or revise. If revised, the flow loops back to F.8. OR captures this mutually exclusive decision point.

**Your answer:**

```
[Your logic gate explanations here]
```

---

## Q3. Summarize the use of arrows

**What to include:**
- The default arrow type in your diagram (typically trigger)
- Every place you used a precedes arrow, and the real elapsed-time reason
- Any arrow labels and what they communicate
- Any arrow shortcuts and why each was needed (avoiding overlaps within a diagram)

**Depth target:** 75–150 words.

**Example (C1V):**
> Most connections use **trigger arrows** for immediate handoffs. **Precedes arrows** appear in two places:
> - F.3 → F.4 (*"Per department"*) because governance is configured once but departments are created over time, not immediately.
> - F.14 → F.15 (*"Provisioning"*) because deployment does not instantly start operations — credentials need to propagate and the agent must register with the message bus.
>
> Both precedes arrows signal real elapsed time between functions.

**Your answer:**

```
[Your arrow summary here]
```

---

# Part 2 — Evolved FFBD Written Answers

## Q4. Explain the logical flow of your evolved FFBD (with examples for blocks, gates, arrows, shortcuts)

**What to include:**
- Entry reference block (where the sub-flow picks up from the parent diagram)
- Sequence through sub-blocks in plain English
- Each gate (AND/OR/IT) with the justification for that choice
- Any precedes arrows (and what time gap they represent)
- Exit reference block (where the sub-flow hands off)
- EFFBD data blocks and what external input each represents

**Depth target:** 150–250 words.

**Example (C1V — evolved F.15 Operate System):**
> The evolved FFBD (Function 15: Operate System) follows the path of a single agent request through the platform. It starts at **F.14 Ref** (Deploy Agents), showing the system is already live.
>
> F.15.1 through F.15.3 run sequentially because each step depends on the last: authenticate first, then request a consent PIN, then validate that PIN. After consent clears, an **AND gate** splits into three parallel paths (F.15.4 Message Bus, F.15.5 Orchestrate Handoff, F.15.6 Escalate to Human) because the platform runs all three communication channels simultaneously. The closing AND gate waits for all three before F.15.7 logs the interaction.
>
> An **IT gate pair** wraps the entire sequence into a loop since the system processes requests continuously until the session ends or a kill switch fires. A **dashed precedes arrow** from the closing IT to **F.16 Ref** (Generate Report) shows that reporting only happens after the loop terminates.
>
> Three **EFFBD data blocks** (Agent Credentials, Customer Request, Compliance Policy) represent external inputs the system consumes but does not produce.

**Your answer:**

```
[Your evolved FFBD flow description here]
```

---

## Q5. How did you use reference blocks and hierarchical techniques to improve communication?

**What to include:**
- Why you chose the specific functional block to decompose (usually the most complex)
- How the parent diagram stays readable by using a single reference block instead of cramming detail in
- How the sub-diagram opens with a reference block to the preceding parent function and closes with one to the following parent function
- The traceability benefit — stakeholders can navigate up or down the hierarchy

**Depth target:** 100–175 words.

**Example (C1V):**
> On the elaborated FFBD, the last block leads to **"F.15 Ref: Operate System"** rather than trying to cram runtime details into an already dense diagram. The expanded Function 15 sits on a separate slide in full detail. System operation is the most complex function in the platform (consent handshake, three parallel communication paths, continuous iteration), making it the clear candidate for its own slide. The reference blocks act as traceable links between diagrams so any stakeholder can navigate up or down the hierarchy.

**Your answer:**

```
[Your hierarchy / reference block explanation here]
```

---

## Q6. Explain the title of your evolved FFBD and how it relates to the previous FFBD

**What to include:**
- The exact title of your evolved FFBD (format: `Function <N> : <Name>`)
- Where the function number comes from (the reference block on the parent diagram)
- How the sub-block IDs use the parent function number as prefix
- The traceability benefit — any sub-block ID like `F.N.M` traces back through the hierarchy
- What the title scopes (and what it excludes)

**Depth target:** 75–150 words.

**Example (C1V):**
> The title **"Function 15 : Operate System"**: the number 15 comes from the reference block "F.15 Ref: Operate System" on the elaborated FFBD. When that block is decomposed, the new diagram takes the block's ID as its function number, and all sub-blocks are numbered F.15.1 through F.15.7. This creates direct traceability: F.15.3 immediately tells you it belongs to Function 15, which is the system operation block from the elaborated FFBD. The title also scopes the diagram to runtime behavior only — not onboarding, configuration, or deployment.

**Your answer:**

```
[Your title explanation here]
```

---

## Q7. Give examples of how labels clarify the flow

**What to include:**
- Gate labels — especially what text on an AND junction clarifies vs. OR
- IT gate termination labels — the specific end condition
- Precedes arrow labels — the real reason for the time gap
- Data block labels — specific external inputs and what they bring
- Any arrow labels that communicate information payload or constraints

**Depth target:** 100–175 words.

**Example (C1V):**
> - **"Parallel communication paths"** on the AND junction clarifies that the three branches run simultaneously, not as alternatives (which would be an OR gate).
> - **"Until session ends or kill switch activated"** on the IT return path specifies the loop's termination condition, preventing the diagram from implying an infinite loop.
> - **"Provisioning"** on the precedes arrow into the evolved FFBD establishes that system operation cannot begin until deployment is complete.
> - The data block labels (**Agent Credentials, Customer Request, Compliance Policy**) identify specific external inputs. **Compliance Policy** feeding into F.15.3 makes it clear that consent validation is policy-governed, not arbitrary.

**Your answer:**

```
[Your label examples here]
```

---

## Q8. Describe key interfaces you identified and their impact on system design

**What to include:**
- Each interface numbered (e.g., I-1, I-2, I-3, ...)
- The two endpoints of each interface (what connects to what)
- The nature of the interface (sync API, async queue, event stream, dual-logging, etc.)
- The design implication — how this interface shapes a downstream architecture decision
- At least 3–4 key interfaces

**Depth target:** 150–250 words (or as a numbered list).

**Example (C1V):**
> **I-3 (Agent to Platform API):** Every agent authenticates and requests consent PINs through this interface. It requires a high-throughput API supporting two-phase handshakes with 60-second TTLs, shaping the entire authentication architecture.
>
> **I-4 (Agent to Agent):** Encrypted message bus communication that must validate consent on every interaction. An agent cannot message another agent without a governing consent contract, so the routing layer must enforce consent boundaries.
>
> **I-7 (Platform to Audit Log):** Dual logging where both sides of an interaction independently record the event. Compliance requirements (HIPAA, GDPR, EU AI Act) demand an append-only, tamper-resistant audit system capable of reconstructing decision lineage.
>
> **I-6 (Platform to External System):** External agents go through the same bilateral consent protocol but with federated identity resolution, meaning the platform must support cross-organizational trust relationships.

**Your answer:**

```
[Your key interfaces list here]
```

---

## Q9. Uncertainties — which functions to address first and why

**What to include:**
- List all **Red** (highest uncertainty) functions first, with specific open questions
- List **Yellow** functions next, with the edge cases that need resolution
- Note that **Green** functions use standard patterns and carry least risk
- For each Red/Yellow item, explain the downstream impact — why resolving it early prevents rework
- Justify the *order* of resolution (why this Red before that Red)

**Depth target:** 150–250 words.

**Example (C1V):**
> **F.15.6 Escalate to Human (Red)** — first. It is the least defined function: confidence thresholds, context handoff between agent and human, and whether the agent pauses during escalation are all open questions. These decisions affect the AND gate structure and the logging function, so resolving them early prevents rework.
>
> **F.15.2 and F.15.3 (Yellow)** — next. The bilateral consent protocol contains some risk such as PIN expiry mid-transaction and concurrent PIN requests. Every downstream function depends on consent working correctly.
>
> **F.15.5 Orchestrate Handoff (Yellow)** — third. Multi-agent coordination patterns are still being designed and build on top of the consent protocol, so this can wait until consent is stable.
>
> The **green functions (F.15.1, F.15.4, F.15.7)** use standard patterns and carry the least risk.

**Your answer:**

```
[Your uncertainty analysis here]
```

---

## Sanity Checks Before Submitting

- [ ] All 9 questions answered (3 for Part 1, 6 for Part 2)
- [ ] System description ≤ 250 words
- [ ] Block IDs in answers match the IDs on your diagrams
- [ ] Interface list uses consistent numbering (I-1, I-2, ...)
- [ ] Uncertainty colors in answers match the colors on your diagram
- [ ] Every "why" question has a substantive rationale (not just "because it made sense")
- [ ] Evolved FFBD answers reference specific block IDs, gate labels, and data block names
- [ ] No structural names anywhere in block identifiers or descriptions

---

**Back to:** [DELIVERABLES-AND-GUARDRAILS.md](DELIVERABLES-AND-GUARDRAILS.md) | [00 — Module Overview](00_MODULE-OVERVIEW.md)
