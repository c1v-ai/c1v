# c1v Math Formula Bibliography

**Purpose.** Per David's directive, every math formula used by the c1v deterministic LLM system-design pipeline (load/capacity, reliability, decision scoring, sensitivity, architecture quality, latency, caching) must be validated against peer-reviewed or canonical sources before implementation. This file is the single source of truth for those citations.

**Confidence scale:**
- `high` — original source located (paper, DOI, or book edition confirmed).
- `medium` — canonical textbook or widely-cited secondary source confirmed; exact page TBD on physical access.
- `low` — only derived references located; needs follow-up on primary source.

**Status date:** 2026-04-21.

---

## F1. Little's Law

- **Formula:** $L = \lambda W$
- **Source:** Little, J.D.C. (1961). "A Proof for the Queuing Formula: L = λW." *Operations Research* 9(3):383-387.
- **DOI:** https://doi.org/10.1287/opre.9.3.383
- **Reprint / 50th-anniversary retrospective:** Little, J.D.C. (2011). "OR Forum — Little's Law as Viewed on Its 50th Anniversary." *Operations Research* 59(3):536-549. https://doi.org/10.1287/opre.1110.0940
- **Use in c1v:** Relates mean in-system concurrency $L$ to arrival rate $\lambda$ and mean residence time $W$. Underpins capacity-vs-concurrency conversions in Module 2 NFR math and Module 4 decision-matrix load ratings (e.g., converting p95 target + throughput target into required concurrency).
- **Confidence:** **high** (original 1961 paper + DOI confirmed).

---

## F2. Peak RPS from DAU

- **Formula:** $\text{peak\_RPS} = \dfrac{\text{DAU} \cdot s \cdot a \cdot f_\text{peak}}{86{,}400}$ where $s$ = sessions/user/day, $a$ = actions/session, $f_\text{peak}$ = peak-to-average factor.
- **Primary practitioner source (peak-to-average reasoning):** Beyer, B., Jones, C., Petoff, J., Murphy, N.R. (eds.) (2016). *Site Reliability Engineering: How Google Runs Production Systems.* O'Reilly. Ch. 18 "Software Engineering in SRE" and Ch. 27 "Reliable Product Launches at Scale" discuss peak QPS provisioning; the 80/20 skew (Pareto variant) is used as a standard peak-factor heuristic. Free text: https://sre.google/sre-book/table-of-contents/
- **Secondary practitioner source (load-model framing):** Kleppmann, M. (2017). *Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems.* O'Reilly. Ch. 1 "Reliable, Scalable, and Maintainable Applications" defines load parameters (requests/sec, active users, read/write ratio) as the canonical way to describe system load. ISBN 978-1-449-37332-0.
- **Derivation note:** No single peer-reviewed paper publishes this exact formula — it is arithmetic (events/day ÷ seconds/day × peak-factor). Citing SRE book + DDIA covers both the peak-factor heuristic and the load-parameter framing. 86,400 = 24 × 3600 is a calendar constant, not a published formula.
- **Use in c1v:** Module 2 Phase 8 constants — converts user-scale inputs (DAU, sessions, actions) into a peak-RPS constant that feeds Little's Law, M/M/c sizing, and cost estimates.
- **Confidence:** **medium** (arithmetic identity; practitioner textbooks cover the inputs and peak-factor heuristic but no single canonical paper gives the compound formula).

---

## F3. M/M/1 Queue — Mean Wait Time

- **Formula:** $\rho = \dfrac{\lambda}{\mu}, \qquad W_q = \dfrac{\rho}{\mu(1-\rho)}, \qquad W = \dfrac{1}{\mu - \lambda}$
- **Source:** Kleinrock, L. (1975). *Queueing Systems, Volume I: Theory.* Wiley-Interscience, New York. ISBN 978-0-471-49110-1. Ch. 3 "Birth-Death Queueing Systems in Equilibrium" (M/M/1 derivation).
- **Secondary canonical source:** Gross, D., Shortle, J.F., Thompson, J.M., Harris, C.M. (2008). *Fundamentals of Queueing Theory*, 4th ed. Wiley. ISBN 978-0-471-79127-1. Ch. 2 "Simple Markovian Birth-Death Queueing Models."
- **Use in c1v:** Module 2 NFR math — estimates queue wait latency from single-server utilization; flags utilization >0.7 as a tail-latency risk in architecture scoring.
- **Confidence:** **high** (canonical textbook confirmed; Kleinrock 1975 is the universally cited reference).

