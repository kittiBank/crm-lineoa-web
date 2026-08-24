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

function createId() {
  return crypto.randomUUID();
}

function createCarouselColumn(): CarouselColumnBlock {
  return {
    id: createId(),
    title: "Column title",
    text: "Short description",
    imageUrl: "",
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
      return { id, type: "image", imageUrl: "" } satisfies ImageMessageBlock;
    case "video":
      return {
        id,
        type: "video",
        videoUrl: "",
        previewImageUrl: "",
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
      return rest;
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
        columns: message.columns.map(
          ({ previewUrl: _previewUrl, ...column }) => column,
        ),
      };
    }

    return message;
  });
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
          columns: columns.map((column) => ({
            id: column?.id || createId(),
            title: column?.title ?? "",
            text: column?.text ?? "",
            imageUrl: column?.imageUrl ?? "",
            actionLabel: column?.actionLabel ?? "",
            actionUrl: column?.actionUrl ?? "",
          })),
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
        return {
          ...message,
          id,
          imageUrl: message.imageUrl ?? "",
        } satisfies ImageMessageBlock;
      }

      if (message.type === "video") {
        return {
          ...message,
          id,
          videoUrl: message.videoUrl ?? "",
          previewImageUrl: message.previewImageUrl ?? "",
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
