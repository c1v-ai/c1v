# c1v Module 2 — SysML Activity Diagrams (Obsidian view)

> Inline Mermaid render of the 6 UCBD activity diagrams. Reading View (`Cmd+E`).

## UC01 — Generate Spec from Idea

> Source: `module-2-requirements/sysml/UC01-generate-spec-from-idea.activity.mmd`

```mermaid
%% UC01 — Generate Spec from One-Sentence Idea
%% Generated for c1v Module 2 (2026-04-20)
%% Source: system-design/module-2-requirements/ucbd/UC01-generate-spec-from-idea.ucbd.json
flowchart TB
  start(( )) --> A1

  subgraph Founder
    A1[Founder submits one-sentence idea]
    A6[Founder answers intake question]
    A21[Founder receives spec URL + commit hash]
  end

  subgraph "The System"
    A2[Authenticate Founder session]
    A3[Persist idea prompt to Project ID]
    A4[Initiate intake session]
    A5[Present first intake question]
    D1{Intake complete?}
    A7[Classify idea domain via LLM]
    A10[Assemble scope outline]
    A11[Draft tech-stack recommendations]
    A12[Invoke metric-traceback include UC08]
    A13[Assemble spec bundle]
    A14[Validate spec vs schema]
    A15[Enforce generation timeout]
    A16[Persist spec versioned draft]
    A17[Audit spec creation]
    A19[Notify Product Managers]
    A20[Return spec URL + commit]
  end

  subgraph "LLM Providers"
    A8[Return domain classification + confidence]
  end

  subgraph "Product Managers"
    A18[Receive spec-ready notification]
  end

  A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7 --> A8 --> D1
  D1 -->|No| A5
  D1 -->|Yes| A10 --> A11 --> A12 --> A13 --> A14 --> A15 --> A16 --> A17 --> A19 --> A18
  A17 --> A20 --> A21
  A19 --> A20
  A21 --> finish(((End)))

  R01[/"&lt;&lt;requirement&gt;&gt; UC01.R01<br/>authenticate Founder session before accepting idea prompt"/]
  R02[/"&lt;&lt;requirement&gt;&gt; UC01.R02<br/>persist submitted idea prompt with stable Project ID"/]
  R03[/"&lt;&lt;requirement&gt;&gt; UC01.R03<br/>initiate conversational intake session scoped to Project ID"/]
  R04[/"&lt;&lt;requirement&gt;&gt; UC01.R04<br/>present first intake question within FOUNDER_INTAKE_RESPONSE_BUDGET_MS"/]
  R05[/"&lt;&lt;requirement&gt;&gt; UC01.R05<br/>classify domain via LLM Provider with idea + answers"/]
  R06[/"&lt;&lt;requirement&gt;&gt; UC01.R06<br/>loop intake until INTAKE_COMPLETENESS_THRESHOLD"/]
  R07[/"&lt;&lt;requirement&gt;&gt; UC01.R07<br/>assemble initial scope outline from intake transcript"/]
  R08[/"&lt;&lt;requirement&gt;&gt; UC01.R08<br/>draft tech-stack recommendation for each subsystem"/]
  R09[/"&lt;&lt;requirement&gt;&gt; UC01.R09<br/>invoke metric-traceback for every recommendation"/]
  R10[/"&lt;&lt;requirement&gt;&gt; UC01.R10<br/>assemble spec bundle from scope + traced recs + constants"/]
  R11[/"&lt;&lt;requirement&gt;&gt; UC01.R11<br/>validate assembled spec against spec-shape schema"/]
  R12[/"&lt;&lt;requirement&gt;&gt; UC01.R12<br/>complete cycle within SPEC_GENERATION_TIMEOUT_SEC"/]
  R13[/"&lt;&lt;requirement&gt;&gt; UC01.R13<br/>persist validated spec with draft + commit hash"/]
  R14[/"&lt;&lt;requirement&gt;&gt; UC01.R14<br/>record audit entry for spec creation"/]
  R15[/"&lt;&lt;requirement&gt;&gt; UC01.R15<br/>notify assigned PMs that spec is ready"/]
  R16[/"&lt;&lt;requirement&gt;&gt; UC01.R16<br/>return persisted spec URL + commit hash"/]

  A2 -.-> R01
  A3 -.-> R02
  A4 -.-> R03
  A5 -.-> R04
  A7 -.-> R05
  D1 -.-> R06
  A10 -.-> R07
  A11 -.-> R08
  A12 -.-> R09
  A13 -.-> R10
  A14 -.-> R11
  A15 -.-> R12
  A16 -.-> R13
  A17 -.-> R14
  A19 -.-> R15
  A20 -.-> R16

  %% Initial conditions attach at start; ending conditions at finish.
  NS[/"Initial: Founder authenticated (CC.R01); empty project context; LLM Provider configured"/]
  NE[/"Ending: validated spec committed; 100% TRACEBACK_COVERAGE_PCT; PMs notified; Founder has URL + commit hash"/]
  start -.-> NS
  finish -.-> NE
```

