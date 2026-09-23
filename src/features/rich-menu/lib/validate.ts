import { RichMenuAreaConfig } from "../types";

export interface RichMenuFormErrors {
  name?: string;
  chatBarText?: string;
  image?: string;
}

export type RichMenuAreaFormErrors = Record<
  number,
  { label?: string; uri?: string }
>;

export function isValidHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function computeBasicInfoErrors(
  name: string,
  chatBarText: string,
  hasImage: boolean,
): RichMenuFormErrors {
  const errors: RichMenuFormErrors = {};

  if (!name.trim()) {
    errors.name = "Menu name is required";
  }

  if (!chatBarText.trim()) {
    errors.chatBarText = "Chat bar text is required";
  } else if (chatBarText.length > 14) {
    errors.chatBarText = "Chat bar text must be 14 characters or less";
  }

  if (!hasImage) {
    errors.image = "Please upload a rich menu image";
  }

  return errors;
}

export function computeAreaErrors(
  areas: RichMenuAreaConfig[],
): RichMenuAreaFormErrors {
  const errors: RichMenuAreaFormErrors = {};

  areas.forEach((area, index) => {
    const areaError: { label?: string; uri?: string } = {};

    if (!area.label.trim()) {
      areaError.label = "Label is required";
    }

    if (area.actionType === "uri") {
      const uri = area.uri?.trim();
      if (!uri) {
        areaError.uri = "URL is required";
      } else if (!isValidHttpsUrl(uri)) {
        areaError.uri = "Enter a valid link starting with https://";
      }
    }

    if (Object.keys(areaError).length > 0) {
      errors[index] = areaError;
    }
  });

  return errors;
}
