---
source: "Crawley 2015, System Architecture"
chapter: 6
section: "Ch 6 §6.3 + Figure 6.11 interface specification, Figure 6.5 non-1:1 mapping taxonomy"
relevance_to_kb: "The canonical interface spec (common operand + shared process + androgynous/compatible instruments) and the non-1:1 mapping taxonomy — KB-7's core schema contract for interface entries."
word_count: 470
---

# Crawley Ch 6 §6.3 — Interface Specification + Non-Idealities (for Interfaces)

## Interface specification (Figure 6.11, line 2777)

Every interface has **three** parts:

1. **Common operand** passing through the boundary (unchanged in transit).
2. **Shared/common process** of passing.
3. **Two compatible interface instruments** — either:
   - **Androgynous** — identical form on both sides (e.g., Ethernet jack on both ends, USB-C to USB-C, peer-to-peer API call with same schema both directions).
   - **Compatible** — different but fit together (e.g., power cable and socket, client HTTP request to server HTTP response endpoint).

This is the **lowest-level schema** an interface specification can have and still be complete. Every KB-7 interface entry MUST carry these three parts.

## Non-1:1 mapping taxonomy (Figure 6.5, lines 2620–2642)

The form-to-function mapping at an interface is rarely 1:1. Ch 6 enumerates six non-1:1 cases KB-7 must accommodate:

- **(a) No instrument** — process occurs without an obvious instrument (melting — what does the melting? Find the missing instrument).
- **(b) Operand = instrument** — person walks herself; self-referential interface.
- **(c) One-to-one with complex operand** — each process has its own instrument but operands are coupled attributes of the same object (amplifier, passenger emergency card).
- **(d) One-to-one with multiple operands** — circulatory system: heart/lung/capillaries each 1:1, but operands include both oxygen-rich and oxygen-poor blood (multi-state operand at interface).
- **(e) One-to-many** — cook stirs AND cuts (one instrument, two processes — single physical interface carrying multiple functional interactions).
- **(f) Many-to-many** — food prep in kitchen AND dining room (many instruments, many processes — distributed interface pattern).

This taxonomy is the warrant for KB-7 to enumerate non-ideal interface patterns rather than enforce 1:1 process-to-form allocation.

## Five-layer architecture and non-idealities (§6.3, line 2757)

Non-ideal instruments (seals, O-rings, covers, error-detection codes in communications) do not appear in the idealized value pathway but DO require interfaces. They:

1. **Manage operands** — contain, move, store (seals prevent leaks, buffers hold queued data).
2. **Improve performance or robustness** — covers prevent damage, redundancy masks failures.
3. **Correct biases** — error-correction codes counteract noise.

Non-idealities sit close to the value pathway but not on it. KB-7 must enumerate these explicitly — they are the source of most "hidden" interfaces that fail in integration.

## Supporting-layer interfaces

Supporting functions (power, thermal, HR for human orgs, IT for info systems) sit one or two layers out. Crawley cites OSI 7-layer and Internet 4-layer as classic examples: all value is in the application layer; all other layers are support. KB-7 must tag each interface with its layer (value vs. non-ideality vs. supporting) to keep the architecture legible.

## Citations
- Ch 6 Figure 6.11 (line 2777) — interface spec (three parts).
- Ch 6 Figure 6.5 (line 2620ff) — non-1:1 mapping taxonomy.
- Ch 6 §6.3 (line 2757) — five-layer architecture + non-idealities.

> See full text in plans/research/crawley-book-findings.md §Ch 6.
