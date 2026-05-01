# stash-5 audit — DO NOT APPLY

**Decision:** DROP. Tag preserved at `stash-backup-5-ta1-docs-wip` (origin + backup remotes) for forensics; never apply to main.

**Why:** This stash records a WIP from 2026-04-25 22:33 EDT on `wave-a/ta1-docs`. Replaying it deletes 105 files that are currently live on main — including canonical artifacts referenced in CLAUDE.md (verification reports for T3/T4a/T4b/T5/T6/T7/T9/T10/T11, `plans/research/crawley-book-findings.md`, `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`, etc.). The cleanup this stash was attempting landed on main via a different path.

**Audited:** 2026-04-29 by Bond during stash-recovery triage after reported merge of `wave-e/te1-integration` into main. (Side finding: that merge had not in fact happened — main HEAD at audit time was `a773d53 Merge PR #12 from c1v-ai/wave-c/tc1-m345-schemas`. See `plans/stash-recovery-audit.md` if/when written.)

**Tag SHA at audit time:** b422f6a1ccbe21ac41c8d3c13974e6729f0aff35
**Parent (base) SHA:** 5d7bf05ad0609d0f5f9efb43f5837f0b56354d8e
**Parent subject:** fix(ta1): EC-V21-A.0 preflight — audit + atlas-path doc + methodology canonical

---

## `git show stash-backup-5-ta1-docs-wip --stat`

