"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormFooterProps = React.ComponentProps<"div">;

export function FormFooter({ className, children, ...props }: FormFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-6 -mb-6 ml-[-2rem] flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4 pl-8 dark:border-gray-700 dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type FormActionFooterMode = "create" | "edit" | "view";

const secondaryButtonClassName =
  "bg-gray-200 px-6 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600";

const primaryButtonClassName =
  "bg-blue-600 px-6 text-white hover:bg-blue-700";

export interface FormActionFooterProps {
  mode?: FormActionFooterMode;
  cancelHref: string;
  onSave?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  cancelLabel?: string;
  backLabel?: string;
  createSaveLabel?: string;
  editSaveLabel?: string;
  savingLabel?: string;
  className?: string;
}

export function FormActionFooter({
  mode = "edit",
  cancelHref,
  onSave,
  isSubmitting = false,
  disabled = false,
  cancelLabel = "Cancel",
  backLabel = "Back",
  createSaveLabel = "Save",
  editSaveLabel = "Save Changes",
  savingLabel = "Saving...",
  className,
}: FormActionFooterProps) {
  if (mode === "view") {
    return (
      <FormFooter className={className}>
        <Link href={cancelHref}>
          <Button className={secondaryButtonClassName}>{backLabel}</Button>
        </Link>
      </FormFooter>
    );
  }

  const saveLabel = mode === "create" ? createSaveLabel : editSaveLabel;

  return (
    <FormFooter className={className}>
      <Link href={cancelHref}>
        <Button className={secondaryButtonClassName}>{cancelLabel}</Button>
      </Link>
      <Button
        onClick={onSave}
        disabled={disabled || isSubmitting}
        className={primaryButtonClassName}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {savingLabel}
          </>
        ) : (
          saveLabel
        )}
      </Button>
    </FormFooter>
  );
}
