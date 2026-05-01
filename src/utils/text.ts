export function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

export function fuzzyMatch(haystack: string, needle: string): boolean {
  return normalize(haystack).includes(normalize(needle));
}
