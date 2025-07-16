/**
 * Utility function to replace all occurrences of dots (.) and hyphens (-) with underscores (_)
 * @param input - The input string to process
 * @returns The processed string with dots and hyphens replaced by underscores
 */
export function replaceDotsAndHyphensWithUnderscores(input: string): string {
  if (!input) {
    return input;
  }

  return input.replace(/[.-]/g, '_');
}