## UC03 — Review Generated Spec

> Source: `module-2-requirements/sysml/UC03-review-generated-spec.activity.mmd`

```mermaid
%% UC03 — Review Generated Spec
%% Generated for c1v Module 2 (2026-04-20)
%% Source: system-design/module-2-requirements/ucbd/UC03-review-generated-spec.ucbd.json
flowchart TB
  start(( )) --> A1

  subgraph "Product Manager"
    A1[PM navigates to review queue]
    A5[PM selects a spec]
    A9[PM reads spec + drafts comments]
    A10[PM submits each review comment]
    A12[PM selects action]
  end

  subgraph "The System"
    A2[Authenticate PM session]
    A3[Enumerate draft specs for PM]
    A4[Render review queue sorted]
    A6[Verify review permission]
    A7[Load spec bundle at commit hash]
    A8[Render spec bundle reviewable]
    A11[Persist review comment]
    D1{Action?}
    A13[Validate revisions include comment]
    A14[Transition spec state]
    A15[Audit state transition]
    A17[Notify Founder of decision]
    A18[Gate CLI emission on approval]
    A20[Notify Engineering of approved spec]
  end

  subgraph "Founder"
    A16[Receive review decision + comments]
  end

  subgraph "Engineering Teams"
    A19[Receive approval notification]
  end

  A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7 --> A8 --> A9 --> A10 --> A11 --> A12 --> D1
  D1 -->|Approve| A14
  D1 -->|Reject| A14
  D1 -->|Request revisions| A13 --> A14
  A14 --> A15 --> A17 --> A16
  A15 --> A18
  A18 --> A20 --> A19
  A19 --> finish(((End)))
  A16 --> finish

  R01[/"&lt;&lt;requirement&gt;&gt; UC03.R01<br/>authenticate PM before exposing review queue"/]
  R02[/"&lt;&lt;requirement&gt;&gt; UC03.R02<br/>enumerate draft specs assigned to PM"/]
  R03[/"&lt;&lt;requirement&gt;&gt; UC03.R03<br/>render queue within REVIEW_QUEUE_LOAD_BUDGET_MS"/]
  R04[/"&lt;&lt;requirement&gt;&gt; UC03.R04<br/>verify PM holds review permission"/]
  R05[/"&lt;&lt;requirement&gt;&gt; UC03.R05<br/>load spec bundle at commit hash"/]
  R06[/"&lt;&lt;requirement&gt;&gt; UC03.R06<br/>render spec within SPEC_RENDER_BUDGET_MS"/]
  R07[/"&lt;&lt;requirement&gt;&gt; UC03.R07<br/>persist review comment with identity + anchor"/]
  R08[/"&lt;&lt;requirement&gt;&gt; UC03.R08<br/>validate request_revisions includes a comment"/]
  R09[/"&lt;&lt;requirement&gt;&gt; UC03.R09<br/>transition spec state within STATE_TRANSITION_BUDGET_MS"/]
  R10[/"&lt;&lt;requirement&gt;&gt; UC03.R10<br/>audit state transition with reviewer + states"/]
  R11[/"&lt;&lt;requirement&gt;&gt; UC03.R11<br/>notify Founder of decision + comments"/]
  R12[/"&lt;&lt;requirement&gt;&gt; UC03.R12<br/>enable CLI pipeline on approve; block otherwise"/]
  R13[/"&lt;&lt;requirement&gt;&gt; UC03.R13<br/>notify Engineering of approved status"/]

  A2 -.-> R01
  A3 -.-> R02
  A4 -.-> R03
  A6 -.-> R04
  A7 -.-> R05
  A8 -.-> R06
  A11 -.-> R07
  A13 -.-> R08
  A14 -.-> R09
  A15 -.-> R10
  A17 -.-> R11
  A18 -.-> R12
  A20 -.-> R13

  NS[/"Initial: draft spec exists; PM authenticated (CC.R01); PM holds review permission (CC.R03)"/]
  NE[/"Ending: spec state ∈ {approved, rejected, revisions_requested}; audit recorded; Founder notified; CLI gate set"/]
  start -.-> NS
  finish -.-> NE
```

