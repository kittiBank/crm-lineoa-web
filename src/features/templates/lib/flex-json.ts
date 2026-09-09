import { FlexMessageBlock } from "../types/builder";

export type FlexContents = Record<string, unknown>;

export type FlexJsonParseResult =
  | {
      ok: true;
      contents: FlexContents;
      altText?: string;
    }
  | {
      ok: false;
      error: string;
    };

const DEFAULT_FLEX_CONTENTS: FlexContents = {
  type: "bubble",
  body: {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "สวัสดีคุณ {lineUser}",
        weight: "bold",
        size: "xl",
      },
      {
        type: "text",
        text: "ยินดีต้อนรับเข้าสู่ระบบของเรา สามารถกดปุ่มด้านล่างเพื่อดูรายละเอียดเพิ่มเติมได้เลยครับ",
        size: "md",
        color: "#666666",
        wrap: true,
        margin: "md",
      },
    ],
  },
  footer: {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "button",
        style: "primary",
        color: "#06C755",
        action: {
          type: "uri",
          label: "ดูรายละเอียด",
          uri: "https://www.line.me",
        },
      },
    ],
  },
};

export const DEFAULT_FLEX_CONTENTS_JSON = JSON.stringify(
  DEFAULT_FLEX_CONTENTS,
  null,
  2,
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateContents(value: unknown): FlexJsonParseResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Flex contents must be a JSON object" };
  }

  if (value.type === "bubble") {
    const sections = ["header", "hero", "body", "footer"] as const;
    const hasSection = sections.some((section) => value[section] !== undefined);

    if (!hasSection) {
      return {
        ok: false,
        error: "A Flex bubble must contain header, hero, body, or footer",
      };
    }

    for (const section of sections) {
      if (value[section] !== undefined && !isRecord(value[section])) {
        return {
          ok: false,
          error: `Flex bubble ${section} must be a JSON object`,
        };
      }
    }

    return { ok: true, contents: value };
  }

  if (value.type === "carousel") {
    if (!Array.isArray(value.contents) || value.contents.length === 0) {
      return {
        ok: false,
        error: "A Flex carousel must contain at least one bubble",
      };
    }

    if (value.contents.length > 12) {
      return {
        ok: false,
        error: "A Flex carousel can contain up to 12 bubbles",
      };
    }

    if (
      value.contents.some(
        (bubble) => !isRecord(bubble) || bubble.type !== "bubble",
      )
    ) {
      return {
        ok: false,
        error: "Every Flex carousel item must be a bubble",
      };
    }

    return { ok: true, contents: value };
  }

  return {
    ok: false,
    error: 'Flex JSON type must be "bubble", "carousel", or "flex"',
  };
}

export function parseFlexSimulatorJson(raw: string): FlexJsonParseResult {
  if (!raw.trim()) {
    return { ok: false, error: "Flex JSON is required" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const detail =
      error instanceof SyntaxError ? error.message : "Invalid JSON syntax";
    return { ok: false, error: `Invalid JSON: ${detail}` };
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: "Flex JSON must be a JSON object" };
  }

  if (parsed.type !== "flex") {
    return validateContents(parsed);
  }

  const result = validateContents(parsed.contents);
  if (!result.ok) {
    return result;
  }

  if (parsed.altText !== undefined && typeof parsed.altText !== "string") {
    return { ok: false, error: "Flex altText must be a string" };
  }

  return {
    ...result,
    altText: typeof parsed.altText === "string" ? parsed.altText : undefined,
  };
}

export function formatFlexContents(contents: FlexContents): string {
  return JSON.stringify(contents, null, 2);
}

export function legacyFlexToContents(message: FlexMessageBlock): FlexContents {
  const bodyContents: Record<string, unknown>[] = [];

  if (message.title?.trim()) {
    bodyContents.push({
      type: "text",
      text: message.title.trim(),
      weight: "bold",
      size: "lg",
      wrap: true,
    });
  }

  if (message.description?.trim()) {
    bodyContents.push({
      type: "text",
      text: message.description.trim(),
      margin: "md",
      wrap: true,
    });
  }

  if (bodyContents.length === 0) {
    bodyContents.push({
      type: "text",
      text: "Flex message",
      wrap: true,
    });
  }

  const contents: FlexContents = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: bodyContents,
    },
  };

  if (message.imageUrl?.trim()) {
    contents.hero = {
      type: "image",
      url: message.imageUrl.trim(),
      size: "full",
      aspectMode: "cover",
      aspectRatio: "20:13",
    };
  }

  if (message.buttonLabel?.trim() && message.buttonUrl?.trim()) {
    contents.footer = {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          action: {
            type: "uri",
            label: message.buttonLabel.trim(),
            uri: message.buttonUrl.trim(),
          },
        },
      ],
    };
  }

  return contents;
}
