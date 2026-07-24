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
      return { id, type: "text", text: "Hello from LINE OA!" } satisfies TextMessageBlock;
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
        title: "Special Offer",
        description: "Describe your promotion here",
        imageUrl: "",
        buttonLabel: "Learn more",
        buttonUrl: "https://",
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
        return {
          ...message,
          id,
          altText: message.altText ?? "",
          title: message.title ?? "",
          description: message.description ?? "",
          imageUrl: message.imageUrl ?? "",
          buttonLabel: message.buttonLabel ?? "",
          buttonUrl: message.buttonUrl ?? "",
        } satisfies FlexMessageBlock;
      }

      return {
        id,
        type: "text",
        text: "",
      } satisfies TextMessageBlock;
    });
}
