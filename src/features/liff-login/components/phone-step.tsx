"use client";

import { Loader2, Phone } from "lucide-react";

type PhoneStepProps = {
  phone: string;
  loading: boolean;
  error?: string;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
};

export function PhoneStep({
  phone,
  loading,
  error,
  onPhoneChange,
  onSubmit,
}: PhoneStepProps) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบสมาชิก</h1>
        <p className="mt-2 text-sm text-gray-600">
          กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          เบอร์โทรศัพท์
        </label>
        <div className="relative">
          <Phone className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0812345678"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:ring-2 focus:ring-[#06C755] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] py-3 font-semibold text-white transition hover:bg-[#05b34c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {loading ? "กำลังส่ง OTP..." : "ส่งรหัส OTP"}
      </button>
    </form>
  );
}
