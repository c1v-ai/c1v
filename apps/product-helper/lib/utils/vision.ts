/**
 * Vision metadata stripping utility
 *
 * The welcome-onboarding flow stores vision strings in the format:
 *   [Mode: Defined Scope]
 *
 *   User's actual description
 *
 *   ---
 *   System context metadata for the intake agent
 *
 * This utility strips the mode prefix and system context so the user's
 * description can be displayed cleanly in the UI.
 *
 * NOTE: This does NOT change the stored format. Stripping happens at
 * display time only. The full metadata is still used by the intake agent.
 */

/**
 * Remove mode prefix and system context metadata from a vision string,
 * returning only the user's description text.
 *
 * Handles:
 * - `[Mode: Defined Scope]` and `[Mode: Guided Discovery]` prefixes
 * - `---` separator and all system context text after it
 * - null/undefined input (returns empty string)
 * - Already-clean strings (returned as-is after trim)
 *
 * @example
 * stripVisionMetadata('[Mode: Defined Scope]\n\nMy product\n\n---\nSystem context')
 * // => 'My product'
 *
 * @example
 * stripVisionMetadata('Already clean description')
 * // => 'Already clean description'
 *
 * @example
 * stripVisionMetadata(null)
 * // => ''
 */
export function stripVisionMetadata(vision: string | null | undefined): string {
  if (!vision) return '';

  return vision
    .replace(/^\[Mode:[^\]]*\]\s*[\r\n]*/m, '')
    .replace(/\r?\n---\r?\n[\s\S]*$/, '')
    .trim();
}