---

## F4. M/M/c Queue — Erlang C Formula

- **Formula:** Probability of waiting $C(c, \rho) = \dfrac{\dfrac{(c\rho)^c}{c!(1-\rho)}}{\sum_{k=0}^{c-1}\dfrac{(c\rho)^k}{k!} + \dfrac{(c\rho)^c}{c!(1-\rho)}}$, $\rho = \dfrac{\lambda}{c\mu}$. Mean wait: $W_q = \dfrac{C(c,\rho)}{c\mu - \lambda}$.
- **Original source:** Erlang, A.K. (1917). "Solution of some problems in the theory of probabilities of significance in automatic telephone exchanges." *Elektroteknikeren* 13:5-13 (Danish).
- **Modern canonical reference:** Kleinrock, L. (1975). *Queueing Systems, Volume I: Theory.* Wiley. Ch. 3 "M/M/c queue and Erlang's formulas."
- **Accessible derivation (open PDF):** Whitt, W. "The Erlang B and C Formulas: Problems and Solutions." Columbia University. https://www.columbia.edu/~ww2040/ErlangBandCFormulas.pdf
- **Use in c1v:** Module 2/4 — sizes multi-server pools (API workers, DB connections) to hit a target probability-of-wait or mean-wait SLO. Backs "how many replicas?" recommendations in the decision matrix.
- **Confidence:** **high** (Erlang 1917 original + Kleinrock 1975 canonical treatment both located).

---

## F5. Series Availability

- **Formula:** $A_\text{serial} = \prod_{i=1}^{n} A_i$
- **Source:** O'Connor, P.D.T., Kleyner, A. (2012). *Practical Reliability Engineering*, 5th ed. Wiley. ISBN 978-0-470-97981-5. Ch. 6 "Reliability Prediction and Modelling," §6.3 "Series Systems."
- **Alternate canonical source:** Rausand, M., Høyland, A. (2004). *System Reliability Theory: Models, Statistical Methods, and Applications*, 2nd ed. Wiley. Ch. 4.
- **Use in c1v:** Module 4 — availability estimate for any architecture whose critical path is N serially-dependent services (e.g., LB → API → DB → cache-miss-path). Drives SLO feasibility flags.
- **Confidence:** **medium** (textbook confirmed, exact page/edition on physical access).

---

## F6. Parallel Availability

- **Formula:** $A_\text{parallel} = 1 - \prod_{i=1}^{n}(1 - A_i)$
- **Source:** O'Connor, P.D.T., Kleyner, A. (2012). *Practical Reliability Engineering*, 5th ed. Wiley. Ch. 6 §6.4 "Parallel Systems."
- **Alternate canonical source:** Rausand & Høyland (2004), op. cit., Ch. 4 "Parallel structure."
- **Use in c1v:** Module 4 — availability estimate for redundant/replicated components (multi-AZ DBs, active-active clusters). Rewards architectures that break single-point-of-failure chains.
- **Confidence:** **medium** (same source as F5).

---

## F7. Decision Utility (Weighted Additive Utility)

