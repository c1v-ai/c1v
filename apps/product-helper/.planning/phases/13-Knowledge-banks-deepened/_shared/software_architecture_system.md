Fair. Here’s the **context + what each source is good for + the direct URL**.

Think of this as a **system design reading map**, not just a link dump.

### 1) SLO / SLA / SLI / availability targets

Use these when your question is:

* “What should we measure?”
* “How do we choose 99.9 vs 99.99?”
* “What’s the difference between an SLI, SLO, and SLA?”
* “How do we turn reliability into an engineering decision?”

The best starting point is Google SRE. It defines an **SLO** as a target for a measured service level, and it frames reliability around user-visible indicators like **latency, error rate, throughput/traffic, and availability**. The workbook is the practical follow-up: how to actually choose and implement SLOs, and how to alert on them without noise. ([Google SRE][1])

URLs:

```text
https://sre.google/sre-book/service-level-objectives/
https://sre.google/sre-book/monitoring-distributed-systems/
https://sre.google/workbook/implementing-slos/
https://sre.google/workbook/alerting-on-slos/
https://sre.google/sre-book/table-of-contents/
```

How to use them:

* Open **Service Level Objectives** first for the vocabulary.
* Open **Monitoring Distributed Systems** when choosing what to instrument.
* Open **Implementing SLOs** when you need to translate business importance into real targets.

---

### 2) Reliability / resiliency / scalability / recovery / graceful degradation

Use these when your question is:

* “How do I design for failures?”
* “What should I do about backups, failover, and recovery?”
* “How should I think about scaling and performance tradeoffs?”
* “What architecture questions should I ask before building?”

The cloud well-architected frameworks are the best practical architecture checklists. AWS explicitly positions its framework as a way to understand the **pros and cons of architectural decisions**. Google’s framework is strong on reliability concepts like redundancy and recovery, and Azure is strong on tying reliability to **measurable targets** instead of vague goals. ([AWS Documentation][2])

URLs:

```text
https://aws.amazon.com/architecture/well-architected/
https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html
https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html
https://docs.aws.amazon.com/pdfs/wellarchitected/latest/framework/wellarchitected-framework.pdf

https://docs.cloud.google.com/architecture/framework
https://docs.cloud.google.com/architecture/framework/reliability
https://docs.cloud.google.com/architecture

https://learn.microsoft.com/en-us/azure/well-architected/
https://learn.microsoft.com/en-us/azure/well-architected/reliability/principles
https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics
```

How to use them:

* Use these as your **architecture decision checklist**.
* They are best for tradeoffs like:

  * stateless vs stateful services
  * active-active vs active-passive
  * backup frequency and restore expectations
  * horizontal scaling vs vertical scaling
  * queueing / retry / circuit breaker patterns
  * graceful degradation when dependencies fail

---

### 3) CAP theorem

Use this when your question is specifically:

* “During a network partition, do I prefer consistency or availability?”
* “What behavior do I want in distributed writes/reads when nodes can’t talk to each other?”

CAP is **not** a full system design framework. It is a narrower theorem about tradeoffs in distributed systems under partition. The Gilbert–Lynch paper is the formal proof. Brewer’s later follow-up is more useful for practical intuition. ([Google SRE][1])

URLs:

```text
https://dl.acm.org/doi/10.1145/564585.564601
https://www.cs.princeton.edu/courses/archive/spr22/cos418/papers/cap.pdf
https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf
https://dspace.mit.edu/handle/1721.1/79112
```

How to use it:

* Use CAP when designing:

  * distributed databases
  * replicated services
  * multi-region write paths
  * offline sync conflict behavior
* Do **not** use CAP as the master framework for everything. It won’t answer questions like SLO design, auth, backups, or operational complexity.

A good intuition:

* CAP helps answer: **what happens when the network breaks**
* SRE helps answer: **what users should experience**
* Well-Architected helps answer: **how to design the system overall**

---

### 4) Authentication / login / identity assurance

Use these when your question is:

* “Should I use passwords, passkeys, MFA, SSO?”
* “What assurance level do I need?”
* “What are the real differences between OAuth, OIDC, and SAML?”
* “How strong should login be for this system?”

NIST SP 800-63-4 is the best authoritative starting point. It covers the digital identity model, risk assessment, and assurance levels for **identity proofing, authentication, and federation**. The 63B volume is the one to open for remote user authentication and authenticator requirements. ([NIST Pages][3])

URLs:

```text
https://pages.nist.gov/800-63-4/
https://pages.nist.gov/800-63-4/sp800-63.html
https://pages.nist.gov/800-63-4/sp800-63b.html
https://csrc.nist.gov/pubs/sp/800/63/4/final
```

How to use it:

* Open this first when deciding:

  * password-only vs MFA vs passkeys
  * session and credential assurance
  * identity proofing requirements
  * federation trust assumptions

---

### 5) OAuth vs OIDC vs SAML

Use these when your question is:

* “How should users log in?”
* “How should one system grant access to another?”
* “What should I use for enterprise SSO?”
* “What protocol fits my app?”

The clean split is:

* **OAuth 2.0** = authorization
* **OpenID Connect** = authentication layer on top of OAuth 2.0
* **SAML 2.0** = older but still very common enterprise federation / SSO standard

These are the canonical references. ([NIST Pages][3])

URLs:

```text
https://datatracker.ietf.org/doc/html/rfc6749
https://www.rfc-editor.org/info/rfc6749
https://oauth.net/2/

https://openid.net/specs/openid-connect-core-1_0.html

https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html
https://www.oasis-open.org/standard/saml/
```

