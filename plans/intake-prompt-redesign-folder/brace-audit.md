# Brace-bug Audit (step 0.5a)

Audit of agent files for the buggy `replace(/\}/g, '}')` no-op pattern (which fails to double-up `}` for downstream prompt template processors). Correct fix is `'}}'`.

## Audit Date

2026-05-02

## Method

Grep each target file for:
- `escapeBraces` helper definitions
- Any `.replace(...)` call referencing `{` or `}`

## Results

| File | Line | Current Pattern | Buggy? | Fixed in this PR? |
|---|---|---|---|---|
| `lib/langchain/agents/tech-stack-agent.ts` | n/a | No `escapeBraces`; uses `.replace('{placeholder}', value)` template substitution only | No | n/a |
| `lib/langchain/agents/user-stories-agent.ts` | n/a | No brace replace pattern at all | No | n/a |
| `lib/langchain/agents/schema-extraction-agent.ts` | 376 | `.replace(/\s+/g, '_')` (whitespace, not braces) | No | n/a |
| `lib/langchain/agents/api-spec-agent.ts` | n/a | No `escapeBraces`; uses `.replace('{placeholder}', value)` template substitution only | No | n/a |
| `lib/langchain/agents/infrastructure-agent.ts` | n/a | No `escapeBraces`; uses `.replace('{placeholder}', value)` template substitution only | No | n/a |
| `lib/langchain/agents/guidelines-agent.ts` | n/a | No brace replace pattern at all | No | n/a |
| `lib/langchain/agents/qfd-agent.ts` | 139 | `str.replace(/\{/g, '{{').replace(/\}/g, '}')` | **YES** (no-op `}` → `}`) | **No — deferred** to step 5 of main rewrite |
| `lib/langchain/agents/interfaces-agent.ts` | 124 | `str.replace(/\{/g, '{{').replace(/\}/g, '}')` | **YES** (no-op `}` → `}`) | **No — deferred** to step 5 of main rewrite |

## Findings

1. **No backend agent has the brace-escape bug.** The 6 backend agents (`tech-stack`, `user-stories`, `schema-extraction`, `api-spec`, `infrastructure`, `guidelines`) do not use the `escapeBraces` helper at all. They use simple template-string substitution `.replace('{placeholder}', value)` which is unrelated to LangChain prompt-template brace escaping.
2. **Only `qfd-agent.ts:139` and `interfaces-agent.ts:124` have the bug** — both call `.replace(/\}/g, '}')` (no-op single closing brace) instead of `.replace(/\}/g, '}}')` (correct double-up).
3. **Per plan instructions, these two are NOT fixed in this PR** — they are deferred to step 5 of the main rewrite where the agents are rewritten end-to-end.

## Conclusion

Zero brace-bug fixes applied in this PR. The audit confirms the bug is isolated to two files (qfd-agent, interfaces-agent), both already known and tracked in the main rewrite plan.