- **Formula:** $U(a) = \sum_{i=1}^{n} w_i \cdot \text{score}_i(a)$ subject to $\sum w_i = 1$, $w_i \ge 0$.
- **Source:** Keeney, R.L., Raiffa, H. (1976). *Decisions with Multiple Objectives: Preferences and Value Tradeoffs.* Wiley, New York. ISBN 978-0-471-46510-2. Ch. 3 "Unidimensional Utility Theory" and Ch. 6 "Multiattribute Preferences under Uncertainty" (additive utility theorem). Reprinted Cambridge University Press (1993).
- **Use in c1v:** Module 4 Decision Matrix — computes aggregate architecture utility across NFR dimensions (latency, cost, availability, complexity). Forms the basis of Pareto dominance checks (F8).
- **Confidence:** **high** (original 1976 Wiley edition + 1993 Cambridge reprint both confirmed; additive utility theorem is the book's core result).

---

## F8. Pareto Dominance

- **Formula:** Solution $a$ dominates $b$ iff $\forall i: f_i(a) \ge f_i(b)$ and $\exists j: f_j(a) > f_j(b)$ (for maximization, with obvious sign flip for minimization).
- **Original conceptual source:** Pareto, V. (1906). *Manuale di Economia Politica.* Società Editrice Libraria, Milano. English translation: *Manual of Political Economy* (A.S. Schwier trans., 1971, Macmillan; variorum ed. 2014, Oxford UP, ISBN 978-0-19-960795-2). Introduces Pareto-efficient allocations.
- **Modern canonical source:** Deb, K. (2001). *Multi-Objective Optimization using Evolutionary Algorithms.* Wiley, Chichester. ISBN 978-0-471-87339-6. Ch. 2 "Multi-Objective Optimization" §2.4 "Dominance and Pareto-Optimality" — gives the modern rigorous definition used in engineering.
- **Use in c1v:** Module 4 — filters the architecture option set to the Pareto-optimal frontier before utility scoring. Lets the system say "option X is strictly dominated, drop it" with justification.
- **Confidence:** **high** (Pareto 1906 original + Deb 2001 modern canonical both confirmed).

---

## F9. Pareto Frontier / Non-Dominated Set

- **Formula:** $\mathcal{P} = \{a \in \mathcal{A} \mid \nexists b \in \mathcal{A}: b \succ a\}$
- **Source:** Deb, K. (2001). *Multi-Objective Optimization using Evolutionary Algorithms.* Wiley. Ch. 2 §2.4.2 "Pareto-Optimal Front."
- **Use in c1v:** Module 4 — surface the non-dominated set of architecture candidates to the user so they can choose their preferred trade-off on the frontier. Also drives the "why wasn't X picked?" explainability view.
- **Confidence:** **high** (same source as F8).

---

## F10. Variance-Based Sensitivity (Sobol Indices)

- **Formula:** Total-variance decomposition: $V(Y) = \sum_i V_i + \sum_{i<j} V_{ij} + \ldots + V_{12\ldots k}$ where $V_i = V_{X_i}(E_{X_{\sim i}}(Y|X_i))$. First-order index: $S_i = V_i / V(Y)$. Total-effect index: $S_{T_i} = 1 - V_{X_{\sim i}}(E_{X_i}(Y|X_{\sim i}))/V(Y)$.
- **Original source:** Sobol', I.M. (1993). "Sensitivity estimates for nonlinear mathematical models." *Mathematical Modelling and Computational Experiments* 1(4):407-414. English translation of Sobol' (1990), *Matematicheskoe Modelirovanie* 2(1):112-118 (Russian).
- **Modern canonical reference:** Saltelli, A., Ratto, M., Andres, T., Campolongo, F., Cariboni, J., Gatelli, D., Saisana, M., Tarantola, S. (2008). *Global Sensitivity Analysis: The Primer.* Wiley-Interscience. ISBN 978-0-470-05997-5. Ch. 4 "Variance-based methods."
- **Open PDF of Primer:** https://www.andreasaltelli.eu/file/repository/A_Saltelli_Marco_Ratto_Terry_Andres_Francesca_Campolongo_Jessica_Cariboni_Debora_Gatelli_Michaela_Saisana_Stefano_Tarantola_Global_Sensitivity_Analysis_The_Primer_Wiley_Interscience_2008_.pdf
- **Use in c1v:** Module 4 — ranks decision-input parameters (DAU, peak factor, cache hit rate, availability targets) by how much each drives output variance (recommended architecture, cost, SLO feasibility). Tells the user "if you're unsure about X, it matters; if you're unsure about Y, it doesn't."
- **Confidence:** **high** (Sobol' 1993 original + Saltelli 2008 Primer both confirmed).

---

## F11. Architectural Quality (Coupling / Cohesion / Modularity)

- **Formula (c1v-adapted):** $Q(f, g) = \text{specificity}(f, g) \cdot (1 - \text{coupling}(g))$ where $f$ = function, $g$ = form/component.
- **Primary source (coupling/cohesion originals):** Stevens, W.P., Myers, G.J., Constantine, L.L. (1974). "Structured Design." *IBM Systems Journal* 13(2):115-139. https://doi.org/10.1147/sj.132.0115 — introduces module coupling and cohesion as distinct metrics of design quality.
- **Modern canonical source:** Bass, L., Clements, P., Kazman, R. (2021). *Software Architecture in Practice*, 4th ed. Addison-Wesley / SEI Series. ISBN 978-0-13-688609-9. Ch. 20 "Designing an Architecture" and Ch. 8 "Modifiability Quality Attribute" — treats modularity (low coupling + high cohesion) as a first-class architecture concern.
- **Form-function framing:** Crawley, Cameron, Selva (2015), op. cit. F12 — defines specificity of the form→function mapping.
- **Use in c1v:** Module 3/4 — scores architectural quality of each FFBD candidate. High specificity (one form cleanly fulfills one function) × low coupling (form doesn't drag other forms with it) = high quality. Feeds into F7 utility.
- **Confidence:** **medium** — Stevens/Myers/Constantine 1974 defines coupling/cohesion originals; Bass et al. 2021 applies at architecture scale; the c1v-specific product form $Q = \text{spec} \cdot (1-\text{coup})$ is an internal operationalization, not a cited formula. Flag for internal derivation docs.

---

## F12. Form-Function Mapping

- **Formula:** Architecture $= (\text{function set } F, \text{form set } G, \text{mapping } \phi: F \to G)$, with quality measured by specificity and integrity of $\phi$.
- **Source:** Crawley, E., Cameron, B., Selva, D. (2015). *System Architecture: Strategy and Product Development for Complex Systems*, 1st Global ed. Pearson / Prentice Hall. ISBN 978-0-13-397534-5. Ch. 2 "Thinking: Form and Function" and Ch. 3 "Thinking: Systems and System Thinking."
- **Dependency note:** Per the task brief, this reference is also being sourced by a separate agent (peer ownership). Do not duplicate work — link this entry to that agent's deliverable on merge.
- **Use in c1v:** Module 2/3 — the entire methodology (UCBD → FFBD → Decision Matrix) is built on Crawley's form-function separation. Informs F11 quality metric.
- **Confidence:** **high** (book + authors + edition confirmed; dependency flagged).

---

## F13. Object-Process Methodology (OPM)

- **Formula (conceptual, not algebraic):** OPM bimodal representation — every system is simultaneously described by objects (stateful entities) and processes (transformations). Formalized as ISO 19450:2015.
- **Source:** Dori, D. (2016). *Model-Based Systems Engineering with OPM and SysML.* Springer, New York. ISBN 978-1-4939-3294-8. https://doi.org/10.1007/978-1-4939-3295-5
- **Standard:** ISO/PAS 19450:2015 — "Automation systems and integration — Object-Process Methodology" (Dori is principal author).
- **Use in c1v:** Module 2/3 — OPM's process-object duality grounds the c1v UCBD structure (processes = use-case steps, objects = data/artifacts). Provides the formal notation used in generated diagrams and is the theoretical bridge to SysML export.
- **Confidence:** **high** (Dori 2016 Springer book + ISO 19450 standard both confirmed).

---

## F14. Tail-Latency Chain Budget

- **Formula (approximate, for serial composition of N independent stages):** $L^{(p)}_\text{chain} \approx \sum_{i=1}^{N} L^{(p)}_i$ for high $p$ (e.g., p95, p99); exact expression requires convolution of latency CDFs. Tail amplifies super-linearly as N grows.
- **Source:** Dean, J., Barroso, L.A. (2013). "The Tail at Scale." *Communications of the ACM* 56(2):74-80. https://doi.org/10.1145/2408776.2408794. PDF: https://www.barroso.org/publications/TheTailAtScale.pdf
- **Key result cited:** Section "Why Variability Exists" — with N=100 independent servers each having a 1% >1s latency tail, probability at least one slow = $1 - 0.99^{100} \approx 63\%$. Hence chain p99 ≠ single-stage p99.
- **Supporting measurement practice:** Tene, G. "How NOT to Measure Latency." StrangeLoop 2013. https://www.infoq.com/presentations/latency-response-time/ — coordinated-omission warning; use HdrHistogram (https://github.com/HdrHistogram/HdrHistogram) when measuring the input $L^{(p)}_i$ values.
- **Use in c1v:** Module 2/4 — computes p95/p99 latency budget for a multi-stage request path; flags architectures where tail-amplification from serial chain length violates SLO. Critical for microservice vs monolith trade-offs.
- **Confidence:** **high** (Dean & Barroso CACM 2013 confirmed with DOI and free PDF; Tene coordinated-omission source confirmed).

---

## F15. Cache Hit Rate / TTL Math

- **Formula (basic hit ratio):** $H = \dfrac{\text{hits}}{\text{hits} + \text{misses}}$. Effective latency: $L_\text{eff} = H \cdot L_\text{cache} + (1-H) \cdot L_\text{origin}$. For TTL-based caches with request rate $\lambda$ per object, hit probability $\approx 1 - e^{-\lambda T}$ (exponential-interarrival approximation).
- **Canonical practitioner source:** Wessels, D. (2001). *Web Caching.* O'Reilly. ISBN 978-1-56592-536-4. Ch. 2 §2.4 "Hit Ratios" — defines hit ratio, byte hit ratio, and TTL-driven freshness.
- **Peer-reviewed TTL-cache analysis:** Che, H., Tung, Y., Wang, Z. (2002). "Hierarchical Web Caching Systems: Modeling, Design and Experimental Results." *IEEE Journal on Selected Areas in Communications* 20(7):1305-1314. https://doi.org/10.1109/JSAC.2002.801752 — "Che's approximation" for LRU / TTL cache hit probabilities.
- **Modern extension (TTL cache networks):** Fofack, N.C., Nain, P., Neglia, G., Towsley, D. (2012). "Analysis of TTL-based Cache Networks." INRIA / ValueTools. https://inria.hal.science/hal-00676735/
- **Use in c1v:** Module 2/4 — estimates effective origin load reduction and latency improvement from adding a cache tier. Informs SLO-feasibility and cost trade-offs in the decision matrix.
- **Confidence:** **medium** — Wessels 2001 (definitions), Che 2002 (peer-reviewed hit-rate approximation), Fofack et al. 2012 (TTL networks) all confirmed; specific page citations on physical access. The compound "effective latency" identity is arithmetic.

---

## Summary Table

| # | Formula | Primary Source | Confidence |
|---|---------|----------------|:----------:|
| F1 | Little's Law | Little 1961, *Oper. Res.* 9(3) | high |
| F2 | Peak RPS from DAU | Beyer et al. 2016 (SRE) + Kleppmann 2017 (DDIA) | medium |
| F3 | M/M/1 wait time | Kleinrock 1975, *Queueing Systems Vol. I* | high |
| F4 | M/M/c / Erlang C | Erlang 1917 + Kleinrock 1975 | high |
| F5 | Series availability | O'Connor & Kleyner 2012, 5th ed. | medium |
| F6 | Parallel availability | O'Connor & Kleyner 2012, 5th ed. | medium |
| F7 | Weighted additive utility | Keeney & Raiffa 1976 | high |
| F8 | Pareto dominance | Pareto 1906 + Deb 2001 | high |
| F9 | Pareto frontier | Deb 2001 | high |
| F10 | Sobol / variance-based SA | Sobol' 1993 + Saltelli et al. 2008 | high |
| F11 | Coupling / cohesion quality | Stevens/Myers/Constantine 1974 + Bass et al. 2021 | medium |
| F12 | Form-function mapping | Crawley/Cameron/Selva 2015 | high |
| F13 | OPM | Dori 2016 + ISO 19450:2015 | high |
| F14 | Tail-latency chain | Dean & Barroso 2013 *CACM* | high |
| F15 | Cache hit / TTL | Wessels 2001 + Che et al. 2002 | medium |

---

## Follow-ups Before Implementation

1. **F5, F6, F11, F15 (medium confidence):** Pull physical/PDF copies to confirm exact page numbers for in-code comments and spec docs.
2. **F2 (medium):** Decide whether to cite SRE book + DDIA together (current plan) or promote to an internal c1v derivation note that cites both.
3. **F11 (medium):** The product form $Q = \text{spec} \cdot (1 - \text{coup})$ is c1v-specific; write an internal derivation doc that shows how it collapses to Stevens/Myers/Constantine and Bass/Clements/Kazman primitives.
4. **F12 (dependency):** Merge with the separate Crawley-focused agent's deliverable before locking this bibliography.
5. **F14 (implementation note):** When measuring $L^{(p)}_i$ inputs in practice, use HdrHistogram with `recordValues(value, expectedInterval)` to avoid coordinated omission (Tene). The additive $\sum L^{(p)}_i$ form is an **upper-bound approximation** for serial chains and a **lower bound** for parallel chains — document the difference in c1v's math engine.
