/**
 * nav-config tests — v2.1 nav rewrite + back-compat contracts.
 *
 * Anchored to the spec at .claude/plans/team-spawn-prompts-v2.1.md §TA2
 * (`nav-and-pages` agent):
 *   - Recommendation top-level entry exists.
 *   - Decision Matrix and Decision Network coexist as siblings (no rename).
 *   - FMEA promoted into nav (D-V21.15).
 *   - Diagrams route deprecated-not-deleted; `hasDiagrams` flag preserved.
 *   - Infrastructure absorbed into Tech Stack (no standalone entry).
 *   - New routes: data-flows, open-questions, form-function-map, decision-network.
 *   - `isNavItemActive` honors exact + prefix + child-recursion.
 */

import { describe, it, expect } from '@jest/globals';

import {
  getProjectNavItems,
  isNavItemActive,
  type NavItem,
} from '../nav-config';

const PROJECT_ID = 42;

function flatten(items: NavItem[]): NavItem[] {
  const acc: NavItem[] = [];
  for (const it of items) {
    acc.push(it);
    if (it.children) acc.push(...flatten(it.children));
  }
  return acc;
}

function findByName(items: NavItem[], name: string): NavItem | undefined {
  return flatten(items).find((it) => it.name === name);
}

describe('getProjectNavItems', () => {
  const items = getProjectNavItems(PROJECT_ID);

  it('exposes a top-level Recommendation entry pointing at /synthesis', () => {
    const rec = items.find((it) => it.name === 'Recommendation');
    expect(rec).toBeDefined();
    expect(rec?.href).toBe(`/projects/${PROJECT_ID}/synthesis`);
    expect(rec?.dataKey).toBe('hasRecommendation');
  });

  it('keeps Decision Matrix unchanged and adds Decision Network as a sibling', () => {
    const matrix = findByName(items, 'Decision Matrix');
    const network = findByName(items, 'Decision Network');
    expect(matrix?.href).toBe(
      `/projects/${PROJECT_ID}/system-design/decision-matrix`,
    );
    expect(matrix?.dataKey).toBe('hasDecisionMatrix');
    expect(network?.href).toBe(
      `/projects/${PROJECT_ID}/system-design/decision-network`,
    );
    expect(network?.dataKey).toBe('hasDecisionNetwork');
  });

  it('promotes FMEA into the System Architecture nav (D-V21.15)', () => {
    const fmea = findByName(items, 'FMEA');
    expect(fmea?.href).toBe(`/projects/${PROJECT_ID}/system-design/fmea`);
    expect(fmea?.dataKey).toBe('hasFmea');
  });

  it('keeps Diagrams as a deprecated-not-deleted top-level entry', () => {
    const diagrams = items.find((it) => it.name === 'Diagrams');
    expect(diagrams).toBeDefined();
    expect(diagrams?.href).toBe(`/projects/${PROJECT_ID}/diagrams`);
    expect(diagrams?.dataKey).toBe('hasDiagrams');
    expect(diagrams?.deprecated).toBe(true);
  });

  it('absorbs Infrastructure into Tech Stack (no standalone Infrastructure entry)', () => {
    const infra = findByName(items, 'Infrastructure');
    expect(infra).toBeUndefined();
    const techStack = findByName(items, 'Tech Stack');
    expect(techStack?.href).toBe(`/projects/${PROJECT_ID}/requirements/tech-stack`);
  });

  it('adds Data Flows + Open Questions under Scope & Requirements', () => {
    const dataFlows = findByName(items, 'Data Flows');
    const openQ = findByName(items, 'Open Questions');
    expect(dataFlows?.href).toBe(
      `/projects/${PROJECT_ID}/requirements/data-flows`,
    );
    expect(openQ?.href).toBe(
      `/projects/${PROJECT_ID}/requirements/open-questions`,
    );
  });

  it('adds Form-Function Map under System Architecture', () => {
    const ffm = findByName(items, 'Form-Function Map');
    expect(ffm?.href).toBe(
      `/projects/${PROJECT_ID}/system-design/form-function-map`,
    );
    expect(ffm?.dataKey).toBe('hasFormFunctionMap');
  });

  it('does NOT rename Decision Matrix to Decision Network (both must coexist)', () => {
    const sysArch = items.find((it) => it.name === 'System Architecture');
    const childNames = sysArch?.children?.map((c) => c.name) ?? [];
    expect(childNames).toContain('Decision Matrix');
    expect(childNames).toContain('Decision Network');
  });
});

describe('isNavItemActive', () => {
  const items = getProjectNavItems(PROJECT_ID);

  it('Diagrams stays navigable for legacy projects (back-compat)', () => {
    // Simulates a legacy project whose only architectural data is in
    // extractedData.diagrams.* — the route still resolves under prefix match.
    const diagrams = items.find((it) => it.name === 'Diagrams')!;
    expect(
      isNavItemActive(diagrams, `/projects/${PROJECT_ID}/diagrams`),
    ).toBe(true);
    expect(
      isNavItemActive(diagrams, `/projects/${PROJECT_ID}/diagrams/foo`),
    ).toBe(true);
  });

  it('Synthesis page is reachable when no synthesis row exists yet', () => {
    // The empty-state UX is reached by routing to `/synthesis` regardless of
    // backing data — so the nav item must be active on that path.
    const rec = items.find((it) => it.name === 'Recommendation')!;
    expect(
      isNavItemActive(rec, `/projects/${PROJECT_ID}/synthesis`),
    ).toBe(true);
  });

  it('honors exact match for Overview', () => {
    const overview = items.find((it) => it.name === 'Overview')!;
    expect(isNavItemActive(overview, `/projects/${PROJECT_ID}`)).toBe(true);
    expect(
      isNavItemActive(overview, `/projects/${PROJECT_ID}/requirements`),
    ).toBe(false);
  });

  it('parent-without-href is active when any child matches', () => {
    const sysArch = items.find((it) => it.name === 'System Architecture')!;
    expect(sysArch.href).toBeUndefined();
    expect(
      isNavItemActive(sysArch, `/projects/${PROJECT_ID}/system-design/fmea`),
    ).toBe(true);
    expect(
      isNavItemActive(
        sysArch,
        `/projects/${PROJECT_ID}/system-design/decision-network`,
      ),
    ).toBe(true);
    expect(
      isNavItemActive(sysArch, `/projects/${PROJECT_ID}/connections`),
    ).toBe(false);
  });
});
