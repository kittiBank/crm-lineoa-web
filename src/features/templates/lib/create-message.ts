import {
  CarouselColumnBlock,
  CarouselMessageBlock,
  FlexMessageBlock,
  ImageMessageBlock,
  TemplateMessageBlock,
  TemplateMessageType,
  TextMessageBlock,
  VideoMessageBlock,
} from "../types/builder";
import {
  DEFAULT_FLEX_CONTENTS_JSON,
  formatFlexContents,
  legacyFlexToContents,
  parseFlexSimulatorJson,
} from "./flex-json";

/** Bundled default preview image served from /public */
export const DEFAULT_TEMPLATE_MEDIA_PATH = "/defaults/template-preview.jpg";

/** @deprecated Use DEFAULT_TEMPLATE_MEDIA_PATH */
export const DEFAULT_TEMPLATE_IMAGE_URL = DEFAULT_TEMPLATE_MEDIA_PATH;

/** @deprecated Use DEFAULT_TEMPLATE_MEDIA_PATH */
export const DEFAULT_TEMPLATE_VIDEO_THUMBNAIL_URL = DEFAULT_TEMPLATE_MEDIA_PATH;

const LEGACY_EXTERNAL_DEFAULT_URLS = new Set([
  "https://developers-resource.landpress.line.me/fx/img/01_1_cafe.png",
]);

function createId() {
  return crypto.randomUUID();
}

export function isDefaultTemplateMediaUrl(url: string | undefined | null): boolean {
  if (!url) {
    return false;
  }

  if (LEGACY_EXTERNAL_DEFAULT_URLS.has(url)) {
    return true;
  }

  return (
    url === DEFAULT_TEMPLATE_MEDIA_PATH ||
    url.endsWith(DEFAULT_TEMPLATE_MEDIA_PATH)
  );
}

/** Turn project-relative media paths into absolute URLs for LINE / API persistence */
export function resolveTemplateMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (LEGACY_EXTERNAL_DEFAULT_URLS.has(trimmed)) {
    return resolveTemplateMediaUrl(DEFAULT_TEMPLATE_MEDIA_PATH);
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("/") && typeof window !== "undefined") {
    return `${window.location.origin}${trimmed}`;
  }

  return trimmed;
}

function createCarouselColumn(): CarouselColumnBlock {
  return {
    id: createId(),
    title: "Column title",
    text: "Short description",
    imageUrl: DEFAULT_TEMPLATE_MEDIA_PATH,
    previewUrl: DEFAULT_TEMPLATE_MEDIA_PATH,
    actionLabel: "View",
    actionUrl: "https://",
  };
}

export function createMessageBlock(
  type: TemplateMessageType,
): TemplateMessageBlock {
  const id = createId();

  switch (type) {
    case "text":
      return {
        id,
        type: "text",
        text: "Hello from LINE OA!",
      } satisfies TextMessageBlock;
    case "image":
      return {
        id,
        type: "image",
        imageUrl: DEFAULT_TEMPLATE_MEDIA_PATH,
        previewUrl: DEFAULT_TEMPLATE_MEDIA_PATH,
      } satisfies ImageMessageBlock;
    case "video":
      return {
        id,
        type: "video",
        videoUrl: "",
        previewImageUrl: DEFAULT_TEMPLATE_MEDIA_PATH,
        previewUrl: DEFAULT_TEMPLATE_MEDIA_PATH,
      } satisfies VideoMessageBlock;
    case "flex":
      return {
        id,
        type: "flex",
        altText: "Flex message",
        contentsJson: DEFAULT_FLEX_CONTENTS_JSON,
      } satisfies FlexMessageBlock;
    case "carousel":
      return {
        id,
        type: "carousel",
        altText: "Carousel message",
        columns: [createCarouselColumn(), createCarouselColumn()],
      } satisfies CarouselMessageBlock;
    default:
      return { id, type: "text", text: "" };
  }
}

export { createCarouselColumn };

