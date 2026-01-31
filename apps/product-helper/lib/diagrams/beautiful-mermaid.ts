/**
 * Beautiful Mermaid Wrapper
 *
 * Centralizes diagram rendering with professional themes.
 * Provides both SVG (for UI) and ASCII (for MCP/CLI) output.
 *
 * @see https://github.com/lukilabs/beautiful-mermaid
 */

import { renderMermaid, renderMermaidAscii, THEMES } from 'beautiful-mermaid';

// Theme mapping for next-themes integration
export const DIAGRAM_THEMES = {
  light: THEMES['github-light'],
  dark: THEMES['github-dark'],
} as const;

export type DiagramTheme = keyof typeof DIAGRAM_THEMES;

/**
 * Render Mermaid diagram as SVG with theme support
 *
 * @param syntax - Mermaid diagram syntax
 * @param theme - 'light' or 'dark' (defaults to 'light')
 * @returns SVG string
 */
export async function renderDiagramSvg(
  syntax: string,
  theme: DiagramTheme = 'light'
): Promise<string> {
  const themeConfig = DIAGRAM_THEMES[theme];
  return renderMermaid(syntax, {
    ...themeConfig,
    font: 'Inter, system-ui, sans-serif',
  });
}

/**
 * Render Mermaid diagram as ASCII for terminal/CLI output
 *
 * @param syntax - Mermaid diagram syntax
 * @param options - ASCII rendering options
 * @returns ASCII string representation
 */
export function renderDiagramAscii(
  syntax: string,
  options: {
    useAscii?: boolean; // true for pure ASCII (+---+), false for Unicode (default)
    paddingX?: number;
    paddingY?: number;
  } = {}
): string {
  return renderMermaidAscii(syntax, {
    useAscii: options.useAscii ?? false,
    paddingX: options.paddingX ?? 3,
    paddingY: options.paddingY ?? 2,
  });
}

/**
 * Check if beautiful-mermaid can parse the syntax
 * Use this for validation before rendering
 */
export async function validateMermaidSyntax(syntax: string): Promise<boolean> {
  try {
    // Attempt to render - will throw if invalid
    await renderMermaid(syntax, DIAGRAM_THEMES.light);
    return true;
  } catch {
    return false;
  }
}

// Re-export THEMES for direct access if needed
export { THEMES };
