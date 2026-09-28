"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IMPORT_TIERS,
  ImportTier,
  ImportedAudienceRecord,
} from "../types/audience-import";
import { ImportTierBadge } from "./import-tier-badge";
import { LineOaIdCell } from "./import-audience-table";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="shrink-0 text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-gray-900 dark:text-white">
        {children}
      </dd>
    </div>
  );
}

interface ViewImportedAudienceDialogProps {
  record: ImportedAudienceRecord | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (record: ImportedAudienceRecord) => void;
}

export function ViewImportedAudienceDialog({
  record,
  onOpenChange,
  onEdit,
}: ViewImportedAudienceDialogProps) {
  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Imported Audience</DialogTitle>
          <DialogDescription>
            Tel no to user tier mapping from an import file.
          </DialogDescription>
        </DialogHeader>

        {record ? (
          <dl className="divide-y divide-gray-100 text-sm dark:divide-gray-700">
            <DetailRow label="Tel No">
              <span className="font-mono">{record.phone}</span>
            </DetailRow>
            <DetailRow label="User Tier">
              <ImportTierBadge tier={record.userTier} />
            </DetailRow>
            <DetailRow label="LINE OA ID">
              <div className="flex justify-end">
                <LineOaIdCell lineUser={record.lineUser} />
              </div>
            </DetailRow>
            <DetailRow label="Imported">
              {formatDateTime(record.createdAt)}
            </DetailRow>
            <DetailRow label="Last updated">
              {formatDateTime(record.updatedAt)}
            </DetailRow>
          </dl>
        ) : null}

        {record && !record.lineUser ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No LINE user has verified this tel no yet. The tier is applied
            automatically when they log in with LINE OTP.
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {record ? (
            <Button onClick={() => onEdit(record)}>Edit tier</Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditImportedAudienceDialogProps {
  record: ImportedAudienceRecord | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (record: ImportedAudienceRecord, userTier: ImportTier) => void;
}

export function EditImportedAudienceDialog({
  record,
  isSaving,
  onOpenChange,
  onSave,
}: EditImportedAudienceDialogProps) {
  return (
    <Dialog
      open={Boolean(record)}
      onOpenChange={(open) => {
        if (!isSaving) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isSaving}>
        {record ? (
          // Keyed so the selected tier resets for each record.
          <EditTierForm
            key={record.id}
            record={record}
            isSaving={isSaving}
            onCancel={() => onOpenChange(false)}
            onSave={onSave}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EditTierForm({
  record,
  isSaving,
  onCancel,
  onSave,
}: {
  record: ImportedAudienceRecord;
  isSaving: boolean;
  onCancel: () => void;
  onSave: EditImportedAudienceDialogProps["onSave"];
}) {
  const [userTier, setUserTier] = useState<ImportTier>(record.userTier);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit User Tier</DialogTitle>
        <DialogDescription>
          {record.lineUser
            ? "The linked LINE user's tier is updated too."
            : "Applied to the LINE user once they verify this tel no."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 text-sm">
        <div>
          <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
            Tel No
          </span>
          <span className="font-mono text-gray-900 dark:text-white">
            {record.phone}
          </span>
        </div>
        <div>
          <label
            htmlFor="imported-audience-tier"
            className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300"
          >
            User Tier
          </label>
          <select
            id="imported-audience-tier"
            value={userTier}
            onChange={(event) => setUserTier(event.target.value as ImportTier)}
            disabled={isSaving}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {IMPORT_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={() => onSave(record, userTier)}
          disabled={isSaving || record.userTier === userTier}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

interface DeleteImportedAudienceDialogProps {
  record: ImportedAudienceRecord | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteImportedAudienceDialog({
  record,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteImportedAudienceDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(record)}
      onOpenChange={onOpenChange}
      title="Delete Imported Audience"
      description={
        <>
          Delete{" "}
          <span className="font-mono font-medium text-gray-900 dark:text-white">
            {record?.phone}
          </span>
          ?{" "}
          {record?.lineUser
            ? "The linked LINE user's tier will be cleared. "
            : ""}
          This action cannot be undone.
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
