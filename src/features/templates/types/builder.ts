export type TemplateMessageType =
  | "text"
  | "image"
  | "video"
  | "flex"
  | "carousel";

export interface TemplateMessageBase {
  id: string;
  type: TemplateMessageType;
}

export interface TextMessageBlock extends TemplateMessageBase {
  type: "text";
  text: string;
}

export interface ImageMessageBlock extends TemplateMessageBase {
  type: "image";
  imageUrl: string;
}

export interface VideoMessageBlock extends TemplateMessageBase {
  type: "video";
  videoUrl: string;
  previewImageUrl: string;
}

export interface FlexMessageBlock extends TemplateMessageBase {
  type: "flex";
  altText: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonLabel: string;
  buttonUrl: string;
}

export interface CarouselColumnBlock {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  actionLabel: string;
  actionUrl: string;
}

export interface CarouselMessageBlock extends TemplateMessageBase {
  type: "carousel";
  altText: string;
  columns: CarouselColumnBlock[];
}

export type TemplateMessageBlock =
  | TextMessageBlock
  | ImageMessageBlock
  | VideoMessageBlock
  | FlexMessageBlock
  | CarouselMessageBlock;

export interface TemplateBuilderForm {
  name: string;
  description: string;
  category: string;
  messages: TemplateMessageBlock[];
}

export interface MessageTypeOption {
  type: TemplateMessageType;
  label: string;
  description: string;
}
