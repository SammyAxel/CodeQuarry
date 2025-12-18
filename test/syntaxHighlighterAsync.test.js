import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockHighlightWithShiki = vi.fn();

vi.mock('../src/utils/shikiHighlighter.js', () => ({
  highlightWithShiki: (...args) => mockHighlightWithShiki(...args),
}));

import { highlightSyntaxAsync } from '../src/utils/SyntaxHighlighter.js';

describe('highlightSyntaxAsync', () => {
  beforeEach(() => {
    mockHighlightWithShiki.mockReset();
  });

  it('returns Shiki HTML when available', async () => {
    mockHighlightWithShiki.mockResolvedValue('<span class="cq-tok cq-keyword">const</span> x = 1');
    const html = await highlightSyntaxAsync('const x = 1', 'javascript');
    expect(html).toContain('cq-tok');
    expect(html).toContain('cq-keyword');
  });

  it('falls back to highlight.js when Shiki is unavailable', async () => {
    mockHighlightWithShiki.mockResolvedValue(null);
    const html = await highlightSyntaxAsync('const x = 1', 'javascript');
    // highlight.js output should include hljs classes for recognized languages.
    expect(html).toMatch(/hljs-|hljs/);
  });
});
