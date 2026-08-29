export const MAX_AUTO_MESSAGE_KEYWORDS = 20;

export function parseKeywords(value: string): string[] {
  if (!value.trim()) return [];

  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const part of value.split(",")) {
    const keyword = part.trim();
    if (!keyword) continue;

    if (seen.has(keyword)) continue;

    seen.add(keyword);
    keywords.push(keyword);

    if (keywords.length >= MAX_AUTO_MESSAGE_KEYWORDS) break;
  }

  return keywords;
}

export function serializeKeywords(keywords: string[]): string {
  return parseKeywords(keywords.join(",")).join(",");
}

export function addKeyword(
  keywords: string[],
  raw: string,
): {
  keywords: string[];
  added: boolean;
  reason?: "empty" | "duplicate" | "limit";
} {
  const keyword = raw.trim();
  if (!keyword) {
    return { keywords, added: false, reason: "empty" };
  }

  const exists = keywords.includes(keyword);
  if (exists) {
    return { keywords, added: false, reason: "duplicate" };
  }

  if (keywords.length >= MAX_AUTO_MESSAGE_KEYWORDS) {
    return { keywords, added: false, reason: "limit" };
  }

  return { keywords: [...keywords, keyword], added: true };
}

export function commitKeywordDraft(
  keywords: string[],
  raw: string,
): {
  keywords: string[];
  rejected?: "duplicate" | "limit";
} {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { keywords };
  }

  let nextKeywords = keywords;
  let rejected: "duplicate" | "limit" | undefined;

  for (const part of parts) {
    const next = addKeyword(nextKeywords, part);
    if (next.added) {
      nextKeywords = next.keywords;
      continue;
    }
    if (next.reason === "duplicate" || next.reason === "limit") {
      rejected = next.reason;
      if (next.reason === "limit") break;
    }
  }

  return { keywords: nextKeywords, rejected };
}
