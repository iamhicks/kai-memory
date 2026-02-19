const STOP_WORDS = new Set([
  'the','a','an','and','or','but','what','which','who','whom','this','that','is','are','be','to','for','of','in','on','with','by','it','as','at','do','did','does','should','could','would','can','will','about','into','from','how','why','when','where','please','hey','hi','hello','thanks'
]);

export function extractKeywords(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.has(word));
}
