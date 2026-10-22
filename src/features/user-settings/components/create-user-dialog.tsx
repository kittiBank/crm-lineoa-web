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
import { Input } from "@/components/ui/input";
import { AdminLineAccount } from "@/features/settings/types";
import { useToast } from "@/lib/hooks/useToast";
import { createUser, DEFAULT_USER_PASSWORD } from "../lib/api";
import { AdminUser, CreateUserInput } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_FORM: CreateUserInput = { email: "", name: "", lineAccountId: "" };

type FormErrors = Partial<Record<keyof CreateUserInput, string>>;

function validate(form: CreateUserInput): FormErrors {
  const errors: FormErrors = {};
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Enter a valid email";
  }
  if (!form.name.trim()) {
    errors.name = "Full name is required";
  }
  if (!form.lineAccountId) {
    errors.lineAccountId = "LINE OA is required";
  }
  return errors;
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineAccounts: AdminLineAccount[];
  onCreated: (user: AdminUser) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  lineAccounts,
  onCreated,
}: CreateUserDialogProps) {
  const toast = useToast();
  const [form, setForm] = useState<CreateUserInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (saving) return;
    if (!next) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
    onOpenChange(next);
  };

  const update = (field: keyof CreateUserInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const user = await createUser({
        email: form.email.trim(),
        name: form.name.trim(),
        lineAccountId: form.lineAccountId,
      });
      toast.success(`Created ${user.email}`);
      onCreated(user);
      setForm(EMPTY_FORM);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create user",
      );
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (field: keyof CreateUserInput) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
        {errors[field]}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            New users are admins of the selected LINE OA and sign in with the
            initial password <span className="font-mono">{DEFAULT_USER_PASSWORD}</span>.
          </DialogDescription>
        </DialogHeader>

        <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="user@example.com"
              disabled={saving}
              aria-invalid={!!errors.email}
            />
            {fieldError("email")}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Somchai Jaidee"
              disabled={saving}
              aria-invalid={!!errors.name}
            />
            {fieldError("name")}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              LINE OA <span className="text-red-500">*</span>
            </label>
            <select
              value={form.lineAccountId}
              onChange={(e) => update("lineAccountId", e.target.value)}
              disabled={saving}
              aria-invalid={!!errors.lineAccountId}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 aria-invalid:border-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="" disabled>
                {lineAccounts.length ? "Select LINE OA" : "No LINE OA connected yet"}
              </option>
              {lineAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.displayName || account.name}
                  {account.basicId ? ` (${account.basicId})` : ""}
                </option>
              ))}
            </select>
            {fieldError("lineAccountId")}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" form="create-user-form" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
