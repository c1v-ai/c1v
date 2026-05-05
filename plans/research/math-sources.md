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

## F16. LSM-Tree Write Amplification

- **Formula (asymptotic):** $\text{WA}_\text{LSM} \approx \log_T(N/M) \cdot T$ where $T$ = level size ratio (typically 10), $N$ = total data size, $M$ = memtable size. Read amplification: $\log_T(N/M)$ levels checked per lookup (mitigated by Bloom filters).
- **Original source:** O'Neil, P., Cheng, E., Gawlick, D., O'Neil, E. (1996). "The Log-Structured Merge-Tree (LSM-Tree)." *Acta Informatica* 33(4):351-385. https://doi.org/10.1007/s002360050048
- **Modern canonical reference:** Kleppmann, M. (2017). *Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems.* O'Reilly. ISBN 978-1-449-37332-0. Ch. 3 "Storage and Retrieval" §"SSTables and LSM-Trees" + §"Comparing B-Trees and LSM-Trees." On disk at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/ai-architecture/ScyllaDB-Designing-Data-Intensive-Applications.md` (ScyllaDB excerpt, Ch 3).
- **Production benchmark:** Cassandra, RocksDB, ScyllaDB, LevelDB all implement LSM-tree variants. Empirical write amplification typically 10-30× for compaction-heavy workloads.
- **Use in c1v:** Module 4 storage-engine decision scoring. When a project's `transaction_pattern == 'write-heavy'` (D7 discriminator) AND `D4 dau_band ≥ 100K`, score LSM-tree-backed alternatives (Cassandra/Scylla/Dynamo) higher than B-tree-backed (Postgres/MySQL) on throughput criterion. Trade off: higher write amplification cost vs higher write throughput.
- **Confidence:** **high** (O'Neil 1996 original + Kleppmann 2017 canonical + production deployment evidence all confirmed).

---

## F17. B-Tree Write Amplification

- **Formula (asymptotic):** $\text{WA}_\text{Btree} \approx 2 \cdot \log_B(N)$ where $B$ = branching factor (typical 100-1000), $N$ = number of keys. Each insert touches the leaf page (1 write) + the WAL/redo log (1 write); structurally-balanced rewrites add $O(\log_B N)$ page writes amortized per split.
- **Original source:** Bayer, R., McCreight, E. (1972). "Organization and Maintenance of Large Ordered Indices." *Acta Informatica* 1(3):173-189. https://doi.org/10.1007/BF00288683 — introduces the B-tree.
- **Modern canonical reference:** Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly. Ch. 3 §"B-Trees" + §"Making B-trees reliable" — covers WAL/redo logging that drives the 2× constant. Same on-disk excerpt as F16.
- **Comparison framing:** Same Kleppmann Ch 3 §"Comparing B-Trees and LSM-Trees" — read-heavy + range-scan workloads favor B-tree; write-heavy + append-mostly favor LSM-tree.
- **Use in c1v:** Module 4 storage-engine decision scoring (alternative to F16). When `transaction_pattern == 'read-heavy' \| 'mixed-CRUD'` AND consistency requirements are strong, score B-tree-backed alternatives (Postgres/MySQL/Aurora) higher on read latency + transactional integrity.
- **Confidence:** **high** (Bayer 1972 original + Kleppmann 2017 canonical confirmed; ubiquitous in production RDBMS).

---

## F18. Quorum Consistency Condition

- **Formula:** For replicated reads/writes across $N$ replicas with write quorum $W$ and read quorum $R$, **strong consistency holds iff $W + R > N$**. Common choices: $N=3, W=2, R=2$ (typical Cassandra/Dynamo) gives strong consistency; $W=1, R=1$ gives eventual consistency.
- **Original source:** Gifford, D.K. (1979). "Weighted Voting for Replicated Data." *Proceedings of the 7th ACM Symposium on Operating Systems Principles (SOSP '79)*, 150-162. https://doi.org/10.1145/800215.806583 — introduces weighted voting / quorum consistency.
- **Foundational extension:** Thomas, R.H. (1979). "A Majority Consensus Approach to Concurrency Control for Multiple Copy Databases." *ACM TODS* 4(2):180-209. https://doi.org/10.1145/320071.320076 — majority-quorum special case.
- **Modern canonical reference:** Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly. Ch. 5 "Replication" §"Quorums for reading and writing" + §"Limitations of Quorum Consistency." Same on-disk excerpt as F16/F17.
- **Practical caveat (Kleppmann Ch 5):** $W + R > N$ guarantees a freshly-written value is *visible* to a quorum read, but does NOT guarantee linearizability (concurrent reads from different clients may see different values). For linearizability use leader-based replication or consensus (Raft/Paxos) — see F20.
- **Use in c1v:** Module 2 NFR engine. Maps user's `consistency_target` (strong / eventual / session) to required $(N, W, R)$ tuple → drives replication-factor scoring in M4 cost criterion (F18 integrates with F5/F6 availability arithmetic + F19 replication lag).
- **Confidence:** **high** (Gifford 1979 SOSP original + Thomas 1979 ACM + Kleppmann 2017 canonical confirmed).

---

## F19. Replication Lag Bounds (Sync vs Async)

- **Concept (not single algebraic formula):**
  - **Synchronous replication:** writer blocks until $\ge k$ followers acknowledge (configurable). Lag = 0 at commit time. Cost: writer latency = $\max(L_\text{leader}, L_\text{slowest-of-k-followers})$.
  - **Asynchronous replication:** writer commits at leader; followers apply later. Lag = network RTT + apply-queue depth + apply-throughput-saturation factor. Bounded only probabilistically; can spike to seconds during network partition or apply-thread saturation.
  - **Semi-synchronous:** writer blocks until $k = 1$ follower has *received* (not applied) the write. Compromise — durability without write-latency tax of full sync.
- **Source:** Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly. Ch. 5 §"Synchronous Versus Asynchronous Replication" + §"Problems with Replication Lag" (read-your-writes consistency, monotonic reads, consistent prefix reads). Same on-disk excerpt as F16-F18.
- **Empirical replication-lag measurements:** Bailis, P., Venkataraman, S., Franklin, M.J., Hellerstein, J.M., Stoica, I. (2014). "Quantifying eventual consistency with PBS [Probabilistically Bounded Staleness]." *VLDB Journal* 23(2):279-302. https://doi.org/10.1007/s00778-013-0330-1 — quantifies the long tail of async-replication lag in real Cassandra/Dynamo deployments.
- **Use in c1v:** Module 4 availability calc — adjusts F6 parallel-availability score downward when async replication is in use, to reflect potential staleness window. Module 2 NFR engine surfaces "read-your-writes" as a discriminator question when D7 = `write-heavy` + sessions are stateful.
- **Confidence:** **high** (Kleppmann 2017 + Bailis 2014 PBS confirmed; concept is qualitative, not a single closed-form formula — flag as such in code comments).

---

## F20. Partial Synchrony (GST — Global Stabilization Time)

- **Concept:** A distributed system is **partially synchronous** if there exists an unknown but finite Global Stabilization Time (GST) after which message delays and clock skew are bounded by known constants $\Delta_\text{msg}$ and $\rho_\text{clock}$. Before GST, no timing guarantees hold; after GST, the system behaves synchronously. Consensus protocols (Raft, Paxos, ZAB) prove safety under partial synchrony — they NEVER violate consistency, but liveness (progress) is only guaranteed after GST.
- **Original source:** Dwork, C., Lynch, N., Stockmeyer, L. (1988). "Consensus in the presence of partial synchrony." *Journal of the ACM (JACM)* 35(2):288-323. https://doi.org/10.1145/42282.42283 — introduces the partial-synchrony model.
- **FLP impossibility result (foundational):** Fischer, M.J., Lynch, N.A., Paterson, M.S. (1985). "Impossibility of distributed consensus with one faulty process." *Journal of the ACM* 32(2):374-382. https://doi.org/10.1145/3149.214121 — proves no deterministic algorithm achieves consensus in a fully asynchronous model with even one crash failure. Motivates partial synchrony as the realistic compromise.
- **Modern canonical reference:** Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly. Ch. 8 "The Trouble with Distributed Systems" §"System Model and Reality" — explains partial synchrony via the trio of clock, message-delay, and process-failure assumptions. Ch. 9 "Consistency and Consensus" §"Distributed Transactions and Consensus" applies partial synchrony to Raft/Paxos. Same on-disk excerpt covers Ch 8.
- **Use in c1v:** Module 4 availability lower bound. Architectures relying on consensus (etcd, Spanner, FoundationDB, Raft-based KV) cannot guarantee progress under network partition — flag the user's availability target as "best-effort, partition-vulnerable" when M4 selects a consensus-based alternative under high D9 geo-distribution. Underwrites the PACELC discussion in `system-design-math-logic.md` §4.
- **Confidence:** **high** (Dwork/Lynch/Stockmeyer 1988 + FLP 1985 + Kleppmann 2017 all confirmed; foundational distributed-systems theory).

---

## F21. Byzantine Fault Tolerance — `3f + 1` Replication Lower Bound

- **Formula:** To tolerate up to $f$ Byzantine (arbitrary, including malicious) faulty processes while maintaining safety + liveness, a system **must have at least $3f + 1$ total replicas**. For the simpler crash-stop model, $2f + 1$ suffices (this is what Raft/Paxos assume).
- **Original source:** Lamport, L., Shostak, R., Pease, M. (1982). "The Byzantine Generals Problem." *ACM TOPLAS* 4(3):382-401. https://doi.org/10.1145/357172.357176 — introduces the term and proves the `3f + 1` lower bound for the Oral-Messages model.
- **Practical algorithm (PBFT):** Castro, M., Liskov, B. (1999). "Practical Byzantine Fault Tolerance." *Proc. 3rd USENIX OSDI*, 173-186. https://www.pmg.csail.mit.edu/papers/osdi99.pdf — first BFT protocol with practical performance.
- **Modern survey:** Cachin, C., Guerraoui, R., Rodrigues, L. (2011). *Introduction to Reliable and Secure Distributed Programming*, 2nd ed. Springer. ISBN 978-3-642-15259-7. Ch. 2 "Basic Abstractions" + Ch. 3 "Reliable Broadcast" cover crash-stop vs Byzantine fault models.
- **Modern canonical reference (Kleppmann):** Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly. Ch. 8 §"Byzantine Faults" — explains why most production systems do NOT use BFT (the `3f+1` cost rarely justifies the threat model in trusted-datacenter deployments). Same on-disk excerpt covers Ch 8.
- **Use in c1v:** Module 4 high-stakes decision scoring. When a project's `D6 industry == 'finance' \| 'healthcare' \| 'defense'` AND data integrity is a hard constraint, score BFT-capable alternatives (HyperLedger Fabric BFT, Tendermint, multi-signature blockchains) higher on integrity criterion — but flag the `3f+1` cost penalty (≥4 replicas) on cost criterion. For typical SaaS, BFT is over-engineered; flag as such.
- **Confidence:** **high** (Lamport/Shostak/Pease 1982 original + Castro/Liskov 1999 PBFT + Kleppmann 2017 canonical confirmed; foundational result with active production use in financial/permissioned-blockchain systems).

---

## F22. Kolmogorov–Smirnov Two-Sample Test (Distribution Shift Detection)

- **Formula:** $D_{n,m} = \sup_x |F_{1,n}(x) - F_{2,m}(x)|$ (sup-norm distance between two empirical CDFs). Reject null hypothesis "samples come from same distribution" when $D > c(\alpha) \sqrt{(n+m)/(nm)}$.
- **Original source:** Smirnov, N.V. (1948). "Table for estimating the goodness of fit of empirical distributions." *Annals of Mathematical Statistics* 19(2):279-281. https://doi.org/10.1214/aoms/1177730256
- **Foundational predecessor:** Kolmogorov, A.N. (1933). "Sulla determinazione empirica di una legge di distribuzione." *Giornale dell'Istituto Italiano degli Attuari* 4:83-91 (one-sample case).
- **Modern canonical reference:** Huyen, C. (2022). *Designing Machine Learning Systems*. O'Reilly. ISBN 978-1-098-10796-3. Ch. 8 §"Detecting Data Distribution Shifts" (DMLS L4598-4613). Also Feigelson & Babu astrostatistics treatment cited in DDIA Ch 8 ref #33.
- **Use in c1v:** Module 8 FMEA — "covariate shift detected" failure mode trigger when KS-statistic exceeds threshold on monitored feature. Module 2 NFR engine — `monitoring_drift_sensitivity` score parameterized by KS threshold + alarm latency.
- **Caveat:** KS is a univariate test. For multivariate features use F23 (MMD) instead.
- **Confidence:** **high** (Smirnov 1948 original + Kolmogorov 1933 predecessor + DMLS canonical confirmed).

---

## F23. Maximum Mean Discrepancy (Kernel Two-Sample Test)

- **Formula (squared MMD with kernel $k$):** $\text{MMD}^2[F, X, Y] = \frac{1}{n^2}\sum_{i,j} k(x_i, x_j) + \frac{1}{m^2}\sum_{i,j} k(y_i, y_j) - \frac{2}{nm}\sum_{i,j} k(x_i, y_j)$. RBF kernel default; bandwidth via median-heuristic.
- **Original source:** Gretton, A., Borgwardt, K.M., Rasch, M.J., Schölkopf, B., Smola, A. (2012). "A Kernel Two-Sample Test." *Journal of Machine Learning Research* 13:723-773. https://jmlr.org/papers/v13/gretton12a.html
- **Modern canonical reference:** Huyen, C. (2022). *Designing Machine Learning Systems.* O'Reilly. Ch. 8 (DMLS L4609). Also covered in Kouw & Loog 2018 covariate-shift survey (arXiv:1812.11806) referenced in DDIA Ch 8 ref #26.
- **Use in c1v:** Module 8 FMEA — high-dimensional drift detection where KS (F22) fails because univariate. Module 4 decision criterion — "drift-detector method" alternative scoring (KS for univariate features, MMD for embeddings/feature-vectors).
- **Caveat:** kernel choice + bandwidth tuning matters; document defaults in code comments.
- **Confidence:** **high** (Gretton 2012 JMLR original + DMLS canonical confirmed).

---

## F24. Population Stability Index (PSI)

- **Formula:** $\text{PSI} = \sum_{i=1}^{B} (p_i - q_i) \ln(p_i / q_i)$ where $p_i, q_i$ = bucket frequencies in baseline + current distributions across $B$ bins. Industry thresholds: PSI < 0.1 (no shift), 0.1-0.25 (minor), > 0.25 (major shift, retrain trigger).
- **Origin (industry-canonical, weaker formal trail):** Karakoulas, G. (1990s, credit-scoring industry usage; no single canonical paper). Modern academic treatment: Yurdakul, B. (2018). "Statistical Properties of Population Stability Index." PhD dissertation, Western Michigan University. https://scholarworks.wmich.edu/dissertations/3208/
- **Modern canonical reference:** Huyen, C. (2022). *Designing Machine Learning Systems.* O'Reilly. Ch. 8 §"Statistical Methods" (DMLS L4598 — discussed alongside KS as a "statistical-method" category for drift).
- **Use in c1v:** Module 2 NFR — `feature_stability_index` per-feature monitoring NFR. Module 8 FMEA — "PSI > 0.25 ⇒ retrain trigger" failure mode with quantified threshold. Frequently used in fintech/credit-scoring projects (D6 industry).
- **Caveat:** PSI is a **special case of KL-divergence** with symmetric framing (`(p-q)·ln(p/q)` instead of `p·ln(p/q)`). DMLS doesn't cite Yurdakul directly; PSI is more "industrial canon" than "peer-reviewed canon."
- **Confidence:** **medium** (industry-canonical; thresholds well-known but origin paper trail is informal).

---

## F25. Thompson Sampling — Bayesian Bandit Regret Bound

- **Formula:** For $K$-armed Bernoulli bandit, expected cumulative regret $\mathbb{E}[\text{Regret}(T)] = O(\sqrt{KT \log T})$ asymptotically. Algorithm: sample reward distribution from posterior, pull arm with highest sample, update posterior.
- **Original source:** Thompson, W.R. (1933). "On the Likelihood that One Unknown Probability Exceeds Another in View of the Evidence of Two Samples." *Biometrika* 25(3/4):285-294. https://doi.org/10.2307/2332286
- **Modern proof of the regret bound:** Agrawal, S., Goyal, N. (2012). "Analysis of Thompson Sampling for the Multi-Armed Bandit Problem." *Proc. 25th Annual Conference on Learning Theory (COLT)*, JMLR W&CP 23:39.1-39.26. https://proceedings.mlr.press/v23/agrawal12/agrawal12.pdf
- **Modern canonical reference:** Huyen, C. (2022). *Designing Machine Learning Systems.* O'Reilly. Ch. 9 §"Contextual Bandits as an Alternative" (DMLS L5392, L5397, L5472).
- **Use in c1v:** Module 4 decision-net node — "model-routing strategy" alternative where Thompson Sampling competes with A/B test (F27) and UCB (F26) on `experimentation_data_efficiency` criterion. Module 2 NFR — `experimentation_data_efficiency` score (regret bound translates to "wasted traffic before convergence").
- **Confidence:** **high** (Thompson 1933 original *Biometrika* + Agrawal/Goyal 2012 COLT modern proof + DMLS canonical confirmed).

---

## F26. UCB1 — Upper Confidence Bound Bandit Regret

- **Formula:** $\mathbb{E}[\text{Regret}(T)] \le 8 \sum_{i: \mu_i < \mu^*} \frac{\ln T}{\Delta_i} + \left(1 + \frac{\pi^2}{3}\right) \sum_i \Delta_i$ where $\Delta_i$ = gap between optimal and arm $i$. Algorithm: pull arm maximizing $\hat{\mu}_i + \sqrt{2 \ln T / n_i}$.
- **Original source:** Auer, P., Cesa-Bianchi, N., Fischer, P. (2002). "Finite-time Analysis of the Multiarmed Bandit Problem." *Machine Learning* 47(2-3):235-256. https://doi.org/10.1023/A:1013689704352
- **Foundational predecessor:** Lai, T.L., Robbins, H. (1985). "Asymptotically efficient adaptive allocation rules." *Advances in Applied Mathematics* 6(1):4-22 — proves $\Omega(\log T)$ lower bound any algorithm must match.
- **Modern canonical reference:** Huyen, C. (2022). *Designing Machine Learning Systems.* O'Reilly. Ch. 9 (DMLS L5397).
- **Use in c1v:** Module 4 decision-net — alternative to F25 on the same `experimentation_data_efficiency` criterion. UCB1 is deterministic (no posterior sampling), often preferred when reward distributions are unknown / non-conjugate. Use F25 vs F26 as Pareto alternatives for routing strategy when M4 fires.
- **Confidence:** **high** (Auer/Cesa-Bianchi/Fischer 2002 *Machine Learning* + Lai/Robbins 1985 lower bound + DMLS canonical confirmed).

---

## F27. A/B Test Sample-Size Formula (Two-Proportion Z-Test)

- **Formula:** $n = \dfrac{2(z_{\alpha/2} + z_\beta)^2 \cdot \bar{p}(1 - \bar{p})}{\Delta^2}$ per arm, where $\bar{p}$ = pooled baseline rate, $\Delta$ = minimum detectable effect, $\alpha$ = significance level, $\beta$ = 1 - power. Typical: $\alpha=0.05, \beta=0.20$ → $z_{0.025}=1.96, z_{0.20}=0.84$.
- **Original source:** Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences*, 2nd ed. Routledge. ISBN 978-0-805-80283-2. Ch. 6 "Differences between Proportions" — definitive treatment of power-analysis sample-size formulas.
- **Foundational predecessor:** Neyman, J., Pearson, E.S. (1933). "On the Problem of the Most Efficient Tests of Statistical Hypotheses." *Philosophical Transactions of the Royal Society of London* A 231:289-337 — Neyman-Pearson lemma underlying power calculations.
- **Modern canonical reference:** Huyen, C. (2022). *Designing Machine Learning Systems.* O'Reilly. Ch. 9 §"A/B Testing" (DMLS L5392 — uses Rafferty's 630k-vs-12k example to show traffic asymmetry in tests).
- **Use in c1v:** Module 2 NFR — `min_traffic_for_significance` quantified target as a function of expected lift + baseline conversion + power requirements. Module 8 FMEA — "underpowered rollout" failure mode (computed n exceeds available traffic at rollout horizon).
- **Confidence:** **high** (Cohen 1988 canonical + Neyman/Pearson 1933 foundational + DMLS canonical confirmed; ubiquitous in industrial A/B platforms).

---

## F28. Hidden Technical Debt / CACE Principle (Categorical FMEA Taxonomy)

- **Concept (categorical, not algebraic):** ML systems accrue 9 species of hidden debt — entanglement, correction cascades, undeclared consumers, data dependencies, feedback loops, glue code, pipeline jungles, dead experimental codepaths, configuration debt. Plus the **CACE** ("Changing Anything Changes Everything") principle: ML model boundaries leak into upstream/downstream code in ways traditional software doesn't.
- **Original source:** Sculley, D., Holt, G., Golovin, D., Davydov, E., Phillips, T., Ebner, D., Chaudhary, V., Young, M., Crespo, J.-F., Dennison, D. (2015). "Hidden Technical Debt in Machine Learning Systems." *Advances in Neural Information Processing Systems (NeurIPS) 28*, pp. 2503-2511. https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html
- **Modern canonical reference:** Huyen, C. (2022). *Designing Machine Learning Systems.* O'Reilly. Ch. 1 + Ch. 8 (training-serving skew at L4527, feedback loops at L4541) — the entire DMLS framing of MLOps treats Sculley as foundational.
- **Use in c1v:** Module 8 FMEA — every Sculley species maps to a candidate failure mode RPN row. Default M8.a generates 9 generic FMs from Sculley taxonomy, then specializes per-project based on M3 FFBD + M0a signals. Critical for MLOps-flavored projects (D6 industry where ML is core, e.g., recommender systems / fraud / forecasting).
- **Caveat:** Categorical, not arithmetic. F28 is a **taxonomy** not a formula. Its role in c1v's math engine is generative (producing FMs to score), not computational. Document this distinction.
- **Confidence:** **high** (Sculley et al. 2015 NeurIPS — among the most-cited ML-systems papers; DMLS canonical confirmed).

---

## F29. Catastrophic Forgetting (Continual Learning Bound)

- **Concept (qualitative + EWC formal regularizer):** When a neural network is retrained on new data without preserving old data, performance on the original task degrades sharply ("catastrophic forgetting"). Modern formalization via **Elastic Weight Consolidation (EWC)**: penalize parameter updates that move away from posterior peak of prior task, weighted by Fisher information matrix $F$: $\mathcal{L}(\theta) = \mathcal{L}_B(\theta) + \sum_i \frac{\lambda}{2} F_i (\theta_i - \theta^*_{A,i})^2$.
- **Original source:** McCloskey, M., Cohen, N.J. (1989). "Catastrophic Interference in Connectionist Networks: The Sequential Learning Problem." *Psychology of Learning and Motivation* 24:109-165. https://doi.org/10.1016/S0079-7421(08)60536-8 — coins the term "catastrophic forgetting."
- **Modern canonical (formalization + benchmarks):** Kirkpatrick, J., Pascanu, R., Rabinowitz, N., Veness, J., Desjardins, G., Rusu, A.A., Milan, K., Quan, J., Ramalho, T., Grabska-Barwinska, A., Hassabis, D., Clopath, C., Kumaran, D., Hadsell, R. (2017). "Overcoming catastrophic forgetting in neural networks." *Proceedings of the National Academy of Sciences* 114(13):3521-3526. https://doi.org/10.1073/pnas.1611835114
- **Modern canonical reference (DMLS):** Huyen, C. (2022). *Designing Machine Learning Systems.* O'Reilly. Ch. 9 §"Continual Learning" (DMLS L5044).
- **Use in c1v:** Module 8 FMEA — "online-update degrades baseline accuracy" failure mode for any project with stateful continual-learning loop (L5 retraining = `stateful-champion-challenger`). Module 2 NFR — `update_safety_margin` quantified target (max acceptable accuracy regression on hold-out test set after retrain).
- **Confidence:** **high** (McCloskey/Cohen 1989 origin + Kirkpatrick et al. 2017 *PNAS* canonical + DMLS confirmed).

---

## F30. Brier Score & Expected Calibration Error (ECE)

- **Brier score formula:** $\text{BS} = \frac{1}{N} \sum_{i=1}^{N} (p_i - y_i)^2$ where $p_i$ = predicted probability, $y_i \in \{0,1\}$ = true outcome. Lower is better; perfect classifier $\text{BS}=0$.
- **ECE formula:** $\text{ECE} = \sum_{m=1}^{M} \frac{|B_m|}{N} \cdot \left| \text{acc}(B_m) - \text{conf}(B_m) \right|$ — bin predictions by confidence, measure gap between average confidence and observed accuracy per bin.
- **Original Brier source:** Brier, G.W. (1950). "Verification of forecasts expressed in terms of probability." *Monthly Weather Review* 78(1):1-3. https://doi.org/10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2
- **Modern ECE source:** Guo, C., Pleiss, G., Sun, Y., Weinberger, K.Q. (2017). "On Calibration of Modern Neural Networks." *Proc. 34th International Conference on Machine Learning (ICML)*, PMLR 70:1321-1330. https://proceedings.mlr.press/v70/guo17a.html — empirically demonstrates that modern deep nets are systematically miscalibrated despite high accuracy.
- **Modern canonical reference (DMLS):** Huyen, C. (2022). *Designing Machine Learning Systems.* O'Reilly. Ch. 6 "Model Development and Offline Evaluation" — calibration discussion in L2998-3878 range.
- **Use in c1v:** Module 2 NFR — `probability_calibration_error` quantified target (e.g., `ECE < 0.05` for risk-scoring systems). Module 8 FMEA — "miscalibrated risk score" failure mode for any project where downstream actions depend on probability magnitude (financial risk, medical triage, autonomous-driving confidence). Calibration matters MORE than raw accuracy in these domains.
- **Caveat:** Most off-the-shelf models report accuracy/F1, not ECE/Brier. Flag this as a real gap when M2 NFR fires for a high-stakes industry.
- **Confidence:** **medium** (Brier 1950 origin + Guo et al. 2017 ICML modern empirical study confirmed; DMLS mentions calibration without naming Brier explicitly — peer-reviewed canon strong, DMLS attribution weaker).

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
| F16 | LSM-tree write amplification | O'Neil et al. 1996 + Kleppmann 2017 (DDIA Ch 3) | high |
| F17 | B-tree write amplification | Bayer & McCreight 1972 + Kleppmann 2017 (DDIA Ch 3) | high |
| F18 | Quorum consistency W+R>N | Gifford 1979 SOSP + Kleppmann 2017 (DDIA Ch 5) | high |
| F19 | Replication lag bounds (sync/async) | Kleppmann 2017 (DDIA Ch 5) + Bailis et al. 2014 PBS | high |
| F20 | Partial synchrony / GST | Dwork/Lynch/Stockmeyer 1988 + FLP 1985 + Kleppmann 2017 (DDIA Ch 8/9) | high |
| F21 | Byzantine fault tolerance `3f+1` | Lamport/Shostak/Pease 1982 + Castro/Liskov 1999 PBFT + Kleppmann 2017 (DDIA Ch 8) | high |
| F22 | Kolmogorov-Smirnov two-sample test | Smirnov 1948 *AMS* + Huyen 2022 (DMLS Ch 8) | high |
| F23 | Maximum Mean Discrepancy (MMD) | Gretton et al. 2012 *JMLR* + Huyen 2022 (DMLS Ch 8) | high |
| F24 | Population Stability Index (PSI) | Yurdakul 2018 thesis + Huyen 2022 (DMLS Ch 8) | medium |
| F25 | Thompson Sampling regret bound | Thompson 1933 *Biometrika* + Agrawal/Goyal 2012 COLT + Huyen 2022 (DMLS Ch 9) | high |
| F26 | UCB1 regret bound | Auer/Cesa-Bianchi/Fischer 2002 + Lai/Robbins 1985 + Huyen 2022 (DMLS Ch 9) | high |
| F27 | A/B test sample size | Cohen 1988 + Neyman/Pearson 1933 + Huyen 2022 (DMLS Ch 9) | high |
| F28 | Hidden Tech Debt / CACE (taxonomy) | Sculley et al. 2015 NeurIPS + Huyen 2022 (DMLS Ch 1+8) | high |
| F29 | Catastrophic forgetting / EWC | McCloskey/Cohen 1989 + Kirkpatrick et al. 2017 *PNAS* + Huyen 2022 (DMLS Ch 9) | high |
| F30 | Brier score & ECE calibration | Brier 1950 + Guo et al. 2017 ICML + Huyen 2022 (DMLS Ch 6) | medium |

---

## Follow-ups Before Implementation

1. **F5, F6, F11, F15 (medium confidence):** Pull physical/PDF copies to confirm exact page numbers for in-code comments and spec docs.
2. **F2 (medium):** Now that DDIA Ch 3+5+8 are on disk (`ScyllaDB-Designing-Data-Intensive-Applications.md`), can cite DDIA Ch 1 §"Describing Load" directly when full book becomes available. Currently still co-cited with SRE book.
3. **F11 (medium):** The product form $Q = \text{spec} \cdot (1 - \text{coup})$ is c1v-specific; write an internal derivation doc that shows how it collapses to Stevens/Myers/Constantine and Bass/Clements/Kazman primitives.
4. **F12 (dependency):** Merge with the separate Crawley-focused agent's deliverable before locking this bibliography.
5. **F14 (implementation note):** When measuring $L^{(p)}_i$ inputs in practice, use HdrHistogram with `recordValues(value, expectedInterval)` to avoid coordinated omission (Tene). The additive $\sum L^{(p)}_i$ form is an **upper-bound approximation** for serial chains and a **lower bound** for parallel chains — document the difference in c1v's math engine.
6. **F16-F21 (DDIA-derived, added 2026-05-04):** ScyllaDB DDIA excerpt provides Ch 3 (Storage and Retrieval), Ch 5 (Replication), Ch 8 (Trouble with Distributed Systems) on disk. For Ch 4 (Encoding and Evolution), Ch 7 (Transactions / ACID isolation), and Ch 9 (Consistency and Consensus / linearizability) we still need the full book — affects future formulas around isolation-level math, two-phase commit cost, and linearizability proof obligations.
7. **F19 (replication lag — qualitative):** Code-comment annotation should mark this as **NOT a closed-form formula** but a *concept* parameterized by deployment topology. The PBS (Bailis 2014) work gives empirical CDFs; consider whether to embed a sample-CDF lookup table for common deployments (Cassandra/Postgres-async/Mongo) into the NFR engine.
8. **F20 (partial synchrony):** Mark all c1v consensus-based recommendations with a **"liveness contingent on partial-synchrony assumption"** disclaimer — this is honest framing for decisions that involve etcd/Spanner/Raft.
9. **F21 (BFT `3f+1`):** Default policy: do NOT recommend BFT unless `D6 industry ∈ {finance, defense, healthcare-pii, supply-chain-provenance}` AND user explicitly requests integrity-over-availability. Cost penalty is real (≥4 replicas).
10. **F22-F30 (DMLS-derived, added 2026-05-04):** Huyen *Designing Machine Learning Systems* (2022) ingested at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/ai-architecture/dmls-book/dmls.md`. Chapter map: Ch 8 (drift) L4473-5037, Ch 9 (continual learning + bandits + A/B) L5038-5481, Ch 6 (calibration) L2998-3878, Ch 1+8 (CACE/Sculley) cross-cutting.
11. **F22 (KS test) is univariate-only.** When monitoring high-dimensional features (image embeddings, sentence embeddings, multivariate sensor streams), default to F23 (MMD). Code path: `nfr-engine-interpreter.ts` should select F22 vs F23 based on feature dimensionality at rule-fire time.
12. **F24 (PSI) origin paper trail is informal.** Used widely in fintech/credit-scoring industry but the canonical bibliography entry is Yurdakul's 2018 PhD dissertation, not a peer-reviewed paper. Document as "industry-canonical, weaker formal trail" in tooltips when M2 NFR engine surfaces PSI as a recommendation.
13. **F25 vs F26 (Thompson Sampling vs UCB1) Pareto pair.** Both fire on the same `experimentation_data_efficiency` criterion in M4 — they are MUTUAL ALTERNATIVES, not stacking choices. Decision rule: Thompson Sampling preferred when reward distribution is Bernoulli-like (CTR, conversion, click-through); UCB1 preferred when distribution is unknown/non-conjugate or when explainability matters (UCB is deterministic, Thompson is randomized).
14. **F28 (Sculley taxonomy) is categorical.** Encode as 9 generic FMEA failure-mode templates in M8.a; specialize per-project via M3 FFBD inputs + M0a CompanySignals. NOT a numeric formula — flag this in code comments to prevent future agents from trying to "compute Sculley score."
15. **F30 (Brier/ECE) gap with industry practice.** Most off-the-shelf models + AutoML pipelines report accuracy/F1, not ECE/Brier. When M2 NFR fires for a high-stakes D6 industry (finance, healthcare, defense, autonomous-systems), flag calibration as a known gap that requires explicit instrumentation.