```
commit b422f6a1ccbe21ac41c8d3c13974e6729f0aff35
Merge: 5d7bf05 4605aaa
Author: David Ancor <35901618+davidancor@users.noreply.github.com>
Date:   Sat Apr 25 22:33:38 2026 -0400

    WIP on wave-a/ta1-docs: 5d7bf05 fix(ta1): EC-V21-A.0 preflight — audit + atlas-path doc + methodology canonical

 .../synthesis/architecture_recommendation.html     |  264 +-
 .../architecture_recommendation.json-enriched.json |   50 +-
 .../synthesis/artifacts.manifest.jsonl             |    3 +
 apps/c1v-identity/CLAUDE.md                        |   28 +
 .../chat/__tests__/decision-question-card.test.tsx |    2 +-
 .../components/connections/ide-accordion.tsx       |    2 +-
 .../sections/problem-statement-section.tsx         |   20 +
 apps/product-helper/lib/db/schema.ts               |   18 +
 apps/product-helper/lib/db/schema/atlas-entries.ts |    8 +-
 .../schemas/atlas/__tests__/entry.test.ts          |   44 +
 .../lib/langchain/schemas/atlas/priors.ts          |    3 +-
 .../generated/atlas/availability-prior.schema.json |    5 +-
 .../schemas/generated/atlas/citation.schema.json   |    5 +-
 .../atlas/company-atlas-entry.schema.json          |   30 +-
 .../schemas/generated/atlas/cost-curve.schema.json |    5 +-
 .../generated/atlas/latency-prior.schema.json      |    5 +-
 .../generated/atlas/throughput-prior.schema.json   |    5 +-
 .../phase-19-empirical-prior-binding.schema.json   |    2 +-
 .../interface-specs-v1.schema.json                 |    2 +-
 .../module-4/phase-19-empirical-prior-binding.ts   |    2 +-
 .../schemas/module-7-interfaces/formal-specs.ts    |    2 +-
 apps/product-helper/lib/mcp/claude-md-generator.ts |    2 +-
 apps/product-helper/lib/mcp/skill-generator.ts     |    2 +-
 apps/product-helper/package.json                   |    6 +-
 plans/m2-folder-2-schema-az-sweep.md               |  397 ---
 .../02-gate-b-diff-report.md                       |   65 -
 plans/m3-folder-3-ffbd-schema-az-sweep.md          |  377 ---
 .../01-phase-inventory.md                          |  199 --
 plans/post-v2.1-followups.md                       |   31 +
 plans/research/crawley-book-findings.md            |  646 ----
 .../post-renumber-residual.md                      |   26 -
 .../pre-renumber-ref-audit.md                      |   35 -
 plans/t10-outputs/legacy-archival-log.md           |   84 -
 plans/t10-outputs/migration-report.md              |  136 -
 plans/t10-outputs/new-generators-spec.md           |  147 -
 plans/t10-outputs/runtime-integration-diagram.md   |  109 -
 plans/t10-outputs/verification-report.md           |  220 --
 plans/t11-outputs/verification-report.md           |   59 -
 plans/t3-outputs/verification-report.md            |   60 -
 plans/t4a-outputs/verification-report.md           |   65 -
 plans/t4b-outputs/verification-report.md           |  117 -
 plans/t5-outputs/verification-report.md            |  111 -
 plans/t6-outputs/smoke-report.md                   |   99 -
 plans/t6-outputs/verification-report.md            |  114 -
 plans/t7-outputs/verification-report.md            |   87 -
 plans/t9-outputs/patcher-manifest.md               |   70 -
 plans/t9-outputs/structurer-diff.md                |  243 --
 plans/t9-outputs/verification-report.md            |  185 --
 plans/team-spawn-prompts-v2.1.md                   |  113 +-
 plans/v2-release-notes.md                          |    2 +-
 pnpm-lock.yaml                                     |   58 +
 system-design/kb-upgrade-v2/DIAGRAMS-INDEX.md      |   46 -
 .../kb-upgrade-v2/METHODOLOGY-CORRECTION.md        |  868 ------
 system-design/kb-upgrade-v2/MODULE-DATA-FLOW.md    |  194 --
 .../module-1-defining-scope/data_flows.v1.json     |  318 --
 .../module-2-requirements/M2-sysml-diagrams.md     |  532 ----
 .../constants-diff-v2-to-v2.1.md                   |   83 -
 .../module-2-requirements/constants.v2.json        |  318 --
 .../module-2-requirements/constants_table.json     |  587 ----
 .../module-2-requirements/decision_audit.jsonl     |   28 -
 .../module-2-requirements/diagrams/c1v_UCBDs.pptx  |  Bin 63324 -> 0 bytes
 .../module-2-requirements/ffbd-handoff.json        |  296 --
 .../module_2_final_review.json                     |  138 -
 .../module-2-requirements/nfr-diff-v2-to-v2.1.md   |   92 -
 .../module-2-requirements/nfrs.v2.json             |  273 --
 .../module-2-requirements/open_questions.json      |  445 ---
 .../module-2-requirements/open_questions.md        |  450 ---
 .../module-2-requirements/requirements_table.json  | 1023 -------
 .../UC01-generate-spec-from-idea.activity.mmd      |   85 -
 .../sysml/UC03-review-generated-spec.activity.mmd  |   81 -
 .../sysml/UC04-emit-cli-commands.activity.mmd      |   77 -
 ...UC06-recommend-design-improvements.activity.mmd |   84 -
 .../UC08-trace-tech-stack-to-metric.activity.mmd   |   78 -
 ...1-connect-existing-customer-system.activity.mmd |   82 -
 .../sysml/activity_diagram_manifest.json           |   69 -
 .../ucbd/UC01-generate-spec-from-idea.ucbd.json    |  221 --
 .../ucbd/UC03-review-generated-spec.ucbd.json      |  214 --
 .../ucbd/UC04-emit-cli-commands.ucbd.json          |  206 --
 .../UC06-recommend-design-improvements.ucbd.json   |  219 --
 .../ucbd/UC08-trace-tech-stack-to-metric.ucbd.json |  195 --
 ...UC11-connect-existing-customer-system.ucbd.json |  213 --
 .../module-2-requirements/use_case_priority.json   |  262 --
 .../module-2-requirements/v2_revised/m2_delta.json |  288 --
 .../module-2-requirements/v2_revised/m2_delta.md   |  106 -
 .../kb-upgrade-v2/module-3-ffbd/ffbd.v1.json       |  196 --
 .../decision_network.v1.json                       | 3136 --------------------
 .../v2_revised/tier_2_subsystem_matrices.json      | 1067 -------
 .../kb-upgrade-v2/module-5-formfunction/README.md  |   23 -
 .../form_function_map.v1.json                      |  425 ---
 .../kb-upgrade-v2/module-6-qfd/M5-summary.md       |  150 -
 .../kb-upgrade-v2/module-6-qfd/WRITTEN-ANSWERS.md  |  136 -
 .../kb-upgrade-v2/module-6-qfd/c1v_QFD-backup.xlsx |  Bin 108708 -> 0 bytes
 .../kb-upgrade-v2/module-6-qfd/c1v_QFD.json        |  839 ------
 .../kb-upgrade-v2/module-6-qfd/c1v_QFD.xlsx        |  Bin 110300 -> 0 bytes
 .../kb-upgrade-v2/module-6-qfd/final_report.md     |  156 -
 .../module-6-qfd/interfaces_handoff.json           |  136 -
 .../module-6-qfd/v2_revised/c1v_QFD_v2.json        |  494 ---
 .../module-6-qfd/validation_report.json            |  120 -
 .../module-6-qfd/write_xlsx.applescript            |  273 --
 .../kb-upgrade-v2/module-6-qfd/write_xlsx.py       |  136 -
 .../module-7-interfaces/data_flow_diagram.mmd      |  129 -
 .../module-7-interfaces/data_flow_diagram.pptx     |  Bin 37122 -> 0 bytes
 .../module-7-interfaces/final_report.md            |  237 --
 .../generate_interface_matrix.py                   |   57 -
 .../module-7-interfaces/generate_n2.py             |   60 -
 .../module-7-interfaces/generate_pptx.py           | 1197 --------
 .../module-7-interfaces/interface_matrix.json      |  261 --
 .../module-7-interfaces/interface_matrix.xlsx      |  Bin 32121 -> 0 bytes
 .../module-7-interfaces/interface_specs.v1.json    |  659 ----
 .../module-7-interfaces/n2_chart.json              |  160 -
 .../module-7-interfaces/n2_chart.pptx              |  Bin 39018 -> 0 bytes
 .../module-7-interfaces/n2_chart.xlsx              |  Bin 12198 -> 0 bytes
 .../module-7-interfaces/n2_matrix.v1.json          |  120 -
 .../module-7-interfaces/risk_handoff.json          |  184 --
 .../module-7-interfaces/sequence_diagrams.mmd      |  162 -
 .../module-7-interfaces/sequence_diagrams.pptx     |  Bin 43838 -> 0 bytes
 .../module-7-interfaces/validation_report.json     |  111 -
 .../module-8-risk/diagrams/stoplight_diagrams.mmd  |   23 -
 .../kb-upgrade-v2/module-8-risk/final_report.md    |  175 --
 .../kb-upgrade-v2/module-8-risk/fmea_early.v1.json |  202 --
 .../module-8-risk/fmea_residual.v1.json            |  457 ---
 .../module-8-risk/fmea_residual.v1.xlsx            |  Bin 14410 -> 0 bytes
 .../kb-upgrade-v2/module-8-risk/fmea_table.json    |  314 --
 .../kb-upgrade-v2/module-8-risk/fmea_table.xlsx    |  Bin 19497 -> 0 bytes
 .../module-8-risk/generate_fmea_xlsx.py            |  143 -
 .../module-8-risk/generate_stoplights.py           |   81 -
 .../module-8-risk/open_questions_resolved.json     |   99 -
 .../module-8-risk/phase_0_context.json             |  158 -
 .../kb-upgrade-v2/module-8-risk/rating_scales.json |  104 -
 .../module-8-risk/renders/stoplight_after.png      |  Bin 51112 -> 0 bytes
 .../module-8-risk/renders/stoplight_before.png     |  Bin 55560 -> 0 bytes
 .../module-8-risk/stoplight_charts.json            |   71 -
 .../module-8-risk/validation_report.json           |  128 -
 133 files changed, 498 insertions(+), 24622 deletions(-)
```
