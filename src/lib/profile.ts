import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";

export const SUPER_ADMIN_ROLE = "super_admin";

export interface ProfileLineAccount {
  id: string;
  name: string;
  displayName: string | null;
  pictureUrl: string | null;
  basicId: string | null;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  lineAccount: ProfileLineAccount | null;
}

let profileRequest: Promise<Profile> | null = null;

/**
 * Signed-in user with their role and LINE OA. Shared by the navbar and pages,
 * so one page load makes a single request. Logout hard-reloads, which resets it.
 */
export function fetchProfile(): Promise<Profile> {
  profileRequest ??= (async () => {
    const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    await assertOkResponse(response, "Failed to load profile");
    return (await response.json()) as Profile;
  })().catch((error: unknown) => {
    profileRequest = null;
    throw error;
  });

  return profileRequest;
}
