# Module 6: Defining Interfaces — Knowledge Base Review & Improvement Plan

## Session Handoff — Created 2026-04-13

### What Was Completed in Prior Session

Modules 4 (Decision Matrix) and 5 (QFD) knowledge bases were fully reviewed and improved:
- Module 4: Restructured all 14 files with Prerequisites/Instructions/Worked Example (laptop)/STOP-GAP pattern, created GLOSSARY.md, aligned normalization naming, removed stray files
- Module 5: Fixed CESYS525 refs, typos, criterion naming, completed Phase 6 example, added nav links
- Created bridge file `17 - From Decision Matrix to QFD.md` connecting both modules
- All files now follow consistent LLM-ready structure

### Current State of Module 6

**Location:** `/Users/davidancor/Documents/MBA/System Design - eCornell/6 - Defining Interfaces/define-interface-LLM-kb/`

**Raw source files (need conversion to structured MD):**

| File | Content | Topic |
|------|---------|-------|
| `Module 1.txt` | Module outline + intro paragraph | Table of contents |
| `M1_01.txt` | Lecture transcript | Interfaces between subsystems, why they matter |
| `M1_02.txt` | Lecture transcript | Interfaces as failure points |
| `M1_03 (1).txt` | Lecture transcript | Data Flow Diagrams (DFD) — brainstorming interfaces |
| `M1_04.txt` | Lecture transcript | N-Squared (N²) Charts — formalizing interface definitions |
| `M1_05.txt` | Lecture transcript | CRC cards — teasing out interfaces through team activity |
| `M1_06.txt` | Lecture transcript | Sequence diagrams — describing interactions over time |
| `M1_07.txt` | Lecture transcript | Advanced sequence diagram notation (logic, self-calls, specs) |
| `M2 -Step 1 - creating an interface matrix.txt` | Lecture transcript | Creating the Interface Matrix (the big Excel file) |
| `M2 - Step 2 - adding values...txt` | Lecture transcript | Adding values and units to the matrix |
| `M2 -Step 3 - Building Consensus...txt` | Lecture transcript | Interface Champion role, cross-team consensus |
| `M2 - Step 4 - Enhancements...txt` | Lecture transcript | Matrix enhancements (snapshot views, etc.) |

**Reference/template artifacts:**

| File | Type | Purpose |
|------|------|---------|
| `Data-flow-diagram-instructions.pdf` | PDF | Cornell DFD instructions |
| `Data-flow-diagram.pdf` | PDF | DFD reference/sample |
| `Data-flow-diagram.pptx` | PPTX | DFD template |
| `n-squared-chart.xlsx` | XLSX | N² chart sample/template |
| `sequence-diagram-sample-template.pptx` | PPTX | Sequence diagram template |
| `sequence-diagram.pptx` | PPTX | Sequence diagram sample |
| `interface-Matrix-Template.xlsx` | XLSX | **Blank Interface Matrix template** |
| `Interface-matrix-sample-basic.xlsx` | XLSX | Basic filled sample |
| `Interface-Matrix-Sample_Advanced.xlsx` | XLSX | Advanced filled sample |
| `Steps-to-Build-Interface-Matrix.pdf` | PDF | Step-by-step matrix guide |
| `Defining Interfaces - Determine Your Subsystems.docx` | DOCX | Subsystem identification activity |
| `Share Information with Other Subsystem Teams.docx` | DOCX | Cross-team sharing activity |
| `Managing Interface Specifications.docx` | DOCX | Specification management guide |

**Python scripts (THG project-specific artifact generators):**

| Script | Lines | Output | Purpose |
|--------|-------|--------|---------|
| `create_dfd_thg_v2.py` | 362 | PPTX | Generates THG Data Flow Diagram (7 subsystems, 25 interfaces) |
| `create_n2_chart.py` | 502 | XLSX | Generates THG N² Interface Chart (7 subsystems) |
| `create_sequence_thg.py` | 1383 | PPTX | Generates THG Sequence Diagrams (8 slides, use cases) |

---

## Improvement Plan

