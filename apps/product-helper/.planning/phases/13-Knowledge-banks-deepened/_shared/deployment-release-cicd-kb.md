# Deployment & Release Engineering — CI/CD, Deployment Strategies, and GitOps

## Context (Why This Matters)

Getting code from a developer's machine into production — safely, quickly, and repeatably — is one of the most operationally critical parts of running a system. A bad deployment can take down your entire service. A slow deployment process means features take weeks to reach users. Modern release engineering automates the risky parts and provides safety nets so that teams can deploy frequently (multiple times per day) with confidence.

The journey from idea to production follows a pipeline:

```
Idea → Code → Automated Tests (CI) → Human Review (CD) → Deploy to Production → Monitor
```

---

## Continuous Integration (CI)

CI is the practice of automatically testing every code change as soon as it's committed. The goal is to find bugs **immediately**, not weeks later when they've become entangled with other changes.

### The Automated Testing Suite

Tests run in order of speed and scope — fail fast on cheap tests before running expensive ones:

| Test Type | What It Checks | Speed | Example |
|-----------|---------------|-------|---------|
| **Unit tests** | Individual functions or components in isolation | Fastest (ms) | "Does the `calculateTotal()` function return the correct sum?" |
| **Integration tests** | Multiple components working together | Medium (seconds) | "Does the API endpoint correctly write to the database and return the result?" |
| **Regression tests** | New code hasn't broken existing functionality | Medium-slow | "Did the new wishlist feature break the shopping cart?" |
| **E2E tests** | Full user flows through the entire system | Slowest (minutes) | "Can a user sign up, add items to cart, and complete checkout?" |

### Additional CI Checks

| Check | Purpose |
|-------|---------|
| **Linting / formatting** | Enforce code style consistency |
| **Type checking** | Catch type errors at compile time (TypeScript, etc.) |
| **Security scanning** | Detect known vulnerabilities in dependencies (Snyk, Dependabot) |
| **Build verification** | Confirm the application compiles and bundles successfully |
| **Code coverage** | Measure what percentage of code is exercised by tests (target: 80–90%) |

### CI Best Practices

- Run CI on **every pull request** — no code merges without passing CI
- Keep the CI pipeline **fast** (under 10 minutes) — slow pipelines discourage frequent commits
- **Fail fast** — run the fastest checks (lint, type check, unit tests) first
- Fix broken builds **immediately** — a broken main branch blocks everyone

---

## Continuous Delivery vs Continuous Deployment

| | Continuous Delivery | Continuous Deployment |
|---|---|---|
| **Definition** | Code is always in a deployable state. A human makes the final decision to release. | Code is automatically deployed to production if all tests pass. No human approval needed. |
| **Deploy trigger** | Human pushes a button | Fully automated |
| **Risk tolerance** | Lower — human checkpoint catches edge cases | Higher — requires extreme confidence in test suite |
| **Common at** | Most companies (banks, healthcare, regulated industries) | High-maturity engineering orgs (Netflix, Facebook, small startups) |

**The spectrum:**
```
Manual deployment ← Continuous Delivery ← Continuous Deployment
  (least automated)                          (fully automated)
```

### The Human Checkpoint (QA / UAT)

Before deployment, code typically goes to a **staging environment** — a copy of production that only internal users can access.

| Stage | Who | What They Check |
|-------|-----|-----------------|
| **QA (Quality Assurance)** | QA engineers | Does the feature work correctly? Edge cases? Cross-browser? |
| **UAT (User Acceptance Testing)** | Product managers, stakeholders | Does this actually solve the user's problem? Does it match the user story? |

---

## Deployment Strategies

How you roll out new code to production determines your risk exposure and rollback speed.

### 1. Big Bang (All-at-Once)

```
All servers updated simultaneously
  Old version ████████ → New version ████████
```

| Pros | Cons |
|------|------|
| Simple | Maximum risk — if it breaks, everything breaks |
| Fast | No gradual validation |

**When to use:** Small applications, development environments, or when downtime is acceptable.

### 2. Rolling Deployment

```
Servers updated one at a time (or in batches):
  Server 1: New ██  Server 2: Old ██  Server 3: Old ██  Server 4: Old ██
  Server 1: New ██  Server 2: New ██  Server 3: Old ██  Server 4: Old ██
  Server 1: New ██  Server 2: New ██  Server 3: New ██  Server 4: Old ██
  Server 1: New ██  Server 2: New ██  Server 3: New ██  Server 4: New ██
```

| Pros | Cons |
|------|------|
| Zero downtime | Old and new versions run simultaneously during rollout — must handle compatibility |
| Gradual — can stop if problems detected | Rollback requires re-rolling through all servers |

**When to use:** Default for most production deployments (Kubernetes rolling updates).

### 3. Blue/Green Deployment

```
Blue (current): ████████ ← all traffic
Green (new):    ████████ ← idle, fully deployed and tested

Switch: traffic moves from Blue to Green instantly
Blue (old):     ████████ ← idle (kept for instant rollback)
Green (current):████████ ← all traffic
```

| Pros | Cons |
|------|------|
| Instant rollback — just switch traffic back to Blue | Requires double the infrastructure (two full environments) |
| Zero downtime | Database migrations must be backward-compatible |
| New version is fully tested before receiving traffic | Cost |

**When to use:** High-risk deployments, regulated environments, or when instant rollback is critical.

