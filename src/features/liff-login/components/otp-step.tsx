"use client";

import { Loader2 } from "lucide-react";

type OtpStepProps = {
  phone: string;
  otp: string;
  loading: boolean;
  resending: boolean;
  secondsLeft: number;
  error?: string;
  demoHint?: string;
  onOtpChange: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
};

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function OtpStep({
  phone,
  otp,
  loading,
  resending,
  secondsLeft,
  error,
  demoHint,
  onOtpChange,
  onSubmit,
  onResend,
  onBack,
}: OtpStepProps) {
  const expired = secondsLeft <= 0;

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <button
          type="button"
          onClick={onBack}
          disabled={loading || resending}
          className="mb-3 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50"
        >
          ← กลับ
        </button>
        <h1 className="text-2xl font-bold text-gray-900">ยืนยันรหัส OTP</h1>
        <p className="mt-2 text-sm text-gray-600">
          ส่งรหัสไปที่{" "}
          <span className="font-medium text-gray-900">{phone}</span>
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          รหัส OTP 6 หลัก
        </label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={otp}
          onChange={(event) =>
            onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          disabled={loading || resending}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-2xl tracking-[0.4em] text-gray-900 placeholder-gray-300 transition focus:border-transparent focus:ring-2 focus:ring-[#06C755] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={expired ? "text-red-500" : "text-gray-500"}>
            {expired
              ? "รหัสหมดอายุแล้ว"
              : `หมดอายุใน ${formatCountdown(secondsLeft)}`}
          </span>
          <button
            type="button"
            onClick={onResend}
            disabled={!expired || loading || resending}
            className="font-medium text-[#06C755] disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {resending ? "กำลังส่งใหม่..." : "ส่งรหัสใหม่"}
          </button>
        </div>
        {demoHint ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Demo OTP: {demoHint}
          </p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
      </div>

      <button
        type="submit"
        disabled={loading || resending || otp.length !== 6 || expired}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] py-3 font-semibold text-white transition hover:bg-[#05b34c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {loading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
      </button>
    </form>
  );
}
