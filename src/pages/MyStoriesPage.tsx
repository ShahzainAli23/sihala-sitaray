import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { PostStatusBadge } from "../components/PostStatusBadge";
import {
  deletePost,
  fetchMyPosts,
} from "../lib/posts";
import type { Post } from "../types/post";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getPostPreview(post: Post): string {
  if (post.excerpt.trim()) {
    return post.excerpt.trim();
  }

  if (post.body.trim()) {
    return `${post.body.trim().slice(0, 150)}${
      post.body.trim().length > 150 ? "..." : ""
    }`;
  }

  return "No story content has been written yet.";
}

export function MyStoriesPage() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const loadedPosts = await fetchMyPosts(user.id);
      setPosts(loadedPosts);
    } catch (error) {
      setPosts([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your stories.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  async function handleDelete(post: Post) {
    if (!user || post.status === "published") {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${post.title || "Untitled story"}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePost(post.id, user.id);
      await loadPosts();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this story.",
      );
    }
  }

  return (
    <section className="dashboard-page">
      <div className="page-container page-container--narrow">
        <div className="dashboard-page__topbar">
          <div>
            <p className="eyebrow eyebrow--accent">My stories</p>

            <h1>Your writing</h1>

            <p className="dashboard-page__email">
              Draft stories stay private until you submit them for review.
            </p>
          </div>

          <Link to="/dashboard/stories/new" className="pill-button">
            New story <span>→</span>
          </Link>
        </div>

        {message ? (
          <p className="form-feedback form-feedback--error">
            {message}
          </p>
        ) : null}

        {loading ? (
          <div className="story-list-empty">
            Loading your stories...
          </div>
        ) : null}

        {!loading && posts.length === 0 ? (
          <div className="story-list-empty">
            <h2>No stories yet.</h2>

            <p>
              Start a draft whenever you are ready. You can edit it later
              before submitting it for review.
            </p>

            <Link to="/dashboard/stories/new" className="secondary-button">
              Write your first story <span>→</span>
            </Link>
          </div>
        ) : null}

        {!loading && posts.length > 0 ? (
          <div className="story-list">
            {posts.map((post) => (
              <article key={post.id} className="story-list-card">
                <div className="story-list-card__top">
                  <PostStatusBadge status={post.status} />

                  <span className="story-list-card__date">
                    Updated {formatDate(post.updated_at)}
                  </span>
                </div>

                <h2>{post.title.trim() || "Untitled story"}</h2>

                <p>{getPostPreview(post)}</p>

                <div className="story-list-card__actions">
                  {post.status !== "published" ? (
                    <Link
                      to={`/dashboard/stories/${post.id}/edit`}
                      className="secondary-button"
                    >
                      Edit story <span>→</span>
                    </Link>
                  ) : null}

                  {post.status !== "published" ? (
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => {
                        void handleDelete(post);
                      }}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}