---
source: "Crawley 2015, System Architecture"
chapter: 7
section: "Ch 7 §§7.1–7.4"
relevance_to_kb: "Solution-Neutral Function (SNF) procedure and concept template (Figure 7.4) — how KB-5 converts a need statement into a concept without prematurely fixing form."
word_count: 490
---

# Crawley Ch 7 — Solution-Neutral Function and Concepts

A **solution-neutral function (SNF)** is a statement of intent expressed as *operand + process + attributes* with no mention of form or specific solutions. "Move fluid" is SNF; "centrifugal pump" is concept.

## Principle of Solution-Neutral Function (Box 7.1, line 3048)

"Poor system specifications frequently contain clues about an intended solution, function, or form, and these clues may lead the architect to a narrower set of potential options. Use solution-neutral functions where possible, and use the hierarchy of solution-neutral statements to scope how broad an exploration of the problem is to be undertaken."

## SNF identification procedure (§7.2, lines 3080–3090)

1. Consider the beneficiary.
2. Identify the need you are trying to fill.
3. Identify the solution-neutral operand whose state change yields benefit.
4. Identify the benefit-related attribute of that operand.
5. Optionally identify other relevant attributes.
6. Define the solution-neutral process that changes the benefit-related attribute.
7. Optionally identify attributes of the process.

## Worked example — transportation service (Table 7.2)

- Beneficiary = traveler
- Need = visit client in another city
- SN operand = traveler
- Benefit attribute = location
- Other attributes = alone + light luggage
- SN process = changing (transporting)
- Process attributes = safely + on demand

**SNF summary:** "safely and on demand transporting to a new location a traveler with light luggage."

NOT "fly the traveler" — flying is form-specific.

## Concept template (Figure 7.4, line 3162)

- **Intent column** (SNF)
- **Function column** (specific operand + specific process + attributes)
- **Form column** (specific instrument + attributes)

The five key ideas (thicker borders in Figure 7.4): specific operand, specific process, specific instrument, and their attributes.

## Specialization catalog (Box 7.3, lines 3180–3214)

**Operand specialization:**
- (a) Completely different (entertain-person → watch-DVD)
- (b) Process preserved (choose-leader → choose-president)
- (c) Part-of (open-bottle → remove-cork)
- (d) Type-of (move-fluid → pressurize-water)
- (e) Attribute-of (amplify-signal → increase-voltage)
- (f) Information-about (evacuate-people → inform-task-knowledge)

**Process specialization:**
- (a) Different process (shelter → house)
- (b) Type of process (transport → fly)
- (c) Attribute added (power → power-electrically)

## Morphological matrix (§7.4, line 3338)

Unpack rich concepts into internal functions; each internal function gets a concept fragment (instrument + process). Rows = internal functions, columns = integrated concepts, cells = instrument choices. Combinatorial enumeration of the option space.

- Car = wheels-wheels-wheels (lift-propel-guide)
- Train = wheels-wheels-ground
- Helicopter = propeller-propeller-propeller

## SNF hierarchy (§7.3, line 3296)

SNF exists in a hierarchy — specific function at one level becomes SN intent at the next level down. "Deal-closing → client-preference-learning → client-meeting → travel → fly." The architect should understand **two levels up**.

## KB-5 operational consequence

The SNF procedure is how intake refuses to prematurely over-specify form; the concept template (Figure 7.4) is the schema that KB-5 emits.

## Citations
- Ch 7 Box 7.1 (line 3048) — Principle of SNF.
- Ch 7 §7.2 (lines 3080–3090) — SNF identification procedure.
- Ch 7 Table 7.2 — worked SNF for transportation.
- Ch 7 Box 7.2 (line 3136) — concept definition.
- Ch 7 Box 7.3 (lines 3180–3214) — specialization catalog.
- Ch 7 Figure 7.4 (line 3162) — concept template.
- Ch 7 §7.4 — morphological matrix.

> See full text in plans/research/crawley-book-findings.md §Ch 7.
