import { BroadcastSendMode } from "../types";

export interface BroadcastFormErrors {
  title?: string;
  templateId?: string;
  scheduledFor?: string;
}

export function computeBroadcastFormErrors(params: {
  title: string;
  templateId: string;
  sendMode: BroadcastSendMode;
  scheduledFor: string;
  contentTypeLabel: string;
}): BroadcastFormErrors {
  const errors: BroadcastFormErrors = {};

  if (!params.title.trim()) {
    errors.title = "Broadcast title is required";
  }

  if (!params.templateId) {
    errors.templateId = `Please select a ${params.contentTypeLabel.toLowerCase()}`;
  }

  if (params.sendMode === "schedule") {
    if (!params.scheduledFor) {
      errors.scheduledFor = "Please choose a schedule date and time";
    } else if (new Date(params.scheduledFor).getTime() <= Date.now()) {
      errors.scheduledFor = "Schedule time must be in the future";
    }
  }

  return errors;
}