## UC04 — Emit CLI Commands

> Source: `module-2-requirements/sysml/UC04-emit-cli-commands.activity.mmd`

```mermaid
%% UC04 — Emit CLI Commands from Spec
%% Generated for c1v Module 2 (2026-04-20)
%% Source: system-design/module-2-requirements/ucbd/UC04-emit-cli-commands.ucbd.json
flowchart TB
  start(( )) --> A1

  subgraph "Engineering Team Member"
    A1[Engineer requests CLI bundle]
    A19[Engineer receives bundle location + signature]
  end

  subgraph "The System"
    A2[Authenticate Engineer session]
    A3[Verify spec is approved]
    A4[Verify emit permission]
    A5[Load approved spec bundle]
    A6[Generate SKILL.md]
    A7[Generate CLAUDE.md]
    A8[Generate MCP tool defs]
    A9[Package CLI bundle]
    A10[Sign bundle with commit hash]
    A11[Enforce emission timeout]
    A13[Write bundle to VCS repo]
    A14[Deliver bundle to IDE/CLI]
    A16[Require receipt token]
    A17[Audit CLI emission]
    A18[Return bundle location + signature]
  end

  subgraph "Version Control"
    A12[Record committed bundle ref]
  end

  subgraph "IDE / CLI Client"
    A15[Acknowledge bundle receipt]
  end

  A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7 --> A8 --> A9 --> A10 --> A11 --> A13 --> A12
  A11 --> A14 --> A15 --> A16 --> A17 --> A18 --> A19 --> finish(((End)))
  A12 --> A17

  R01[/"&lt;&lt;requirement&gt;&gt; UC04.R01<br/>authenticate Engineer before emission"/]
  R02[/"&lt;&lt;requirement&gt;&gt; UC04.R02<br/>verify spec status = approved"/]
  R03[/"&lt;&lt;requirement&gt;&gt; UC04.R03<br/>verify Engineer holds emit permission"/]
  R04[/"&lt;&lt;requirement&gt;&gt; UC04.R04<br/>load spec bundle at commit hash"/]
  R05[/"&lt;&lt;requirement&gt;&gt; UC04.R05<br/>generate SKILL.md from agent sections"/]
  R06[/"&lt;&lt;requirement&gt;&gt; UC04.R06<br/>generate CLAUDE.md from conventions + arch"/]
  R07[/"&lt;&lt;requirement&gt;&gt; UC04.R07<br/>generate one MCP tool def per interface"/]
  R08[/"&lt;&lt;requirement&gt;&gt; UC04.R08<br/>package SKILL + CLAUDE + MCP into CLI bundle"/]
  R09[/"&lt;&lt;requirement&gt;&gt; UC04.R09<br/>sign bundle with commit hash + timestamp"/]
  R10[/"&lt;&lt;requirement&gt;&gt; UC04.R10<br/>complete within CLI_EMISSION_TIMEOUT_SEC"/]
  R11[/"&lt;&lt;requirement&gt;&gt; UC04.R11<br/>write signed bundle to spec VCS repo"/]
  R12[/"&lt;&lt;requirement&gt;&gt; UC04.R12<br/>deliver signed bundle to IDE/CLI client"/]
  R13[/"&lt;&lt;requirement&gt;&gt; UC04.R13<br/>require receipt token before delivered flag"/]
  R14[/"&lt;&lt;requirement&gt;&gt; UC04.R14<br/>audit emission with identity + commit + signature"/]
  R15[/"&lt;&lt;requirement&gt;&gt; UC04.R15<br/>return bundle location + signature + commit"/]

  A2 -.-> R01
  A3 -.-> R02
  A4 -.-> R03
  A5 -.-> R04
  A6 -.-> R05
  A7 -.-> R06
  A8 -.-> R07
  A9 -.-> R08
  A10 -.-> R09
  A11 -.-> R10
  A13 -.-> R11
  A14 -.-> R12
  A16 -.-> R13
  A17 -.-> R14
  A18 -.-> R15

  NS[/"Initial: approved spec exists; Engineer authenticated (CC.R01); IDE/CLI client registered"/]
  NE[/"Ending: signed bundle delivered + committed to VCS; audit recorded; Engineer holds location + signature"/]
  start -.-> NS
  finish -.-> NE
```

