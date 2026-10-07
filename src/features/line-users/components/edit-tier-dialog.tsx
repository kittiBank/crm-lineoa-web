"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LineUser, USER_TIERS, UserTier } from "../types";

const NO_TIER = "";

interface EditTierDialogProps {
  user: LineUser | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: LineUser, userTier: UserTier | null) => void;
}

export function EditTierDialog({
  user,
  isSaving,
  onOpenChange,
  onSave,
}: EditTierDialogProps) {
  return (
    <Dialog
      open={Boolean(user)}
      onOpenChange={(open) => {
        if (!isSaving) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isSaving}>
        {user ? (
          // Keyed so the selected tier resets for each user.
          <EditTierForm
            key={user.id}
            user={user}
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
  user,
  isSaving,
  onCancel,
  onSave,
}: {
  user: LineUser;
  isSaving: boolean;
  onCancel: () => void;
  onSave: EditTierDialogProps["onSave"];
}) {
  // Admins edit the assigned tier; the effective tier can be higher.
  const [userTier, setUserTier] = useState<UserTier | null>(user.assignedTier);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit User Tier</DialogTitle>
        <DialogDescription>
          This tier is a minimum: spend in the last 12 months can raise the user
          above it (Silver ฿1,000+, Gold ฿5,000+, Platinum ฿10,000+).
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 text-sm">
        <div>
          <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
            LINE User
          </span>
          <div className="text-gray-900 dark:text-white">
            {user.displayName}
          </div>
          <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
            {user.lineUserId}
          </div>
        </div>
        {user.phone ? (
          <div>
            <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
              Tel No
            </span>
            <span className="font-mono text-gray-900 dark:text-white">
              {user.phone}
            </span>
          </div>
        ) : null}
        <div>
          <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
            Current Tier
          </span>
          <span className="text-gray-900 dark:text-white">
            {user.userTier ?? "No tier"}
          </span>
        </div>
        <div>
          <label
            htmlFor="line-user-tier"
            className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300"
          >
            Assigned Tier
          </label>
          <select
            id="line-user-tier"
            value={userTier ?? NO_TIER}
            onChange={(event) =>
              setUserTier(
                event.target.value === NO_TIER
                  ? null
                  : (event.target.value as UserTier),
              )
            }
            disabled={isSaving}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value={NO_TIER}>None (spend only)</option>
            {USER_TIERS.map((tier) => (
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
          onClick={() => onSave(user, userTier)}
          disabled={isSaving || user.assignedTier === userTier}
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
