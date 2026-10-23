export type PointTransactionType =
  | "EARN"
  | "REDEEM_DISCOUNT"
  | "REDEEM_REWARD"
  | "REFUND"
  | "REVERSE"
  | "ADJUST";

export interface PointTransaction {
  id: string;
  type: PointTransactionType;
  /** Signed: + added, - deducted */
  points: number;
  balanceAfter: number;
  note: string | null;
  orderId: string | null;
  orderNumber: string | null;
  /** Admin name/email for ADJUST entries */
  createdBy: string | null;
  createdAt: string;
}

export interface PointRules {
  earnBahtPerPoint: number;
  pointValueBaht: number;
  maxDiscountRatio: number;
}

export interface MyPointsResponse {
  isMember: boolean;
  balance: number;
  rules: PointRules;
  history: PointTransaction[];
}

export interface LineUserPointsResponse {
  lineUserId: string;
  balance: number;
  history: PointTransaction[];
}

export const POINT_TRANSACTION_LABELS: Record<PointTransactionType, string> = {
  EARN: "Earned from order",
  REDEEM_DISCOUNT: "Used as discount",
  REDEEM_REWARD: "Redeemed reward",
  REFUND: "Returned (order cancelled)",
  REVERSE: "Taken back (order cancelled)",
  ADJUST: "Adjusted by admin",
};
