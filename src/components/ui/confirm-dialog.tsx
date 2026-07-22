"use client";

import { AlertTriangle, Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ConfirmDialogVariant = "destructive" | "warning" | "default";

const variantStyles: Record<
  ConfirmDialogVariant,
  {
    iconBg: string;
    iconColor: string;
    confirmButton: string;
    Icon: LucideIcon;
  }
> = {
  destructive: {
    iconBg: "bg-red-100 dark:bg-red-950/40",
    iconColor: "text-red-600 dark:text-red-400",
    confirmButton: "bg-red-600 text-white hover:bg-red-700",
    Icon: AlertTriangle,
  },
  warning: {
    iconBg: "bg-amber-100 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    confirmButton: "bg-amber-600 text-white hover:bg-amber-700",
    Icon: AlertTriangle,
  },
  default: {
    iconBg: "bg-blue-100 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    confirmButton: "bg-blue-600 text-white hover:bg-blue-700",
    Icon: AlertTriangle,
  },
};

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: ConfirmDialogVariant;
  cancelLabel?: string;
  confirmLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  showCloseButton?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  variant = "destructive",
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  loadingLabel = "Processing...",
  isLoading = false,
  onConfirm,
  showCloseButton = true,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];
  const IconComponent = styles.Icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton && !isLoading}
        className="gap-0 overflow-hidden p-0 sm:max-w-[400px]"
      >
        <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <div
            className={cn(
              "mb-5 flex h-14 w-14 items-center justify-center rounded-full",
              styles.iconBg,
            )}
          >
            {icon ?? (
              <IconComponent className={cn("h-7 w-7", styles.iconColor)} />
            )}
          </div>

          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </DialogTitle>

          {description ? (
            <DialogDescription className="mt-3 max-w-[320px] text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {description}
            </DialogDescription>
          ) : null}
        </div>

        <div className="flex justify-center gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="h-10 min-w-[96px] border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={cn(
              "h-10 min-w-[96px] px-4 text-sm font-semibold",
              styles.confirmButton,
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
