import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { chat, type ChatMessage } from '../openrouter-client';

type FetchFn = typeof fetch;

const originalFetch = global.fetch;
const ORIGINAL_KEY = process.env.OPENROUTER_API_KEY;
const ORIGINAL_BASE = process.env.OPENROUTER_BASE_URL;

function installFetchMock(impl: FetchFn): jest.MockedFunction<FetchFn> {
  const mock = jest.fn(impl) as jest.MockedFunction<FetchFn>;
  (global as { fetch: FetchFn }).fetch = mock;
  return mock;
}

function resetFetch(): void {
  (global as { fetch: FetchFn }).fetch = originalFetch;
}

function makeResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
}

const OK_BODY = {
  id: 'gen-123',
  model: 'anthropic/claude-sonnet-4-6',
  choices: [
    {
      message: { role: 'assistant', content: 'hello world' },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 4,
    total_tokens: 14,
    total_cost: 0.00012,
  },
};

beforeEach(() => {
  process.env.OPENROUTER_API_KEY = 'sk-or-test-key';
  delete process.env.OPENROUTER_BASE_URL;
});

afterEach(() => {
  resetFetch();
  if (ORIGINAL_KEY === undefined) delete process.env.OPENROUTER_API_KEY;
  else process.env.OPENROUTER_API_KEY = ORIGINAL_KEY;
  if (ORIGINAL_BASE === undefined) delete process.env.OPENROUTER_BASE_URL;
  else process.env.OPENROUTER_BASE_URL = ORIGINAL_BASE;
});

describe('chat — happy path', () => {
  it('returns parsed content + model + usage', async () => {
    installFetchMock(async () => makeResponse(OK_BODY));

    const result = await chat('anthropic/claude-sonnet-4-6', [
      { role: 'user', content: 'hi' },
    ]);

    expect(result.content).toBe('hello world');
    expect(result.model).toBe('anthropic/claude-sonnet-4-6');
    expect(result.finish_reason).toBe('stop');
    expect(result.usage.prompt_tokens).toBe(10);
    expect(result.usage.completion_tokens).toBe(4);
    expect(result.usage.cost_usd).toBeCloseTo(0.00012);
  });

  it('calls onUsage with parsed usage', async () => {
    installFetchMock(async () => makeResponse(OK_BODY));
    const onUsage = jest.fn();
    await chat(
      'anthropic/claude-sonnet-4-6',
      [{ role: 'user', content: 'hi' }],
      { onUsage },
    );
    expect(onUsage).toHaveBeenCalledTimes(1);
    expect(onUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'anthropic/claude-sonnet-4-6',
        prompt_tokens: 10,
        completion_tokens: 4,
        cost_usd: expect.any(Number),
      }),
    );
  });
});

describe('chat — request shape', () => {
  it('sends required OpenRouter attribution headers', async () => {
    const mock = installFetchMock(async () => makeResponse(OK_BODY));
    await chat('anthropic/claude-sonnet-4-6', [
      { role: 'user', content: 'hi' },
    ]);

    const [url, init] = mock.mock.calls[0]!;
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer sk-or-test-key');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['HTTP-Referer']).toBe('https://prd.c1v.ai');
    expect(headers['X-Title']).toBe('c1v-MIT-Crawley-Cornell');
  });

  it('honors OPENROUTER_BASE_URL override', async () => {
    process.env.OPENROUTER_BASE_URL = 'https://proxy.example.com/v1';
    const mock = installFetchMock(async () => makeResponse(OK_BODY));
    await chat('anthropic/claude-sonnet-4-6', [
      { role: 'user', content: 'hi' },
    ]);
    expect(mock.mock.calls[0]![0]).toBe(
      'https://proxy.example.com/v1/chat/completions',
    );
  });

  it('serializes messages without leaking cache_control into OpenAI-schema fields', async () => {
    const mock = installFetchMock(async () => makeResponse(OK_BODY));
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'sys',
        cache_control: { type: 'ephemeral' },
      },
      { role: 'user', content: 'hi' },
    ];
    await chat('anthropic/claude-sonnet-4-6', messages);
    const body = JSON.parse(mock.mock.calls[0]![1]!.body as string);
    // cache_control stripped from message objects
    expect(body.messages[0]).toEqual({ role: 'system', content: 'sys' });
    // Forwarded via extra_body for Anthropic models
    expect(body.extra_body?.cache_control).toEqual([
      { index: 0, type: 'ephemeral' },
    ]);
  });

  it('does NOT emit extra_body for non-Anthropic models', async () => {
    const mock = installFetchMock(async () => makeResponse(OK_BODY));
    await chat(
      'google/gemini-2.5-flash',
      [
        {
          role: 'system',
          content: 'sys',
          cache_control: { type: 'ephemeral' },
        },
      ],
    );
    const body = JSON.parse(mock.mock.calls[0]![1]!.body as string);
    expect(body.extra_body).toBeUndefined();
  });

  it('forwards temperature + max_tokens when set', async () => {
    const mock = installFetchMock(async () => makeResponse(OK_BODY));
    await chat(
      'anthropic/claude-haiku-4-5',
      [{ role: 'user', content: 'hi' }],
      { temperature: 0.2, max_tokens: 512 },
    );
    const body = JSON.parse(mock.mock.calls[0]![1]!.body as string);
    expect(body.temperature).toBe(0.2);
    expect(body.max_tokens).toBe(512);
    expect(body.stream).toBe(false);
  });
});

