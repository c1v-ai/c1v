---
source: "Crawley 2015, System Architecture"
chapter: 6
section: "Ch 6 §§6.1–6.3 + Box 6.1 architecture definition, Box 6.2 Value/Architecture"
relevance_to_kb: "Architecture = mapping of function to form (not an independent thing); non-1:1 taxonomy; five-layer architecture model; interface spec (common operand + shared process + androgynous/compatible instruments)."
word_count: 500
---

# Crawley Ch 6 — System Architecture (Synthesis)

Ch 6 is the hinge chapter: architecture is the **mapping** of function to form, not an independent thing.

## Architecture definition (Box 6.1, line 2535)

Architecture = "the embodiment of concept, the allocation of physical/informational function to the elements of form, and the definition of relationships among the elements and with the surrounding context."

## Principle of Value and Architecture (Box 6.2, line 2549)

"Value is benefit at cost. Architecture is function enabled by form. … developing good architectures (desired function for minimal form) will be nearly synonymous with the delivery of value."

Form attracts cost (lean axiom); function emerges benefit.

## Non-1:1 mapping taxonomy (Figure 6.5, lines 2620–2642)

KB-5 and KB-7 depend on this enumeration:

- **(a) No instrument** — melting with no agent. Must be a missing instrument; find it.
- **(b) Operand = instrument** — person walks herself.
- **(c) One-to-one with complex operand** — each process has own instrument, but operands are coupled attributes of the same object (amplifier).
- **(d) One-to-one with multiple operands** — circulatory system: heart/lung/capillaries each 1:1, but operands include both oxygen-rich and oxygen-poor blood.
- **(e) One-to-many** — cook stirs AND cuts (one instrument, two processes).
- **(f) Many-to-many** — food prep in kitchen AND dining room (many instruments, many processes).

This taxonomy is the warrant for c1v's KB-7 to enumerate non-ideal interface patterns rather than enforce 1:1.

## Form-to-process procedure (line 2658)

1. Identify all form elements.
2. Identify all internal processes + operands.
3. For each process, ask which form is needed.
4. Map form-to-process.
5. Reason about unassigned form.

## Structure-to-interaction rule (line 2690)

Functional interaction usually requires a connection of form; some interactions (gravity, electromagnetic, ballistic) don't.

## Five-layer architecture model (§6.3, line 2757)

1. Value-operands
2. Value-processes
3. Value-instruments
4. Supporting processes
5. Supporting instruments

**Non-idealities** (seals, O-rings, covers, error-detection codes) sit close to the value pathway but not on it. They manage operands (contain, move, store), improve performance/robustness, or correct biases.

**Supporting functions** sit one or two layers out — motors need power, organizations need HR and IT, software stacks need OSI-layer-style support (OSI 7-layer / Internet 4-layer: all value is in application layer, rest is support).

## Interface specification (Figure 6.11, line 2777)

Every interface has three parts:
1. **Common operand** passing through boundary (unchanged).
2. **Shared/common process** of passing.
3. **Two compatible interface instruments** — either:
   - **Androgynous** — identical form on both sides (e.g., Ethernet jack on both ends).
   - **Compatible** — different but fit together (e.g., power cable and socket).

This is the lowest-level schema an interface specification can have and still be complete — the KB-7 interface schema contract.

## Citations
- Ch 6 Box 6.1 (line 2535) — architecture definition.
- Ch 6 Box 6.2 (line 2549) — Principle of Value and Architecture.
- Ch 6 Figure 6.5 (line 2620ff) — non-1:1 taxonomy.
- Ch 6 §6.3 (line 2757) — five-layer architecture model.
- Ch 6 Figure 6.11 (line 2777) — interface specification.

> See full text in plans/research/crawley-book-findings.md §Ch 6.
