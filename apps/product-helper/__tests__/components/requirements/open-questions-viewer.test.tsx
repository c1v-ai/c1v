/**
 * OpenQuestionsViewer structural test (jest testEnvironment: 'node').
 * Uses react-dom/server.renderToStaticMarkup to assert HTML output.
 */

import { describe, it, expect } from '@jest/globals';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { OpenQuestionsViewer } from '@/components/requirements/open-questions-viewer';
import type { OpenQuestionLedgerEntry } from '@/lib/chat/system-question-bridge.types';

const reqEntry: OpenQuestionLedgerEntry = {
  conversation_id: 11,
  source: 'm2_nfr',
  question: 'What is the p95 latency target?',
  status: 'pending',
  created_at: '2026-04-25T10:00:00Z',
};

const qfdEntry: OpenQuestionLedgerEntry = {
  conversation_id: 22,
  source: 'm6_qfd',
  question: 'Customer cares about cost; engineering about latency. Which?',
  status: 'answered',
  created_at: '2026-04-25T10:05:00Z',
  answered_at: '2026-04-25T10:08:00Z',
  reply_conversation_id: 222,
  reply_body: 'Optimize for latency',
};

const riskEntry: OpenQuestionLedgerEntry = {
  conversation_id: 33,
  source: 'm8_residual',
  question: 'Mitigation for unbounded retries?',
  status: 'pending',
  created_at: '2026-04-25T10:10:00Z',
};

describe('OpenQuestionsViewer', () => {
  it('renders an empty-state card when no entries exist', () => {
    const html = renderToStaticMarkup(
      <OpenQuestionsViewer projectId={42} ledger={null} />,
    );
    expect(html).toContain('None recorded yet');
    // No deep-link anchor in empty state.
    expect(html).not.toMatch(/href="\/projects\/42\/chat/);
  });

  it('aggregates three buckets into separate sections', () => {
    const html = renderToStaticMarkup(
      <OpenQuestionsViewer
        projectId={42}
        ledger={{
          requirements: [reqEntry],
          qfdResolved: [qfdEntry],
          riskResolved: [riskEntry],
        }}
      />,
    );
    expect(html).toContain('Requirements');
    expect(html).toContain('QFD');
    expect(html).toContain('Risk');
    expect(html).toContain('p95 latency target');
    expect(html).toContain('Customer cares about cost');
    expect(html).toContain('unbounded retries');
  });

  it('surfaces both pending and answered status pills', () => {
    const html = renderToStaticMarkup(
      <OpenQuestionsViewer
        projectId={42}
        ledger={{ requirements: [reqEntry], qfdResolved: [qfdEntry] }}
      />,
    );
    expect(html).toMatch(/>pending</);
    expect(html).toMatch(/>answered</);
  });

  it('uses the buildChatUrl override for deep-link hrefs', () => {
    const buildChatUrl = (pid: number, cid: number) =>
      `/custom/${pid}/thread/${cid}`;
    const html = renderToStaticMarkup(
      <OpenQuestionsViewer
        projectId={9}
        ledger={{ qfdResolved: [qfdEntry] }} defaultOpen
        buildChatUrl={buildChatUrl}
      />,
    );
    // qfdEntry.reply_conversation_id = 222 takes priority over conversation_id.
    expect(html).toContain('href="/custom/9/thread/222"');
  });
});