## UC06 — Recommend Design Improvements

> Source: `module-2-requirements/sysml/UC06-recommend-design-improvements.activity.mmd`

```mermaid
%% UC06 — Recommend Design Improvements
%% Generated for c1v Module 2 (2026-04-20)
%% Source: system-design/module-2-requirements/ucbd/UC06-recommend-design-improvements.ucbd.json
flowchart TB
  start(( )) --> A1

  subgraph "Observability Tools"
    A1[Stream availability + throughput + latency samples]
  end

  subgraph "The System"
    A2[Persist samples with source + monotonic ts]
    A3[Enforce customer overhead budget]
    A4[Aggregate on cadence over window]
    A5[Compare aggregate to spec targets]
    A6[Compute metric deviation]
    A7[Suppress sub-threshold deviations]
    A8[Query LLM for candidate improvements]
    A9[Link candidate to deviation + samples]
    A10[Rank by severity + LLM confidence]
    A11[Cap list at max recommendations]
    A12[Deliver ranked list to Engineer]
    A15[Notify PMs of cycle]
    A16[Audit recommendation cycle]
    A18[Persist Engineer action per rec]
    D2{Deviation implies missing feature?}
    A19[Surface feature candidate - extends UC07]
    A20[Refrain from write-back read-only]
  end

  subgraph "Engineering Team Member"
    A13[Receive recommendation list]
    A17[Select action per rec]
  end

  subgraph "Product Managers"
    A14[Receive cycle digest]
  end

  A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7 --> A8 --> A9 --> A10 --> A11 --> A12 --> A13
  A12 --> A15 --> A14
  A12 --> A16 --> A17 --> A18 --> D2
  D2 -->|Yes| A19 --> A20 --> finish(((End)))
  D2 -->|No| A20
  A20 --> finish

  R01[/"&lt;&lt;requirement&gt;&gt; UC06.R01<br/>persist every sample with source id + ingest ts"/]
  R02[/"&lt;&lt;requirement&gt;&gt; UC06.R02<br/>bound ingestion overhead to MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT"/]
  R03[/"&lt;&lt;requirement&gt;&gt; UC06.R03<br/>aggregate over AGGREGATION_WINDOW_MIN on RECOMMENDATION_CADENCE_MIN"/]
  R04[/"&lt;&lt;requirement&gt;&gt; UC06.R04<br/>compare aggregates vs spec performance targets"/]
  R05[/"&lt;&lt;requirement&gt;&gt; UC06.R05<br/>compute deviation for aggregates outside target"/]
  R06[/"&lt;&lt;requirement&gt;&gt; UC06.R06<br/>suppress deviations below DEVIATION_SUPPRESSION_THRESHOLD"/]
  R07[/"&lt;&lt;requirement&gt;&gt; UC06.R07<br/>query LLM to propose candidates per deviation"/]
  R08[/"&lt;&lt;requirement&gt;&gt; UC06.R08<br/>link each candidate to deviation + source samples"/]
  R09[/"&lt;&lt;requirement&gt;&gt; UC06.R09<br/>rank within RECOMMENDATION_LATENCY_SEC of start"/]
  R10[/"&lt;&lt;requirement&gt;&gt; UC06.R10<br/>cap list at MAX_RECOMMENDATIONS_PER_CYCLE"/]
  R11[/"&lt;&lt;requirement&gt;&gt; UC06.R11<br/>deliver ranked list to Engineer stream"/]
  R12[/"&lt;&lt;requirement&gt;&gt; UC06.R12<br/>notify subscribed PMs of cycle completion"/]
  R13[/"&lt;&lt;requirement&gt;&gt; UC06.R13<br/>audit cycle with window + counts + timestamp"/]
  R14[/"&lt;&lt;requirement&gt;&gt; UC06.R14<br/>persist Engineer action per recommendation"/]
  R15[/"&lt;&lt;requirement&gt;&gt; UC06.R15<br/>surface feature candidate on missing-fn deviation"/]
  R16[/"&lt;&lt;requirement&gt;&gt; UC06.R16<br/>refrain from writing back to customer system v1"/]

  A2 -.-> R01
  A3 -.-> R02
  A4 -.-> R03
  A5 -.-> R04
  A6 -.-> R05
  A7 -.-> R06
  A8 -.-> R07
  A9 -.-> R08
  A10 -.-> R09
  A11 -.-> R10
  A12 -.-> R11
  A15 -.-> R12
  A16 -.-> R13
  A18 -.-> R14
  A19 -.-> R15
  A20 -.-> R16

  NS[/"Initial: spec is live; UC11 read-only connection active; ingested samples over AGGREGATION_WINDOW_MIN; LLM configured"/]
  NE[/"Ending: ranked list delivered (cap); every rec linked to deviation; PMs notified; audit recorded; read-only posture preserved"/]
  start -.-> NS
  finish -.-> NE
```

