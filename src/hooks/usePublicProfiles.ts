import { useCallback, useEffect, useState } from "react";

import {
  fetchActiveProfileByUsername,
  fetchActiveProfiles,
} from "../lib/profiles";
import type { Profile } from "../types/profile";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while loading author profiles.";
}

export function usePublicProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeProfiles = await fetchActiveProfiles();
      setProfiles(activeProfiles);
    } catch (caughtError) {
      setProfiles([]);
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles]);

  return {
    profiles,
    loading,
    error,
    refreshProfiles,
  };
}

export function usePublicProfile(username: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignoreResult = false;

    async function loadProfile() {
      if (!username) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const activeProfile =
          await fetchActiveProfileByUsername(username);

        if (!ignoreResult) {
          setProfile(activeProfile);
        }
      } catch (caughtError) {
        if (!ignoreResult) {
          setProfile(null);
          setError(getErrorMessage(caughtError));
        }
      } finally {
        if (!ignoreResult) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      ignoreResult = true;
    };
  }, [username]);

  return {
    profile,
    loading,
    error,
  };
}