describe('chat — error handling', () => {
  it('throws when OPENROUTER_API_KEY is missing', async () => {
    delete process.env.OPENROUTER_API_KEY;
    installFetchMock(async () => makeResponse(OK_BODY));
    await expect(
      chat('anthropic/claude-haiku-4-5', [{ role: 'user', content: 'x' }]),
    ).rejects.toThrow(/OPENROUTER_API_KEY/);
  });

  it('throws non-retryable on 400', async () => {
    const mock = installFetchMock(async () =>
      makeResponse({ error: 'bad request' }, { status: 400, statusText: 'Bad Request' }),
    );
    await expect(
      chat('anthropic/claude-haiku-4-5', [{ role: 'user', content: 'x' }], {
        maxRetries: 3,
      }),
    ).rejects.toThrow(/OpenRouter 400/);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('throws malformed-response when choices missing', async () => {
    installFetchMock(async () => makeResponse({ id: 'x', model: 'm', choices: [] }));
    await expect(
      chat('anthropic/claude-haiku-4-5', [{ role: 'user', content: 'x' }]),
    ).rejects.toThrow(/response malformed/);
  });
});

describe('chat — retry policy', () => {
  it('retries on 429 then succeeds', async () => {
    let calls = 0;
    const mock = installFetchMock(async () => {
      calls++;
      if (calls === 1)
        return makeResponse({ error: 'rate limit' }, {
          status: 429,
          statusText: 'Too Many Requests',
        });
      return makeResponse(OK_BODY);
    });
    const r = await chat(
      'anthropic/claude-haiku-4-5',
      [{ role: 'user', content: 'x' }],
      { maxRetries: 2, backoffBaseMs: 1 },
    );
    expect(r.content).toBe('hello world');
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('retries on 503 then succeeds', async () => {
    let calls = 0;
    installFetchMock(async () => {
      calls++;
      if (calls < 3)
        return makeResponse({ error: 'upstream' }, {
          status: 503,
          statusText: 'Service Unavailable',
        });
      return makeResponse(OK_BODY);
    });
    const r = await chat(
      'anthropic/claude-haiku-4-5',
      [{ role: 'user', content: 'x' }],
      { maxRetries: 3, backoffBaseMs: 1 },
    );
    expect(r.content).toBe('hello world');
    expect(calls).toBe(3);
  });

  it('throws after retry budget exhausted', async () => {
    const mock = installFetchMock(async () =>
      makeResponse({ error: 'still 429' }, {
        status: 429,
        statusText: 'Too Many Requests',
      }),
    );
    await expect(
      chat('anthropic/claude-haiku-4-5', [{ role: 'user', content: 'x' }], {
        maxRetries: 2,
        backoffBaseMs: 1,
      }),
    ).rejects.toThrow(/OpenRouter 429/);
    expect(mock).toHaveBeenCalledTimes(3); // initial + 2 retries
  });
});
