"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RichMenuRecord } from "../types";

interface DeleteRichMenuDialogProps {
  menu: RichMenuRecord | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteRichMenuDialog({
  menu,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteRichMenuDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(menu)}
      onOpenChange={onOpenChange}
      title="Delete Rich Menu"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            &quot;{menu?.name}&quot;
          </span>
          ? This will also remove it from LINE and cannot be undone.
        </>
      }
      variant="destructive"
      cancelLabel="Cancel"
      confirmLabel="Delete"
      loadingLabel="Deleting..."
      isLoading={isDeleting}
      onConfirm={onConfirm}
      showCloseButton={!isDeleting}
    />
  );
}
