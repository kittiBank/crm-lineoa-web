"use client";

import { CheckCircle2 } from "lucide-react";

type SuccessStepProps = {
  phone?: string | null;
  richMenuLinked: boolean;
  onClose: () => void;
};

export function SuccessStep({
  phone,
  richMenuLinked,
  onClose,
}: SuccessStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-10 w-10 text-[#06C755]" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบสำเร็จ</h1>
        <p className="mt-2 text-sm text-gray-600">
          สถานะของคุณอัปเดตเป็น Member แล้ว
          {phone ? (
            <>
              <br />
              เบอร์โทร:{" "}
              <span className="font-medium text-gray-900">{phone}</span>
            </>
          ) : null}
        </p>
        <p className="mt-3 text-xs text-gray-500">
          {richMenuLinked
            ? "อัปเดต Rich Menu ของสมาชิกเรียบร้อยแล้ว"
            : "เข้าสู่ระบบสำเร็จ แต่ยังไม่มี Member Rich Menu ที่เปิดใช้งาน"}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-[#06C755] py-3 font-semibold text-white transition hover:bg-[#05b34c] active:scale-[0.98]"
      >
        ปิดหน้าต่าง
      </button>
    </div>
  );
}