### Phase 1: Convert Raw Transcripts to Structured MD Files

Convert the 12 TXT lecture transcripts into structured MD files matching the Module 4/5 pattern. Proposed file structure:

```
00 - Module Overview.md                    ← from Module 1.txt
01 - Why Interfaces Matter.md              ← from M1_01 + M1_02
02 - Defining Subsystems.md                ← from subsystem docx + transcript context
03 - Brainstorming with Data Flow Diagrams.md  ← from M1_03
04 - Formalizing with N-Squared Charts.md  ← from M1_04
05 - CRC Cards for Team Discovery.md      ← from M1_05
06 - Sequence Diagrams - Describing Interactions.md  ← from M1_06
07 - Advanced Sequence Diagram Notation.md ← from M1_07
08 - Creating the Interface Matrix.md      ← from M2 Step 1
09 - Adding Values and Units.md            ← from M2 Step 2
10 - Building Consensus with an Interface Champion.md  ← from M2 Step 3
11 - Interface Matrix Enhancements.md      ← from M2 Step 4
GLOSSARY.md
```

Each file gets: Prerequisites, Context, Instructions (imperative), Worked Example, STOP-GAP Checklist, Output Artifact, Handoff.

### Phase 2: Thread a Worked Example

**Key decision needed:** Choose a worked example to thread across all files. Options:
- A) Use the THG (heat safety) system from the Python scripts — already has 7 subsystems, 25 interfaces
- B) Use a simpler generic system (e.g., an e-commerce platform with 5 subsystems)
- C) Ask user which project to use

The THG system is the most developed (Python scripts already generate all 3 diagrams), but may be too complex for a teaching example.

### Phase 3: Build-Up Arc to the Interface Matrix

The user emphasized the **Interface Matrix is the final artifact**. The knowledge base should be structured as a build-up:

```
Subsystem Definition
    ↓
DFD (brainstorm interfaces — discover WHAT connects)
    ↓
N² Chart (formalize interfaces — WHO sends WHAT to WHOM)
    ↓
Sequence Diagrams (detail interactions — WHEN and HOW)
    ↓
Interface Matrix (the master specification — VALUES, UNITS, OWNERS, CONSENSUS)
```

Each intermediate artifact (DFD, N², Sequence) feeds information into the Interface Matrix. The MD files should make this progression explicit.

### Phase 4: Python Script Review

Review the 3 Python scripts for:
- Code quality and correctness
- Consistency with the knowledge base terminology
- Whether they produce artifacts that match the Cornell templates
- Whether a 4th script is needed: `create_interface_matrix.py` to generate the final Interface Matrix Excel

### Phase 5: Create Transition Bridge

Add a bridge from Module 5 (QFD) → Module 6 (Interfaces):
- QFD's Engineering Characteristics map to subsystem capabilities
- QFD's roof (EC-to-EC trade-offs) hints at interface dependencies
- The Interface Matrix operationalizes the interactions that the QFD summarized abstractly

### Phase 6: Quality Polish

Same fixes applied to Modules 4/5:
- Remove any remaining CESYS526 references
- Add Previous/Next navigation links
- Ensure consistent terminology
- Cross-reference the GLOSSARY

---

## Key Questions for User at Session Start

1. **Worked example:** Thread the THG system from the Python scripts, or use something simpler?
2. **Python scripts:** Review/improve the existing 3, and/or create a 4th for the Interface Matrix?
3. **Scope:** Full restructure (like Module 4) or lighter touch (like Module 5 polish)?
4. **PDF/DOCX content:** Should the PDFs and DOCX files be read and integrated into the MD files, or treated as separate reference downloads?

---

## Files to Read First in Next Session

Start by reading these to understand the full content:
1. All 12 TXT files (transcripts) — the raw content to restructure
2. `Steps-to-Build-Interface-Matrix.pdf` — the step-by-step guide for the final artifact
3. The 3 Python scripts — understand the THG system's subsystems and interfaces
4. `Interface-Matrix-Sample_Advanced.xlsx` — understand the target output format
