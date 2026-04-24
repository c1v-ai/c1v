# FMEA Builder -- LLM Master Instruction Set

## Purpose

This instruction set guides an LLM through building a complete Failure Mode and Effects Analysis (FMEA) spreadsheet for any system. The output matches the quality and structure of a Cornell CESYS527 FMEA deliverable.

## Authoritative Sources (Read First)

| File | Role |
|------|------|
| `tool-steps-to-build-FMEA.json` | **Authoritative course checklist** — machine-readable transcription of the 14-step CESYS527 build sequence. If this JSON and a phase file disagree on mechanics, the JSON wins. |
| `tool-steps-to-build-FMEA.md` | Human-readable mirror of the course checklist. |
| `FMEA-sample.json` | **Canonical worked example** — the IR Sensor Encoder FMEA from CESYS527, with full rating scales, cause rows, corrective actions, and three stoplight charts. Use to calibrate output quality and format. |
| `01-Reference-Sample-and-Templates.md` | Human-readable sample templates plus an additional software-domain worked example (E-Commerce Platform) showing the same pattern applied to a software system. |

## How to Use

1. **Run each phase in order.** Each phase depends on the output of the previous one.
2. **Check for upstream module artifacts first.** Phase 0 can leverage outputs from Module 4 (Decision Matrix), Module 5 (QFD), and Module 6 (Interfaces) if available. These are optional but significantly improve the FMEA. See `02-Phase-0-Prerequisites.md` for details.
3. **Stop at every STOP GAP.** Present your output to the user and wait for explicit confirmation before proceeding. Do NOT continue to the next phase until the user says to proceed.
4. **Output in the specified table format.** Every phase specifies exact column headers. Use markdown tables during the conversation; the final deliverable will be assembled into a spreadsheet.
5. **Accumulate columns.** Each phase adds columns to the same master table. Never drop columns from earlier phases.
6. **Reference the canonical sample.** `FMEA-sample.json` is the course-provided IR Sensor Encoder example. `01-Reference-Sample-and-Templates.md` provides an additional E-Commerce Platform worked example showing the same pattern in a software domain.

## Phase Sequence

| Phase | File | What It Produces | Stop Gaps |
|-------|------|-----------------|-----------|
| 0 | `02-Phase-0-Prerequisites.md` | System context summary, subsystem list | 1 |
| 1 | `03-Phase-1-Failure-Modes.md` | Failure Mode column populated | 1 |
| 2 | `04-Phase-2-Failure-Effects.md` | Failure Effects column populated | 1 |
| 3 | `05-Phase-3-Possible-Causes.md` | Possible Cause column populated (one row per cause) | 1 |
| 4 | `06-Phase-4-Rating-Systems-and-RPN.md` | Severity, Likelihood, RPN, Risk Criticality columns | 4 |
| 5 | `07-Phase-5-Corrective-Actions.md` | Corrective Action column + F.# identifiers | 1 |
| 6 | `08-Phase-6-Adjusted-Ratings-and-Stoplights.md` | Adjusted columns, effort, two stoplight charts | 1 |
| 7 | `09-Phase-7-Detectability-Optional.md` | Detectability rating + Troubleshooting column | 1 |

## Final FMEA Column Order (Left to Right)

When complete, the FMEA spreadsheet contains these columns:

```
| Failure Mode # | Subsystem | Failure Mode | Failure Effects | Possible Cause |
  Severity | Likelihood | RPN | Risk Criticality |
  Corrective Action |
  Adj. Severity | Adj. Likelihood | Adj. RPN | Adj. Criticality |
  Corrective Action Effort |
  Detectability (optional) | Troubleshooting (optional) |
```

## Final Output Checklist

Before declaring the FMEA complete, verify ALL of the following:

- [ ] System design is advanced enough to analyze subsystems
- [ ] All important failure modes listed per subsystem
- [ ] All possible effects listed per failure mode
- [ ] All possible causes listed per effect (each cause on its own row)
- [ ] Severity rating system defined with non-overlapping conditions
- [ ] Likelihood rating system defined with non-overlapping conditions
- [ ] Severity assigned to every cause row
- [ ] Likelihood assigned to every cause row
- [ ] RPN Definition matrix created with color-coded criticality ranges
- [ ] RPN calculated for every cause row (= Severity x Likelihood)
- [ ] Risk Criticality category assigned to every cause row
- [ ] Corrective actions written for all HIGH and MEDIUM-HIGH risk items
- [ ] Unique failure mode identifiers assigned (F.1, F.2, ...)
- [ ] Adjusted Severity, Likelihood, RPN, and Criticality columns completed
- [ ] Corrective Action Effort estimated for each action
- [ ] Before-corrective-actions stoplight chart created
- [ ] After-corrective-actions stoplight chart created
- [ ] (Optional) Detectability ratings added
- [ ] (Optional) Troubleshooting column added for remaining failure causes
