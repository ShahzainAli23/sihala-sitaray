import {
  useEffect,
  useState,
} from "react";

import { fetchPostMedia } from "../lib/postMedia";
import type { ModerationPost } from "../lib/admin";
import type { PostMediaWithUrl } from "../types/postMedia";

import { StoryContent } from "./StoryContent";

type AdminReviewCardProps = {
  post: ModerationPost;
  actingPostId: string | null;
  onModerate: (
    post: ModerationPost,
    status: "published" | "rejected",
  ) => void;
};

function getAuthorName(post: ModerationPost): string {
  return (
    post.author?.display_name.trim() ||
    post.author?.page_title.trim() ||
    "Unknown author"
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminReviewCard({
  post,
  actingPostId,
  onModerate,
}: AdminReviewCardProps) {
  const [media, setMedia] = useState<PostMediaWithUrl[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const isActing = actingPostId === post.id;

  useEffect(() => {
    let ignoreResult = false;

    async function loadMedia() {
      setMediaLoading(true);
      setMediaError(null);

      try {
        const postMedia = await fetchPostMedia(post.id);

        if (!ignoreResult) {
          setMedia(postMedia);
        }
      } catch (error) {
        if (!ignoreResult) {
          setMedia([]);
          setMediaError(
            error instanceof Error
              ? error.message
              : "Unable to load attached media.",
          );
        }
      } finally {
        if (!ignoreResult) {
          setMediaLoading(false);
        }
      }
    }

    void loadMedia();

    return () => {
      ignoreResult = true;
    };
  }, [post.id]);

  return (
    <article className="admin-review-card">
      <div className="admin-review-card__top">
        <div>
          <p className="eyebrow">Submitted by</p>

          <h2>{getAuthorName(post)}</h2>

          <p className="admin-review-card__meta">
            Submitted / updated {formatDate(post.updated_at)}
          </p>
        </div>

        <span className="status-badge status-badge--pending">
          Pending review
        </span>
      </div>

      <div className="admin-review-card__story-info">
        <p className="eyebrow">Story title</p>

        <h3>{post.title.trim() || "Untitled story"}</h3>

        {post.excerpt.trim() ? (
          <p>{post.excerpt}</p>
        ) : null}
      </div>

      <details className="admin-review-card__preview">
        <summary>Preview full story and media</summary>

        <div className="admin-review-card__preview-content">
          {mediaLoading ? (
            <p>Loading attached media...</p>
          ) : null}

          {mediaError ? (
            <p className="form-feedback form-feedback--error">
              {mediaError}
            </p>
          ) : null}

          {!mediaLoading && !mediaError ? (
            <StoryContent body={post.body} media={media} />
          ) : null}
        </div>
      </details>

      <div className="admin-review-card__actions">
        <button
          type="button"
          className="pill-button admin-review-card__publish"
          disabled={isActing}
          onClick={() => {
            onModerate(post, "published");
          }}
        >
          {isActing ? "Saving..." : "Publish story"} <span>→</span>
        </button>

        <button
          type="button"
          className="danger-button"
          disabled={isActing}
          onClick={() => {
            onModerate(post, "rejected");
          }}
        >
          Return for revision
        </button>
      </div>
    </article>
  );
}