## UC08 — Trace Tech Stack to Metric

> Source: `module-2-requirements/sysml/UC08-trace-tech-stack-to-metric.activity.mmd`

```mermaid
%% UC08 — Trace Tech-Stack Recommendation to Metric
%% Generated for c1v Module 2 (2026-04-20)
%% Source: system-design/module-2-requirements/ucbd/UC08-trace-tech-stack-to-metric.ucbd.json
flowchart TB
  start(( )) --> A1

  subgraph "The System"
    A1[Receive draft tech-stack recommendation]
    A2[Parse tech id + claimed capability]
    A3[Classify capability to metric class]
    A4[Query Documentation Sources]
    A6[Query Cloud Providers]
    A8[Resolve metric value from cited sources]
    A9[Validate external citation exists]
    A10[Compute traceback confidence]
    A11[Record traceback triple]
    D1{confidence &gt;= TRACEBACK_MIN_CONFIDENCE?}
    A12[Flag for human review]
    A14[Attach traceback to recommendation]
    D2{coverage &gt;= TRACEBACK_COVERAGE_PCT?}
    A15[Refuse spec emission below coverage]
    A16[Audit traceback event]
    A17[Return traced rec to caller]
  end

  subgraph "Documentation Sources"
    A5[Return vendor specs + RFCs + SLAs]
  end

  subgraph "Cloud Providers"
    A7[Return availability zones + baselines + SLAs]
  end

  subgraph "Engineering Team Member"
    A13[Review flagged rec + override or refine]
  end

  A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7 --> A8 --> A9 --> A10 --> A11 --> D1
  D1 -->|No| A12 --> A13 --> A11
  D1 -->|Yes| A14 --> D2
  D2 -->|No| A15 --> A16
  D2 -->|Yes| A16
  A16 --> A17 --> finish(((End)))

  R01[/"&lt;&lt;requirement&gt;&gt; UC08.R01<br/>receive draft rec with tech + capability"/]
  R02[/"&lt;&lt;requirement&gt;&gt; UC08.R02<br/>parse to extract tech id + capability"/]
  R03[/"&lt;&lt;requirement&gt;&gt; UC08.R03<br/>classify capability to {availability|throughput|latency}"/]
  R04[/"&lt;&lt;requirement&gt;&gt; UC08.R04<br/>query Documentation Sources for perf data"/]
  R05[/"&lt;&lt;requirement&gt;&gt; UC08.R05<br/>query Cloud Providers for baselines"/]
  R06[/"&lt;&lt;requirement&gt;&gt; UC08.R06<br/>resolve metric value using only cited sources"/]
  R07[/"&lt;&lt;requirement&gt;&gt; UC08.R07<br/>validate external citation supports capability"/]
  R08[/"&lt;&lt;requirement&gt;&gt; UC08.R08<br/>compute confidence score in [0.0, 1.0]"/]
  R09[/"&lt;&lt;requirement&gt;&gt; UC08.R09<br/>record traceback triple with cited_at"/]
  R10[/"&lt;&lt;requirement&gt;&gt; UC08.R10<br/>flag when confidence &lt; TRACEBACK_MIN_CONFIDENCE"/]
  R11[/"&lt;&lt;requirement&gt;&gt; UC08.R11<br/>attach triple when confidence meets threshold"/]
  R12[/"&lt;&lt;requirement&gt;&gt; UC08.R12<br/>refuse spec below TRACEBACK_COVERAGE_PCT"/]
  R13[/"&lt;&lt;requirement&gt;&gt; UC08.R13<br/>audit every traceback event"/]
  R14[/"&lt;&lt;requirement&gt;&gt; UC08.R14<br/>return traced rec within TRACEBACK_LATENCY_SEC"/]

  A1 -.-> R01
  A2 -.-> R02
  A3 -.-> R03
  A4 -.-> R04
  A6 -.-> R05
  A8 -.-> R06
  A9 -.-> R07
  A10 -.-> R08
  A11 -.-> R09
  A12 -.-> R10
  A14 -.-> R11
  A15 -.-> R12
  A16 -.-> R13
  A17 -.-> R14

  NS[/"Initial: draft rec exists; external sources authorized; metric vocab = {availability, throughput, latency}"/]
  NE[/"Ending: every rec linked to metric + cited source; below-threshold flagged; coverage gate enforced; audit recorded"/]
  start -.-> NS
  finish -.-> NE
```

