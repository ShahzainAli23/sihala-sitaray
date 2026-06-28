import { useEffect, useState } from "react";

import { getSignedStorageUrl } from "../lib/storageUrls";
import type { Profile } from "../types/profile";

type AuthorHeaderMediaProps = {
  profile: Profile;
};

export function AuthorHeaderMedia({
  profile,
}: AuthorHeaderMediaProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    let ignoreResult = false;

    async function loadHeaderImages() {
      if (profile.header_variant === "text") {
        setImageUrls([]);
        return;
      }

      const paths =
        profile.header_variant === "two-images"
          ? [
              profile.header_image_one_path,
              profile.header_image_two_path,
            ].filter((path): path is string => Boolean(path))
          : [profile.header_image_one_path].filter(
              (path): path is string => Boolean(path),
            );

      if (paths.length === 0) {
        setImageUrls([]);
        return;
      }

      const urls = await Promise.all(
        paths.map((path) => getSignedStorageUrl(path)),
      );

      if (!ignoreResult) {
        setImageUrls(
          urls.filter((url): url is string => Boolean(url)),
        );
      }
    }

    void loadHeaderImages();

    return () => {
      ignoreResult = true;
    };
  }, [
    profile.header_variant,
    profile.header_image_one_path,
    profile.header_image_two_path,
  ]);

  if (profile.header_variant === "text" || imageUrls.length === 0) {
    return null;
  }

  const authorName =
    profile.display_name.trim() ||
    profile.page_title.trim() ||
    "Author";

  return (
    <div
      className={`author-header-media author-header-media--${profile.header_variant}`}
    >
      {imageUrls.map((url, index) => (
        <img
          key={url}
          src={url}
          alt={`${authorName} header image ${index + 1}`}
        />
      ))}
    </div>
  );
}