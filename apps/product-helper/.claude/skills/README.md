# Skills Library

This directory contains skill files that provide domain-specific best practices and patterns for the product-helper codebase. These skills are designed to be referenced by planning agents and developers.

## Available Skills

| Skill | Description | Key Topics |
|-------|-------------|------------|
| [nextjs-best-practices.md](./nextjs-best-practices.md) | Next.js 15 App Router patterns | Server/Client Components, Data Fetching, File Organization |
| [langchain-patterns.md](./langchain-patterns.md) | LangChain.js and LangGraph patterns | State Management, Nodes, Streaming, Testing |
| [testing-strategies.md](./testing-strategies.md) | Testing with Vitest/Jest and RTL | Unit Tests, Component Tests, Mocking, Coverage |
| [database-patterns.md](./database-patterns.md) | Drizzle ORM with PostgreSQL | Schemas, Queries, Migrations, Transactions |
| [api-design.md](./api-design.md) | Next.js API route patterns | Validation, Error Handling, Auth, Rate Limiting |

## Related Skills (Root Level)

The monorepo root also contains skills that apply across all apps:

| Skill | Location | Description |
|-------|----------|-------------|
| react-best-practices.md | `/.claude/skills/` | React performance patterns (from Vercel Labs) |

## How to Use Skills

### For Planning Agents

Planning agents (like `gsd-planner`) should reference relevant skills when creating phase plans:

```markdown
<context>
@.claude/skills/nextjs-best-practices.md
@.claude/skills/testing-strategies.md
</context>
```

### For Developers

When working on a feature, reference the appropriate skill file to follow established patterns:

1. **Building UI components** → `nextjs-best-practices.md` + `react-best-practices.md`
2. **Implementing LangGraph workflows** → `langchain-patterns.md`
3. **Writing tests** → `testing-strategies.md`
4. **Database operations** → `database-patterns.md`
5. **API routes** → `api-design.md`

## Skill File Structure

Each skill file follows this structure:

```markdown
# Skill Name

Brief description of the skill's purpose.

## Section 1: [Topic]
### Pattern/Rule Name
**Bad:** (anti-pattern example)
**Good:** (recommended pattern)

## Section 2: [Topic]
...

## References
- Links to relevant code in the codebase
- External documentation
```

## Contributing New Skills

When adding a new skill:

1. **Create the skill file** in this directory with a descriptive name
2. **Follow the structure** shown above
3. **Include code examples** from the actual codebase when possible
4. **Add tests** to validate the skill file exists and has expected sections
5. **Update this README** to include the new skill in the table
6. **Reference the skill** in relevant agent files

### Skill File Checklist

- [ ] Clear, actionable title
- [ ] Brief overview paragraph
- [ ] Organized sections by topic
- [ ] Good/Bad code examples
- [ ] References to actual codebase files
- [ ] No broken internal links

## Testing Skills

Skills are validated by the test suite to ensure:

- All expected skill files exist
- Files are not empty
- Files contain expected sections
- No broken file references

Run tests with:

```bash
npm test -- skills
```

## Maintenance

Skills should be updated when:

- New patterns are established in the codebase
- Libraries are upgraded (e.g., Next.js 15 → 16)
- Anti-patterns are discovered
- Better approaches are found

Keep skills concise and focused on patterns that are actually used in the codebase.
