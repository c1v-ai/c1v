/**
 * N2MatrixTab structural test (jest testEnvironment: 'node').
 * Uses react-dom/server.renderToStaticMarkup to produce HTML and assert
 * against the rendered output. No DOM/jsdom required.
 */

import { describe, it, expect } from '@jest/globals';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { N2MatrixTab } from '@/components/system-design/n2-matrix-tab';
import type { N2Matrix } from '@/lib/langchain/schemas/module-7-interfaces/n2-matrix';

const fixture: N2Matrix = {
  _schema: 'module-7.n2-matrix.v1',
  _output_path: 'system-design/kb-upgrade-v2/module-7/n2_matrix.v1.json',
  _upstream_refs: { ffbd: 'ffbd.v1.json', data_flows: 'data_flows.v1.json' },
  produced_at: '2026-04-25T00:00:00Z',
  produced_by: 'test-fixture',
  system_name: 'Test System',
  functions_axis: ['F.1', 'F.2', 'F.3'],
  rows: [
    {
      id: 'IF.01',
      producer: 'F.1',
      consumer: 'F.2',
      payload_name: 'OneSentenceIdea',
      data_flow_ref: 'DE.01',
      protocol: 'in-process',
      sync_style: 'sync',
      criticality: 'high',
    },
    {
      id: 'IF.02',
      producer: 'F.2',
      consumer: 'F.3',
      payload_name: 'DraftSpec',
      data_flow_ref: null,
      protocol: 'http-json',
      sync_style: 'async',
      criticality: 'critical',
    },
  ],
};

describe('N2MatrixTab', () => {
  it('renders columns/rows for every function in the axis', () => {
    const html = renderToStaticMarkup(<N2MatrixTab n2Matrix={fixture} />);
    for (const fn of fixture.functions_axis) {
      expect(html).toContain(fn);
    }
  });

  it('renders a button per populated (producer, consumer) cell with aria-label', () => {
    const html = renderToStaticMarkup(<N2MatrixTab n2Matrix={fixture} />);
    expect(html).toMatch(/aria-label="Jump to interface IF\.01[^"]+"/);
    expect(html).toMatch(/aria-label="Jump to interface IF\.02[^"]+"/);
  });

  it('renders interface-spec anchors with the default "iface-" id prefix', () => {
    const html = renderToStaticMarkup(<N2MatrixTab n2Matrix={fixture} />);
    expect(html).toContain('id="iface-IF.01"');
    expect(html).toContain('id="iface-IF.02"');
  });

  it('shows insufficient-functions notice when functions_axis has fewer than 2 entries', () => {
    const tiny: N2Matrix = {
      ...fixture,
      functions_axis: ['F.1'],
      rows: fixture.rows.slice(0, 1),
    };
    const html = renderToStaticMarkup(<N2MatrixTab n2Matrix={tiny} />);
    expect(html).toContain('at least 2 functions');
  });

  it('surfaces criticality on each row in the spec list', () => {
    const html = renderToStaticMarkup(<N2MatrixTab n2Matrix={fixture} />);
    expect(html).toContain('high');
    expect(html).toContain('critical');
  });
});
