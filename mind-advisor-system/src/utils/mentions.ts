export const mentionRegex = /@([\p{L}\p{N}_-]+)/gu;

export function extractMentions(input: string): string[] {
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(input)) !== null) {
    matches.push(match[1].toLowerCase());
  }

  return [...new Set(matches)];
}
