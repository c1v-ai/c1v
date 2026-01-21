# Phase 2: Critical Security Fixes - UAT

**Phase:** 02-critical-security-fixes
**Created:** 2026-01-19
**Status:** In Progress

---

## Test Cases

### Test 1: Environment Validation - AUTH_SECRET Check
**Type:** Developer verification
**Steps:**
1. Create a file `.env.test-short-secret` with `AUTH_SECRET=short` (less than 32 chars)
2. Run: `AUTH_SECRET=short npm run build 2>&1 | head -30`
3. Observe build failure with message about AUTH_SECRET length

**Expected:** Build fails with error containing "AUTH_SECRET must be at least 32 characters"
**Result:** [ ] pass / [ ] fail

---

### Test 2: Password Hash Not Exposed in /api/user
**Type:** API verification
**Steps:**
1. Start dev server: `npm run dev`
2. Log in to the application
3. Open browser DevTools → Network tab
4. Refresh page and find the `/api/user` request
5. Inspect the response body

**Expected:** Response contains user data (id, email, etc.) but NO `passwordHash` field
**Result:** [ ] pass / [ ] fail

---

### Test 3: Database SSL Configuration (Code Review)
**Type:** Code inspection
**Steps:**
1. Open `lib/db/drizzle.ts`
2. Verify SSL configuration exists for production

**Expected:**
- SSL is enabled when `NODE_ENV === 'production'`
- `rejectUnauthorized: true` is set
- Connection pooling is configured (max, idle_timeout, connect_timeout)
**Result:** [ ] pass / [ ] fail

---

## Summary

| Test | Description | Result |
|------|-------------|--------|
| 1 | Environment validation fails on short AUTH_SECRET | |
| 2 | /api/user doesn't expose passwordHash | |
| 3 | Database SSL configured for production | |

---

**Overall:** [ ] PASS / [ ] FAIL
