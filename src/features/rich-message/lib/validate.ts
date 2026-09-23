import { RichMessageAreaConfig } from "../types";

export interface RichMessageFormErrors {
  name?: string;
  altText?: string;
  image?: string;
}

export type RichMessageAreaFormErrors = Record<
  number,
  { uri?: string; text?: string }
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
  altText: string,
  hasImage: boolean,
): RichMessageFormErrors {
  const errors: RichMessageFormErrors = {};

  if (!name.trim()) {
    errors.name = "Rich message name is required";
  }

  if (!altText.trim()) {
    errors.altText = "Alt text is required";
  } else if (altText.trim().length > 400) {
    errors.altText = "Alt text must be 400 characters or fewer";
  }

  if (!hasImage) {
    errors.image = "Please upload a rich message image";
  }

  return errors;
}

export function computeAreaErrors(
  areas: RichMessageAreaConfig[],
): RichMessageAreaFormErrors {
  const errors: RichMessageAreaFormErrors = {};

  areas.forEach((area, index) => {
    const areaError: { uri?: string; text?: string } = {};

    if (area.actionType === "uri") {
      const uri = area.uri?.trim();
      if (!uri) {
        areaError.uri = "URL is required";
      } else if (!isValidHttpsUrl(uri)) {
        areaError.uri = "Enter a valid link starting with https://";
      }
    }

    if (area.actionType === "message" && !area.text?.trim()) {
      areaError.text = "Message text is required";
    }

    if (Object.keys(areaError).length > 0) {
      errors[index] = areaError;
    }
  });

  return errors;
}
