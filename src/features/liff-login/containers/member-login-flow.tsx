"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { PhoneStep } from "../components/phone-step";
import { OtpStep } from "../components/otp-step";
import { SuccessStep } from "../components/success-step";
import { requestOtp, verifyOtp } from "../lib/api";
import { closeLiffWindow, initLiffSession, type LiffSession } from "../lib/liff";
import type { LiffLoginStep } from "../types";

function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

function isValidPhone(value: string): boolean {
  return /^[0-9+\-]{9,20}$/.test(value.replace(/\s/g, ""));
}

export function MemberLoginFlow() {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [session, setSession] = useState<LiffSession | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string>();

  const [step, setStep] = useState<LiffLoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [demoHint, setDemoHint] = useState<string>();
  const [expiresAt, setExpiresAt] = useState<number>();
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string>();
  const [richMenuLinked, setRichMenuLinked] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const nextSession = await initLiffSession();
        if (!cancelled) {
          setSession(nextSession);
        }
      } catch (err) {
        if (!cancelled) {
          setBootstrapError(
            err instanceof Error ? err.message : "Failed to initialize LIFF",
          );
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!expiresAt || step !== "otp") {
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    };

    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [expiresAt, step]);

  const applyOtpSession = useCallback(
    (result: { expiresAt: string; expiresIn: number; demoOtp?: string }) => {
      const expiresMs = Date.parse(result.expiresAt);
      setExpiresAt(
        Number.isFinite(expiresMs)
          ? expiresMs
          : Date.now() + result.expiresIn * 1000,
      );
      setSecondsLeft(result.expiresIn);
      setDemoHint(result.demoOtp);
      setOtp("");
      setError(undefined);
      setStep("otp");
    },
    [],
  );

  const handleRequestOtp = useCallback(async () => {
    if (!session) {
      return;
    }

    const normalized = normalizePhone(phone);
    if (!isValidPhone(normalized)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const result = await requestOtp({
        lineUserId: session.lineUserId,
        phone: normalized,
      });
      setPhone(normalized);
      applyOtpSession(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่ง OTP ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [applyOtpSession, phone, session]);

  const handleResendOtp = useCallback(async () => {
    if (!session) {
      return;
    }

    setResending(true);
    setError(undefined);

    try {
      const result = await requestOtp({
        lineUserId: session.lineUserId,
        phone: normalizePhone(phone),
      });
      applyOtpSession(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่ง OTP ใหม่ไม่สำเร็จ");
    } finally {
      setResending(false);
    }
  }, [applyOtpSession, phone, session]);

  const handleVerifyOtp = useCallback(async () => {
    if (!session) {
      return;
    }

    if (otp.length !== 6) {
      setError("กรุณากรอกรหัส OTP 6 หลัก");
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const result = await verifyOtp({
        lineUserId: session.lineUserId,
        phone: normalizePhone(phone),
        otp,
      });
      setRichMenuLinked(result.richMenuLinked);
      setVerifiedPhone(result.phone || phone);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ยืนยัน OTP ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [otp, phone, session]);

  const subtitle = useMemo(() => {
    if (!session) {
      return null;
    }

    return (
      <p className="text-xs text-gray-400">
        {session.displayName ? `${session.displayName} · ` : null}
        {session.lineUserId}
        {session.usingMock ? " (mock)" : null}
      </p>
    );
  }, [session]);

  if (bootstrapping) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#06C755]" />
        <p className="text-sm">กำลังเตรียมหน้าเข้าสู่ระบบ...</p>
      </div>
    );
  }

  if (bootstrapError || !session) {
    return (
      <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
        <p className="font-semibold">เปิด LIFF ไม่สำเร็จ</p>
        <p>{bootstrapError || "Unknown LIFF error"}</p>
        <ul className="list-disc space-y-1 pl-4 text-xs text-red-600">
          <li>
            เปิดจาก LINE:{" "}
            <span className="font-mono">
              https://liff.line.me/{process.env.NEXT_PUBLIC_LIFF_ID || "LIFF_ID"}
            </span>
          </li>
          <li>
            Endpoint URL ต้องเป็น domain ของ frontend +{" "}
            <span className="font-mono">/liff/login</span>
          </li>
          <li>
            ทดสอบใน browser: เพิ่ม{" "}
            <span className="font-mono">?lineUserId=Uxxxx</span>
          </li>
        </ul>
      </div>
    );
  }

  const activeIndex =
    step === "phone" ? 0 : step === "otp" ? 1 : 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {(["phone", "otp", "success"] as LiffLoginStep[]).map((item, index) => {
          const reached = index <= activeIndex;
          const completed = index < activeIndex;

          return (
            <div key={item} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  reached
                    ? "bg-[#06C755] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              {index < 2 ? (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    completed ? "bg-[#06C755]" : "bg-gray-200"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {step === "phone" ? (
        <PhoneStep
          phone={phone}
          loading={loading}
          error={error}
          onPhoneChange={(value) => {
            setPhone(value);
            setError(undefined);
          }}
          onSubmit={handleRequestOtp}
        />
      ) : null}

      {step === "otp" ? (
        <OtpStep
          phone={phone}
          otp={otp}
          loading={loading}
          resending={resending}
          secondsLeft={secondsLeft}
          error={error}
          demoHint={demoHint}
          onOtpChange={(value) => {
            setOtp(value);
            setError(undefined);
          }}
          onSubmit={handleVerifyOtp}
          onResend={handleResendOtp}
          onBack={() => {
            setStep("phone");
            setError(undefined);
            setOtp("");
          }}
        />
      ) : null}

      {step === "success" ? (
        <SuccessStep
          phone={verifiedPhone}
          richMenuLinked={richMenuLinked}
          onClose={closeLiffWindow}
        />
      ) : null}

      {subtitle}
    </div>
  );
}
