"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RichMessageRecord } from "../types";

interface DeleteRichMessageDialogProps {
  message: RichMessageRecord | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteRichMessageDialog({
  message,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteRichMessageDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(message)}
      onOpenChange={onOpenChange}
      title="Delete Rich Message"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            &quot;{message?.name}&quot;
          </span>
          ? This action cannot be undone.
        </>
      }
      variant="destructive"
      confirmLabel="Delete"
      loadingLabel="Deleting..."
      isLoading={isDeleting}
      onConfirm={onConfirm}
      showCloseButton={!isDeleting}
    />
  );
}
