import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { AdminReviewCard } from "../components/AdminReviewCard";
import {
  fetchPendingPosts,
  updatePostModerationStatus,
  type ModerationPost,
} from "../lib/admin";

export function AdminReviewPage() {
  const [posts, setPosts] = useState<ModerationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingPostId, setActingPostId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  const loadPendingPosts = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const pendingPosts = await fetchPendingPosts();
      setPosts(pendingPosts);
    } catch (error) {
      setPosts([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load pending stories.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPendingPosts();
  }, [loadPendingPosts]);

  async function handleModeration(
    post: ModerationPost,
    status: "published" | "rejected",
  ) {
    const action =
      status === "published"
        ? "publish"
        : "return this story for revision";

    const confirmed = window.confirm(
      `Are you sure you want to ${action}?\n\n"${post.title || "Untitled story"}"`,
    );

    if (!confirmed) {
      return;
    }

    setActingPostId(post.id);
    setMessage(null);

    try {
      await updatePostModerationStatus(post.id, status);

      setPosts((currentPosts) =>
        currentPosts.filter((item) => item.id !== post.id),
      );

      setMessage(
        status === "published"
          ? "Story published successfully."
          : "Story returned to the author for revision.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update this story.",
      );
    } finally {
      setActingPostId(null);
    }
  }

  return (
    <section className="dashboard-page">
      <div className="page-container page-container--narrow">
        <div className="dashboard-page__topbar">
          <div>
            <p className="eyebrow eyebrow--accent">Admin moderation</p>

            <h1>Review story submissions</h1>

            <p className="dashboard-page__email">
              Publish approved work or return a story so its author can
              revise and submit it again.
            </p>
          </div>

          <Link to="/dashboard" className="text-link">
            ← Dashboard
          </Link>
        </div>

        {message ? (
          <p className="form-feedback">{message}</p>
        ) : null}

        {loading ? (
          <div className="story-list-empty">
            Loading pending submissions...
          </div>
        ) : null}

        {!loading && posts.length === 0 ? (
          <div className="story-list-empty">
            <h2>No submissions waiting for review.</h2>

            <p>
              Stories will appear here after an author submits them for
              review.
            </p>
          </div>
        ) : null}

        {!loading && posts.length > 0 ? (
          <div className="admin-review-list">
            {posts.map((post) => (
              <AdminReviewCard
                key={post.id}
                post={post}
                actingPostId={actingPostId}
                onModerate={handleModeration}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}