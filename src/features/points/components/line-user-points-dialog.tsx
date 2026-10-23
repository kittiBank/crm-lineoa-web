"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";
import { adjustLineUserPoints, fetchLineUserPoints } from "../lib/api";
import { formatPoints } from "../lib/rules";
import { LineUserPointsResponse } from "../types";
import { PointHistoryList } from "./point-history-list";

type AdjustMode = "add" | "deduct";

interface LineUserPointsDialogProps {
  /** LineUser.id; null closes the dialog */
  lineUserId: string | null;
  displayName: string;
  onOpenChange: (open: boolean) => void;
  /** Called with the new balance after an adjustment. */
  onBalanceChange: (lineUserId: string, balance: number) => void;
}

/**
 * Admin: a LINE user's point balance, history and manual adjustment.
 * Render with `key={lineUserId}` so the form resets per user.
 */
export function LineUserPointsDialog({
  lineUserId,
  displayName,
  onOpenChange,
  onBalanceChange,
}: LineUserPointsDialogProps) {
  const toast = useToast();
  const [loaded, setLoaded] = useState<{
    id: string;
    data?: LineUserPointsResponse;
    error?: string;
  } | null>(null);
  const [mode, setMode] = useState<AdjustMode>("add");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!lineUserId) return;

    let isCancelled = false;

    fetchLineUserPoints(lineUserId)
      .then((result) => {
        if (!isCancelled) setLoaded({ id: lineUserId, data: result });
      })
      .catch((err) => {
        if (!isCancelled) {
          setLoaded({
            id: lineUserId,
            error: err instanceof Error ? err.message : "Failed to load points",
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [lineUserId]);

  const current = loaded?.id === lineUserId ? loaded : null;
  const data = current?.data ?? null;
  const error = current?.error ?? null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lineUserId || !data) return;

    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1) {
      setFormError("Enter a whole number of points, 1 or more");
      return;
    }
    if (mode === "deduct" && value > data.balance) {
      setFormError(`Cannot deduct more than the balance (${formatPoints(data.balance)})`);
      return;
    }
    if (!note.trim()) {
      setFormError("A note is required so the history explains the change");
      return;
    }

    setSaving(true);
    try {
      const result = await adjustLineUserPoints(lineUserId, {
        points: mode === "add" ? value : -value,
        note: note.trim(),
      });
      setLoaded({ id: lineUserId, data: result });
      setAmount("");
      setNote("");
      setFormError(null);
      onBalanceChange(lineUserId, result.balance);
      toast.success(
        `${mode === "add" ? "Added" : "Deducted"} ${formatPoints(value)} points`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to adjust points");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={lineUserId !== null}
      onOpenChange={(open) => {
        if (!saving) onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Points · {displayName}</DialogTitle>
          <DialogDescription>
            Balance, history and manual adjustments. Points never expire.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        ) : !data ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Balance
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPoints(data.balance)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="flex gap-2">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as AdjustMode)}
                  className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  aria-label="Adjustment type"
                >
                  <option value="add">Add</option>
                  <option value="deduct">Deduct</option>
                </select>
                <Input
                  type="number"
                  min={1}
                  step="1"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="Points"
                  className="w-28"
                  aria-label="Points"
                />
                <Input
                  value={note}
                  maxLength={200}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="Note (required)"
                  className="min-w-0 flex-1"
                  aria-label="Note"
                />
              </div>
              {formError && (
                <p className="text-xs text-red-500 dark:text-red-400">{formError}</p>
              )}
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : mode === "add" ? (
                  "Add points"
                ) : (
                  "Deduct points"
                )}
              </Button>
            </form>

            <div className="max-h-72 overflow-y-auto">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                History
              </p>
              <PointHistoryList history={data.history} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
