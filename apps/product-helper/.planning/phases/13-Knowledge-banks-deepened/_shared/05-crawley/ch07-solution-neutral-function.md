---
source: "Crawley 2015, System Architecture"
chapter: 7
section: "Ch 7 §§7.1–7.4 (shared cross-KB reference)"
relevance_to_kb: "Solution-Neutral Function is cross-cutting: KB-1 (intake phrasing), KB-2 (requirements neutrality), KB-4 (option-space framing), KB-5 (concept-template primary consumer) all depend on SNF hierarchy and vocabulary."
word_count: 440
---

# Crawley Ch 7 — Solution-Neutral Function and Concepts (shared)

A **solution-neutral function (SNF)** is a statement of intent expressed as *operand + process + attributes* with no mention of form or specific solutions. "Move fluid" is SNF; "centrifugal pump" is concept.

This shared reference exists so KB-1 (intake), KB-2 (requirements), and KB-4 (decision-net option enumeration) can cite a single authoritative treatment. KB-5 also has a local copy at `5-form-function/05-crawley/ch07-solution-neutral-function.md` because Ch 7 is KB-5's primary chapter.

## Principle of Solution-Neutral Function (Box 7.1, line 3048)

"Poor system specifications frequently contain clues about an intended solution, function, or form, and these clues may lead the architect to a narrower set of potential options. Use solution-neutral functions where possible, and use the hierarchy of solution-neutral statements to scope how broad an exploration of the problem is to be undertaken."

## SNF identification procedure (§7.2, lines 3080–3090)

1. Consider the beneficiary.
2. Identify the need.
3. Identify the SN operand whose state change yields benefit.
4. Identify the benefit-related attribute of that operand.
5. Optionally identify other relevant attributes.
6. Define the SN process that changes the benefit-related attribute.
7. Optionally identify attributes of the process.

## Worked example — transportation

Beneficiary=traveler, need=visit-client-in-another-city, SN operand=traveler, benefit attribute=location, other attributes=alone+light-luggage, SN process=changing-location (transporting), process attributes=safely + on-demand.

**SNF:** "safely and on demand transporting to a new location a traveler with light luggage."

NOT "fly the traveler" — flying is form-specific.

## SNF hierarchy (§7.3, line 3296)

SNF exists in a **hierarchy** — the specific function at one level becomes the SN intent at the next level down:

`deal-closing ← client-preference-learning ← client-meeting ← traveling ← flying`

The architect should understand **two levels up** before committing to a concept.

## Concept = SNF + form (Box 7.2, line 3136)

"Concept is a product or system vision … that maps function to form." Specialize the SN operand + SN process to concrete ones; add a specific instrument + attributes.

## Specialization catalog (Box 7.3, lines 3180–3214)

Operand specialization: completely different / process preserved / part-of / type-of / attribute-of / information-about.

Process specialization: different / type-of / attribute-added.

## Morphological matrix (§7.4, line 3338)

Unpack concepts into internal functions; rows = internal functions, columns = integrated concepts, cells = instrument choices. Combinatorial enumeration of the option space.

## Citations
- Ch 7 Box 7.1 (line 3048) — Principle of SNF.
- Ch 7 §7.2 (lines 3080–3090) — SNF procedure.
- Ch 7 Box 7.2 (line 3136) — concept definition.
- Ch 7 Box 7.3 (lines 3180–3214) — specialization catalog.
- Ch 7 Figure 7.4 (line 3162) — concept template.
- Ch 7 §7.4 — morphological matrix.

> See full text in plans/research/crawley-book-findings.md §Ch 7.