## UC11 — Connect Existing Customer System

> Source: `module-2-requirements/sysml/UC11-connect-existing-customer-system.activity.mmd`

```mermaid
%% UC11 — Connect Existing Customer System
%% Generated for c1v Module 2 (2026-04-20)
%% Source: system-design/module-2-requirements/ucbd/UC11-connect-existing-customer-system.ucbd.json
flowchart TB
  start(( )) --> A1

  subgraph "Engineering Team Member"
    A1[Engineer provides VCS + observability + IdP config]
    A20[Engineer confirms measured overhead]
  end

  subgraph "The System"
    A2[Authenticate Engineer session]
    A3[Validate endpoints are well-formed + reachable]
    A4[Initiate OAuth/OIDC handshake with IdP]
    D1{Write scope grant?}
    Afail[Reject authorization]
    A7[Persist encrypted credential + expiry]
    A8[Establish read-only VCS handle]
    A10[Establish read-only observability handle]
    A12[Run connection-health probe all handles]
    A13[Measure overhead over baseline window]
    D2{overhead &lt;= MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT?}
    A14[Reject + surface overhead violation]
    A15[Persist connection record + non-invasive flag]
    A16[Schedule re-authorization]
    A17[Audit connection establishment]
    A18[Enforce connection budget]
    A19[Return connection id + overhead + status]
  end

  subgraph "Identity Provider"
    A5[Return credentialed token + scope grants]
  end

  subgraph "Version Control + Observability Tools"
    A9[VCS returns repo metadata + branches]
    A11[Observability returns telemetry catalog + schema]
  end

  A1 --> A2 --> A3 --> A4 --> A5 --> D1
  D1 -->|Yes| Afail --> finish(((End)))
  D1 -->|No| A7 --> A8 --> A9 --> A10 --> A11 --> A12 --> A13 --> D2
  D2 -->|No| A14 --> finish
  D2 -->|Yes| A15 --> A16 --> A17 --> A18 --> A19 --> A20 --> finish

  R01[/"&lt;&lt;requirement&gt;&gt; UC11.R01<br/>authenticate Engineer before accepting inputs"/]
  R02[/"&lt;&lt;requirement&gt;&gt; UC11.R02<br/>validate endpoints resolvable from egress"/]
  R03[/"&lt;&lt;requirement&gt;&gt; UC11.R03<br/>initiate OAuth/OIDC handshake with customer IdP"/]
  R04[/"&lt;&lt;requirement&gt;&gt; UC11.R04<br/>reject if scope contains write grant"/]
  R05[/"&lt;&lt;requirement&gt;&gt; UC11.R05<br/>persist credential encrypted with expiry"/]
  R06[/"&lt;&lt;requirement&gt;&gt; UC11.R06<br/>establish read-only VCS handle"/]
  R07[/"&lt;&lt;requirement&gt;&gt; UC11.R07<br/>establish read-only observability handle"/]
  R08[/"&lt;&lt;requirement&gt;&gt; UC11.R08<br/>probe health on all three handles"/]
  R09[/"&lt;&lt;requirement&gt;&gt; UC11.R09<br/>measure CPU/mem/net overhead baseline"/]
  R10[/"&lt;&lt;requirement&gt;&gt; UC11.R10<br/>reject on overhead violation"/]
  R11[/"&lt;&lt;requirement&gt;&gt; UC11.R11<br/>persist connection record with non-invasive flag"/]
  R12[/"&lt;&lt;requirement&gt;&gt; UC11.R12<br/>schedule reauthorization at CONNECTION_REAUTH_DAYS"/]
  R13[/"&lt;&lt;requirement&gt;&gt; UC11.R13<br/>audit connection establishment"/]
  R14[/"&lt;&lt;requirement&gt;&gt; UC11.R14<br/>complete within CONNECTION_ESTABLISHMENT_BUDGET_SEC"/]
  R15[/"&lt;&lt;requirement&gt;&gt; UC11.R15<br/>return id + overhead + status + reauth date"/]

  A2 -.-> R01
  A3 -.-> R02
  A4 -.-> R03
  D1 -.-> R04
  A7 -.-> R05
  A8 -.-> R06
  A10 -.-> R07
  A12 -.-> R08
  A13 -.-> R09
  A14 -.-> R10
  A15 -.-> R11
  A16 -.-> R12
  A17 -.-> R13
  A18 -.-> R14
  A19 -.-> R15

  NS[/"Initial: Engineer authenticated with org-admin; customer endpoints supplied; overhead budget configured"/]
  NE[/"Ending: read-only handles on VCS + observability + IdP; overhead within budget; connection persisted + audit + reauth scheduled"/]
  start -.-> NS
  finish -.-> NE
```
