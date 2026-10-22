import { useEffect, useState } from "react";
import { fetchProfile, Profile, SUPER_ADMIN_ROLE } from "@/lib/profile";

/** Current user profile; `profile` stays null until it loads (or if it fails). */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((data) => !cancelled && setProfile(data))
      .catch(() => undefined) // Callers render their signed-out/empty state.
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    profile,
    loading,
    isSuperAdmin: profile?.role === SUPER_ADMIN_ROLE,
  };
}
