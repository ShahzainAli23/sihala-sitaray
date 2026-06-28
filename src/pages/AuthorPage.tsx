import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { AuthorHeaderMedia } from "../components/AuthorHeaderMedia";
import { usePublicProfile } from "../hooks/usePublicProfiles";
import { fetchPublishedPostsForAuthor } from "../lib/publicContent";

import type { Post } from "../types/post";
import type { Profile } from "../types/profile";

function getAuthorPageTitle(profile: Profile): string {
  return (
    profile.page_title.trim() ||
    profile.display_name.trim() ||
    profile.nav_label.trim() ||
    "Stories"
  );
}

function getAuthorBio(profile: Profile): string {
  return (
    profile.bio.trim() ||
    "Stories, thoughts, and imagination shared one page at a time."
  );
}

function getPostPreview(post: Post): string {
  if (post.excerpt.trim()) {
    return post.excerpt.trim();
  }

  if (post.body.trim()) {
    return `${post.body.trim().slice(0, 160)}${
      post.body.trim().length > 160 ? "..." : ""
    }`;
  }

  return "Read this story.";
}

function formatStoryDate(post: Post): string {
  const date = post.published_at ?? post.created_at;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function AuthorPage() {
  const { username } = useParams();

  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = usePublicProfile(username);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    let ignoreResult = false;

    async function loadPosts() {
      if (!profile) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }

      setPostsLoading(true);
      setPostsError(null);

      try {
        const publishedPosts = await fetchPublishedPostsForAuthor(
          profile.id,
        );

        if (!ignoreResult) {
          setPosts(publishedPosts);
        }
      } catch (error) {
        if (!ignoreResult) {
          setPosts([]);
          setPostsError(
            error instanceof Error
              ? error.message
              : "Unable to load stories.",
          );
        }
      } finally {
        if (!ignoreResult) {
          setPostsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      ignoreResult = true;
    };
  }, [profile]);

  if (profileLoading) {
    return (
      <section className="author-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">Author</p>
          <h1 className="author-page__title">Loading stories...</h1>
        </div>
      </section>
    );
  }

  if (profileError) {
    return (
      <section className="author-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">Author</p>

          <h1 className="author-page__title">
            Unable to load this author.
          </h1>

          <p className="author-page__tagline">{profileError}</p>

          <Link to="/" className="pill-button">
            Go home <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  if (!profile || !profile.username) {
    return (
      <section className="author-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">Author</p>

          <h1 className="author-page__title">Author not found</h1>

          <p className="author-page__tagline">
            This author does not exist or is not publicly active yet.
          </p>

          <Link to="/" className="pill-button">
            Go home <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`author-page author-page--${profile.header_variant}`}
    >
      <div className="page-container page-container--narrow">
        <div className="author-page__intro">
          <p className="eyebrow eyebrow--accent">Author</p>

          <h1 className="author-page__title">
            {getAuthorPageTitle(profile)}
          </h1>

          <p className="author-page__tagline">
            {getAuthorBio(profile)}
          </p>
        </div>

        <AuthorHeaderMedia profile={profile} />

        <section className="author-stories-section">
          <p className="eyebrow">Stories</p>

          {postsLoading ? (
            <div className="story-empty-state">
              <h2>Loading stories...</h2>
            </div>
          ) : null}

          {!postsLoading && postsError ? (
            <div className="story-empty-state">
              <h2>Unable to load stories.</h2>
              <p>{postsError}</p>
            </div>
          ) : null}

          {!postsLoading && !postsError && posts.length === 0 ? (
            <div className="story-empty-state">
              <h2>No stories published yet.</h2>

              <p>
                Once this author publishes an approved story, it will
                appear here.
              </p>
            </div>
          ) : null}

          {!postsLoading && !postsError && posts.length > 0 ? (
            <div className="public-story-list">
              {posts.map((post) => (
                <article key={post.id} className="public-story-card">
                  <p className="public-story-card__date">
                    {formatStoryDate(post)}
                  </p>

                  <h2>{post.title || "Untitled story"}</h2>

                  <p>{getPostPreview(post)}</p>

                  <Link
                    to={`/stories/${profile.username}/${post.slug}`}
                    className="secondary-button"
                  >
                    Read story <span>→</span>
                  </Link>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}