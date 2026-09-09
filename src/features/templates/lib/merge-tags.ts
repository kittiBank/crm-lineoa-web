export const MERGE_TAG_DEFINITIONS = [
  {
    key: "lineUser",
    description: "LINE display name",
    example: "[Line user]",
  },
  {
    key: "userTier",
    description: "Member tier (Silver, Gold, Platinum)",
    example: "[User Tier]",
  },
  {
    key: "userType",
    description: "Guest or Member",
    example: "[User Type]",
  },
  {
    key: "phone",
    description: "Verified phone number",
    example: "[Phone]",
  },
] as const;

export const MERGE_TAG_PREVIEW_VALUES: Record<string, string> = {
  lineUser: "[Line user]",
  displayName: "[Line user]",
  userTier: "[User Tier]",
  userType: "[User Type]",
  phone: "[Phone]",
  pictureUrl: "[Picture URL]",
  lineUserId: "[Line user ID]",
};

for (const [key, value] of Object.entries({ ...MERGE_TAG_PREVIEW_VALUES })) {
  MERGE_TAG_PREVIEW_VALUES[key.toLowerCase()] = value;
}

const MERGE_TAG_PATTERN = /\{([a-zA-Z0-9_]+)\}/g;

export function applyMergeTags(
  text: string,
  values: Record<string, string> = MERGE_TAG_PREVIEW_VALUES,
): string {
  return text.replace(MERGE_TAG_PATTERN, (match, key: string) => {
    const replacement = values[key] ?? values[key.toLowerCase()];
    return replacement !== undefined ? replacement : match;
  });
}

export function insertTextAtCursor(
  element: HTMLTextAreaElement | HTMLInputElement | null,
  current: string,
  inserted: string,
): { next: string; cursor: number } {
  const start = element?.selectionStart ?? current.length;
  const end = element?.selectionEnd ?? current.length;
  return {
    next: `${current.slice(0, start)}${inserted}${current.slice(end)}`,
    cursor: start + inserted.length,
  };
}
