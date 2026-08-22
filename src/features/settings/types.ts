export type LineOaInfo = {
  botUserId: string;
  basicId: string;
  premiumId: string | null;
  displayName: string;
  pictureUrl: string | null;
  chatMode: string | null;
  markAsReadMode: string | null;
  followerCount: number | null;
  targetedReaches: number | null;
  blockCount: number | null;
  quotaType: string | null;
  quotaLimit: number | null;
  quotaUsed: number | null;
  infoSyncedAt: string;
};

export type LineAccountResponse = {
  connected: boolean;
  status?: string;
  saved?: boolean;
  id?: string;
  name?: string;
  hasCredentials?: boolean;
  channelAccessTokenMasked?: string;
  channelSecretMasked?: string;
  oaInfo?: LineOaInfo | null;
};
