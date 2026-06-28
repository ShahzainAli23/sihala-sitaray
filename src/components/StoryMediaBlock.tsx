import type { PostMediaWithUrl } from "../types/postMedia";

type StoryMediaBlockProps = {
  media: PostMediaWithUrl;
};

export function StoryMediaBlock({
  media,
}: StoryMediaBlockProps) {
  if (!media.signed_url) {
    return (
      <div className="story-media-unavailable">
        This media is temporarily unavailable.
      </div>
    );
  }

  return (
    <figure className="story-media-block">
      {media.media_type === "image" ? (
        <img
          src={media.signed_url}
          alt={media.alt_text || "Story image"}
          loading="lazy"
        />
      ) : (
        <video
          controls
          preload="metadata"
          src={media.signed_url}
        >
          Your browser does not support this video.
        </video>
      )}

      {media.caption.trim() ? (
        <figcaption>{media.caption}</figcaption>
      ) : null}
    </figure>
  );
}