### 4. Canary Release

```
Phase 1: 1% of traffic → new version, 99% → old version
  Monitor error rates, latency, business metrics
Phase 2: 10% → new version (if Phase 1 looks good)
Phase 3: 50% → new version
Phase 4: 100% → new version (full rollout)
```

| Pros | Cons |
|------|------|
| Minimal risk — problems affect only a small percentage of users | Slower rollout |
| Real production traffic validates the new version | Requires traffic splitting infrastructure |
| Data-driven promotion decisions | Old and new versions must be compatible |

**When to use:** High-traffic systems where even small bugs have large blast radius. Standard practice at Netflix, Google, Facebook.

### 5. Feature Flags (Dark Launches)

```
New code is deployed to all servers but hidden behind a flag:
  if (featureFlags.isEnabled("wishlist", userId)) {
    showWishlist();
  }
```

| Pros | Cons |
|------|------|
| Decouple deployment from release — deploy anytime, enable when ready | Flag management complexity — stale flags accumulate |
| Target specific users (beta testers, internal, % rollout) | Code paths multiply (old + new for every flag) |
| Instant disable — flip the flag off without redeploying | Must clean up flags after full rollout |

**When to use:** Gradual feature rollouts, A/B testing, kill switches for risky features. Often combined with canary releases.

### Strategy Comparison

| Strategy | Risk | Rollback Speed | Infrastructure Cost | Complexity |
|----------|------|---------------|-------------------|------------|
| **Big bang** | High | Slow (redeploy) | Low | Low |
| **Rolling** | Medium | Medium (re-roll) | Low | Low |
| **Blue/green** | Low | Instant (traffic switch) | High (2x) | Medium |
| **Canary** | Very low | Fast (route away) | Medium | High |
| **Feature flags** | Very low | Instant (flip flag) | Low | Medium |

---

## Database Migrations

Database schema changes are the hardest part of deployment because they can't be easily rolled back.

### Zero-Downtime Migration Pattern

1. **Add new column** (nullable or with default) — old code ignores it
2. **Deploy new code** that writes to both old and new columns
3. **Backfill** existing data into the new column
4. **Deploy code** that reads from the new column
5. **Remove old column** (only after confirming no code reads it)

**Rule:** Never make a breaking schema change in a single deployment. Always use a multi-step expand-and-contract pattern.

---

## GitOps

GitOps extends CI/CD by using a Git repository as the **single source of truth** for both application code and infrastructure configuration.

### How GitOps Works

```
Git Repository (source of truth)
  ├── Application code
  ├── Kubernetes manifests / Terraform configs
  └── Environment configurations

GitOps Operator (ArgoCD, Flux) continuously:
  1. Watches the Git repo for changes
  2. Compares desired state (Git) vs actual state (live environment)
  3. Automatically reconciles any drift
```

| Benefit | How |
|---------|-----|
| **Auditability** | Every change is a Git commit — who changed what, when, and why |
| **Reproducibility** | Entire environment can be recreated from the repo |
| **Drift detection** | Automated operator corrects any manual changes to the live environment |
| **Rollback** | Revert a Git commit to roll back infrastructure changes |

**Technologies:** ArgoCD, Flux (Kubernetes), Terraform (infrastructure as code)

---

## The Full CI/CD Pipeline

```
Developer commits code
    ↓
CI Pipeline (automated):
  1. Lint + format check
  2. Type check
  3. Unit tests
  4. Integration tests
  5. Security scan
  6. Build
  7. Code coverage report
    ↓
Pull Request review (human)
    ↓
Merge to main branch
    ↓
CD Pipeline:
  1. Deploy to staging
  2. QA / UAT (human verification)
  3. Approval gate (continuous delivery) or auto-deploy (continuous deployment)
    ↓
Production deployment (canary / blue-green / rolling)
    ↓
Post-deploy monitoring:
  - Error rate, latency, business metrics
  - Automatic rollback if SLO breach detected
```

---

## Decision Framework

When designing the deployment pipeline:

1. **Set up CI** with automated tests on every PR. Keep it under 10 minutes.
2. **Choose delivery vs deployment:** Continuous delivery (human approval) for most teams. Continuous deployment only with mature test suites and monitoring.
3. **Choose a deployment strategy:** Rolling (default), canary (high-traffic), blue/green (high-risk), feature flags (gradual rollout).
4. **Handle database migrations** with the expand-and-contract pattern — never break backward compatibility in one step.
5. **Monitor post-deploy:** Watch error rates, latency, and business metrics. Set up automatic rollback triggers.
6. **Consider GitOps** for infrastructure management — Git as the single source of truth for both code and infra.

## Validation Checklist

- [ ] I can explain the difference between CI, continuous delivery, and continuous deployment.
- [ ] I can describe the automated testing pyramid (unit → integration → regression → E2E).
- [ ] I can explain code coverage and why 100% is not always the goal.
- [ ] I can describe and compare deployment strategies: big bang, rolling, blue/green, canary, feature flags.
- [ ] I can explain the trade-offs of each strategy (risk, rollback speed, cost, complexity).
- [ ] I can describe the zero-downtime database migration pattern (expand and contract).
- [ ] I can explain GitOps and how it uses Git as the source of truth for infrastructure.
- [ ] I can sketch a complete CI/CD pipeline from commit to production monitoring.
- [ ] I understand that deployment and release are separate concerns (feature flags decouple them).