How to use them:

* Use **OIDC** for most modern web/mobile app sign-in.
* Use **OAuth** when granting one app limited access to another app’s resources.
* Use **SAML** when you’re integrating with older or enterprise-heavy identity environments.

---

### 6) RBAC / authorization

Use these when your question is:

* “How should permissions be modeled?”
* “Should we assign permissions to users directly or to roles?”
* “How do we think clearly about authorization?”

NIST’s RBAC material is the authoritative baseline. It defines RBAC as assigning permitted actions to **roles** rather than directly to individual identities, and the NIST project page gives the standards background and implementation context. ([NIST Computer Security Resource Center][4])

URLs:

```text
https://csrc.nist.gov/projects/role-based-access-control
https://csrc.nist.gov/projects/role-based-access-control/publications
https://csrc.nist.gov/glossary/term/role_based_access_control
https://csrc.nist.gov/csrc/media/projects/role-based-access-control/documents/sandhu96.pdf
https://csrc.nist.gov/files/pubs/journal/2010/06/adding-attributes-to-rolebased-access-control/final/docs/kuhn-coyne-weil-10.pdf
```

How to use it:

* Start with RBAC when your permissions are mostly organizational:

  * admin
  * manager
  * editor
  * support agent
* If rules become highly contextual, dynamic, or attribute-heavy, that’s usually a signal you may need more than plain RBAC.

---

### 7) Practical auth + authorization engineering

Use these when your question is:

* “What are the common implementation mistakes?”
* “How do I make login and authorization safer in practice?”
* “What do engineers usually screw up?”

OWASP is not a formal standards body, but it is one of the best concise engineering references for actual implementation. The auth cheat sheet helps with login/MFA/session design; the authorization cheat sheet helps with safe permission checks and policy enforcement. ([NIST Computer Security Resource Center][4])

URLs:

```text
https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
https://cheatsheetseries.owasp.org/index.html
https://owasp.org/www-project-cheat-sheets/
```

How to use them:

* Pair OWASP with NIST:

  * **NIST** for “what level of assurance do I need?”
  * **OWASP** for “how do I implement it safely?”

---

### 8) Offline / bad network / sync behavior

Use these when your question is:

* “What should happen if the user loses network?”
* “How do I design offline login or offline data capture?”
* “How do sync and local storage change the architecture?”

These Microsoft offline docs are useful because they explain the offline-first pattern clearly: local device data, offline usage, then synchronization when connectivity returns. ([AWS Documentation][2])

URLs:

```text
https://learn.microsoft.com/en-us/power-apps/mobile/mobile-offline-overview
https://learn.microsoft.com/en-us/power-apps/mobile/mobile-offline-works-overview
https://learn.microsoft.com/en-us/power-apps/mobile/setup-mobile-offline
https://learn.microsoft.com/en-us/power-apps/mobile/work-in-offline-mode
```

How to use them:

* These are good for thinking through:

  * cached credentials vs forced online auth
  * local writes and conflict resolution
  * sync retries and merge behavior
  * what the user can still do when disconnected

---

### If you want the smallest serious reading set

If I were building a **tight personal system design library**, I’d start with these 10:

```text
https://sre.google/sre-book/service-level-objectives/
https://sre.google/sre-book/monitoring-distributed-systems/
https://sre.google/workbook/implementing-slos/
https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
https://docs.cloud.google.com/architecture/framework/reliability
https://pages.nist.gov/800-63-4/
https://pages.nist.gov/800-63-4/sp800-63b.html
https://datatracker.ietf.org/doc/html/rfc6749
https://openid.net/specs/openid-connect-core-1_0.html
https://csrc.nist.gov/projects/role-based-access-control
```

That set covers almost all of the topics you named: **availability targets, latency, throughput, reliability, resiliency, auth, federation, and RBAC**. ([Google SRE][1])

### Summary

* **Google SRE** is your best source for **SLO/SLA/SLI, latency, throughput, monitoring, and alerting**. ([Google SRE][1])
* **Well-Architected** frameworks are your best practical source for **scalability, resiliency, backups, recovery, and architecture tradeoffs**. ([AWS Documentation][2])
* **CAP** is useful, but only for **distributed consistency vs availability under partition**, not for all system design. ([NIST Computer Security Resource Center][5])
* **NIST 800-63-4** is the best anchor for **authentication and identity assurance**. ([NIST Pages][3])
* **NIST RBAC + OWASP** gives you the cleanest combo for **permission modeling plus implementation guidance**. ([NIST Computer Security Resource Center][4])

Quick check questions:

1. Which source would you open first for deciding **99.9 vs 99.99 uptime**?
2. Which source would you open first for deciding **OIDC vs SAML**?
3. Which source would you open first for deciding what happens when **two replicas lose contact**?

I can also turn this into a **decision tree** like: “If the question is X, open Y first.”

[1]: https://sre.google/sre-book/service-level-objectives/?utm_source=chatgpt.com "Defining slo: service level objective meaning"
[2]: https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html?utm_source=chatgpt.com "AWS Well-Architected Framework"
[3]: https://pages.nist.gov/800-63-4/sp800-63.html?utm_source=chatgpt.com "NIST Special Publication 800-63-4"
[4]: https://csrc.nist.gov/projects/role-based-access-control?utm_source=chatgpt.com "Role Based Access Control | CSRC"
[5]: https://csrc.nist.gov/csrc/media/projects/role-based-access-control/documents/sandhu96.pdf?utm_source=chatgpt.com "Role-Based Access Control Models"
