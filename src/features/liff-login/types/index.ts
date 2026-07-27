export type LiffLoginStep = "phone" | "otp" | "success";

export type RequestOtpResponse = {
  status: string;
  expiresIn: number;
  expiresAt: string;
  sessionId: string;
  demoOtp?: string;
};

export type VerifyOtpResponse = {
  status: string;
  userType: "Member" | "Guest";
  phone?: string | null;
  richMenuLinked: boolean;
  message: string;
};
