## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ⚡ Performance improvement
- [ ] ♻️ Code refactoring
- [ ] 🧪 Test addition or update
- [ ] 🔧 Configuration change

## Related Issues

<!-- Link related issues, e.g., "Closes #123" or "Relates to #456" -->

Closes #

## Changes Made

<!-- List the key changes made in this PR -->

-
-
-

## Testing

<!-- Describe the tests you ran and how to reproduce them -->

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

### Test Steps

1.
2.
3.

### Test Results

<!-- Paste relevant test output or screenshots -->

```
# Example: paste test output here
```

## Documentation

<!-- Check all that apply -->

- [ ] Updated relevant README files
- [ ] Updated API documentation
- [ ] Updated agent instructions (.claude/teams/)
- [ ] Created/updated ADR (if architecture change)
- [ ] Updated CHANGELOG.md
- [ ] Added code comments for complex logic
- [ ] Updated environment variable documentation

## Screenshots/Videos

<!-- If applicable, add screenshots or videos to demonstrate changes -->

## Checklist

<!-- Ensure all items are checked before requesting review -->

### Code Quality
- [ ] Code follows project style guidelines
- [ ] TypeScript types are properly defined
- [ ] No console.log or debug code left in
- [ ] Error handling is implemented
- [ ] Code is DRY (Don't Repeat Yourself)

### Testing
- [ ] All tests pass locally
- [ ] Test coverage maintained or improved
- [ ] Edge cases are covered

### Documentation
- [ ] CHANGELOG.md updated (unless `skip-changelog` label)
- [ ] Relevant documentation updated
- [ ] Comments added for complex logic

### Security
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] Dependencies are secure (no known vulnerabilities)

### Performance
- [ ] No unnecessary re-renders (React)
- [ ] Database queries optimized
- [ ] No N+1 query issues
- [ ] Bundle size impact considered

### Accessibility
- [ ] ARIA labels added where needed
- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Screen reader tested (if UI change)

## Breaking Changes

<!-- If this is a breaking change, describe the impact and migration path -->

**Impact:**

**Migration Path:**

## Deployment Notes

<!-- Any special deployment considerations? -->

- [ ] Database migration required
- [ ] Environment variables added/changed
- [ ] External service configuration needed
- [ ] Cache needs to be cleared
- [ ] Other (describe):

## Rollback Plan

<!-- How to rollback if this PR causes issues in production -->

## Agent Team Review

<!-- Tag relevant agent teams for review -->

Requesting review from:
- [ ] @platform-engineering-team
- [ ] @frontend-team
- [ ] @ai-agents-team
- [ ] @data-infrastructure-team
- [ ] @product-planning-team
- [ ] @quality-docs-team

## Additional Context

<!-- Add any other context about the PR here -->

---

## Reviewer Guidelines

### What to Look For

1. **Correctness:** Does the code do what it claims?
2. **Testing:** Are there adequate tests?
3. **Documentation:** Is it well-documented?
4. **Performance:** Any performance concerns?
5. **Security:** Any security issues?
6. **Maintainability:** Is the code maintainable?

### Approval Criteria

- ✅ All CI checks pass
- ✅ Code review approval from at least 1 team member
- ✅ Documentation updated
- ✅ Tests pass and coverage maintained
- ✅ No unresolved comments