export function toPersistableMessages(
  messages: TemplateMessageBlock[],
): TemplateMessageBlock[] {
  return messages.map((message) => {
    if (message.type === "image") {
      const { previewUrl: _previewUrl, ...rest } = message;
      return {
        ...rest,
        imageUrl: resolveTemplateMediaUrl(rest.imageUrl),
      };
    }

    if (message.type === "video") {
      const { previewUrl: _previewUrl, ...rest } = message;
      return {
        ...rest,
        videoUrl: resolveTemplateMediaUrl(rest.videoUrl),
        previewImageUrl: resolveTemplateMediaUrl(rest.previewImageUrl),
      };
    }

    if (message.type === "flex") {
      const parsed = parseFlexSimulatorJson(message.contentsJson ?? "");
      if (!parsed.ok) {
        throw new Error(parsed.error);
      }

      return {
        id: message.id,
        type: "flex",
        altText: parsed.altText?.trim() || message.altText.trim(),
        contents: parsed.contents,
      } satisfies FlexMessageBlock;
    }

    if (message.type === "carousel") {
      return {
        ...message,
        columns: message.columns.map(({ previewUrl: _previewUrl, ...column }) => ({
          ...column,
          imageUrl: resolveTemplateMediaUrl(column.imageUrl),
        })),
      };
    }

    return message;
  });
}

function normalizeMediaUrl(url: string | undefined | null, fallback: string): string {
  if (!url || LEGACY_EXTERNAL_DEFAULT_URLS.has(url)) {
    return fallback;
  }
  return url;
}

export function normalizeTemplateMessages(
  messages: TemplateMessageBlock[],
): TemplateMessageBlock[] {
  return messages
    .filter(
      (message) =>
        message &&
        typeof message === "object" &&
        !Array.isArray(message) &&
        typeof message.type === "string",
    )
    .map((message) => {
      const id = message.id || createId();

      if (message.type === "carousel") {
        const columns = Array.isArray(message.columns) ? message.columns : [];

        return {
          ...message,
          id,
          altText: message.altText ?? "",
          columns: columns.map((column) => {
            const imageUrl = normalizeMediaUrl(
              column?.imageUrl,
              DEFAULT_TEMPLATE_MEDIA_PATH,
            );
            return {
              id: column?.id || createId(),
              title: column?.title ?? "",
              text: column?.text ?? "",
              imageUrl,
              previewUrl: isDefaultTemplateMediaUrl(imageUrl)
                ? DEFAULT_TEMPLATE_MEDIA_PATH
                : column?.previewUrl,
              actionLabel: column?.actionLabel ?? "",
              actionUrl: column?.actionUrl ?? "",
            };
          }),
        } satisfies CarouselMessageBlock;
      }

      if (message.type === "text") {
        return {
          ...message,
          id,
          text: message.text ?? "",
        } satisfies TextMessageBlock;
      }

      if (message.type === "image") {
        const imageUrl = normalizeMediaUrl(
          message.imageUrl,
          DEFAULT_TEMPLATE_MEDIA_PATH,
        );
        return {
          ...message,
          id,
          imageUrl,
          previewUrl: isDefaultTemplateMediaUrl(imageUrl)
            ? DEFAULT_TEMPLATE_MEDIA_PATH
            : message.previewUrl,
        } satisfies ImageMessageBlock;
      }

      if (message.type === "video") {
        const previewImageUrl = normalizeMediaUrl(
          message.previewImageUrl,
          DEFAULT_TEMPLATE_MEDIA_PATH,
        );
        return {
          ...message,
          id,
          videoUrl: message.videoUrl ?? "",
          previewImageUrl,
          previewUrl: isDefaultTemplateMediaUrl(previewImageUrl)
            ? DEFAULT_TEMPLATE_MEDIA_PATH
            : message.previewUrl,
        } satisfies VideoMessageBlock;
      }

      if (message.type === "flex") {
        const savedContents =
          message.contents &&
          typeof message.contents === "object" &&
          !Array.isArray(message.contents)
            ? message.contents
            : legacyFlexToContents(message);

        return {
          ...message,
          id,
          altText: message.altText ?? "",
          contents: savedContents,
          contentsJson: formatFlexContents(savedContents),
        } satisfies FlexMessageBlock;
      }

      return {
        id,
        type: "text",
        text: "",
      } satisfies TextMessageBlock;
    });
}
