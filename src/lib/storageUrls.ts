import { supabase } from "./supabase";

export const MEDIA_BUCKET = "post-media";

export async function getSignedStorageUrl(
  storagePath: string,
  expiresInSeconds = 60 * 60,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function getSignedStorageUrls(
  storagePaths: string[],
  expiresInSeconds = 60 * 60,
): Promise<Map<string, string | null>> {
  const uniquePaths = [...new Set(storagePaths.filter(Boolean))];

  const results = await Promise.all(
    uniquePaths.map(async (path) => {
      const signedUrl = await getSignedStorageUrl(
        path,
        expiresInSeconds,
      );

      return [path, signedUrl] as const;
    }),
  );

  return new Map(results);
}