import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { StoryContent } from "../components/StoryContent";
import { usePublicProfile } from "../hooks/usePublicProfiles";
import {
  fetchPublishedPostBySlug,
  fetchPublishedPostMedia,
} from "../lib/publicContent";

import type { Post } from "../types/post";
import type { PostMediaWithUrl } from "../types/postMedia";

function formatStoryDate(post: Post): string {
  const date = post.published_at ?? post.created_at;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function PublicStoryPage() {
  const { username, slug } = useParams();

  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = usePublicProfile(username);

  const [post, setPost] = useState<Post | null>(null);
  const [media, setMedia] = useState<PostMediaWithUrl[]>([]);
  const [loadingStory, setLoadingStory] = useState(true);
  const [storyError, setStoryError] = useState<string | null>(null);

  useEffect(() => {
    let ignoreResult = false;

    async function loadStory() {
      if (!profile || !slug) {
        setPost(null);
        setMedia([]);
        setLoadingStory(false);
        return;
      }

      setLoadingStory(true);
      setStoryError(null);

      try {
        const publishedPost = await fetchPublishedPostBySlug(
          profile.id,
          slug,
        );

        if (!publishedPost) {
          if (!ignoreResult) {
            setPost(null);
            setMedia([]);
          }

          return;
        }

        const postMedia = await fetchPublishedPostMedia(
          publishedPost.id,
        );

        if (!ignoreResult) {
          setPost(publishedPost);
          setMedia(postMedia);
        }
      } catch (error) {
        if (!ignoreResult) {
          setPost(null);
          setMedia([]);
          setStoryError(
            error instanceof Error
              ? error.message
              : "Unable to load this story.",
          );
        }
      } finally {
        if (!ignoreResult) {
          setLoadingStory(false);
        }
      }
    }

    void loadStory();

    return () => {
      ignoreResult = true;
    };
  }, [profile, slug]);

  if (profileLoading) {
    return (
      <section className="public-story-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">Story</p>
          <h1 className="public-story-page__title">Loading story...</h1>
        </div>
      </section>
    );
  }

  if (profileError || !profile || !profile.username) {
    return (
      <section className="public-story-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">Story</p>

          <h1 className="public-story-page__title">
            Story not found
          </h1>

          <p className="public-story-page__intro">
            This author or story is not publicly available.
          </p>

          <Link to="/" className="pill-button">
            Go home <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  if (loadingStory) {
    return (
      <section className="public-story-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">
            {profile.display_name || "Author"}
          </p>

          <h1 className="public-story-page__title">Loading story...</h1>
        </div>
      </section>
    );
  }

  if (storyError || !post) {
    return (
      <section className="public-story-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">
            {profile.display_name || "Author"}
          </p>

          <h1 className="public-story-page__title">
            Story not found
          </h1>

          <p className="public-story-page__intro">
            {storyError ??
              "This story may not have been published yet."}
          </p>

          <Link
            to={`/stories/${profile.username}`}
            className="pill-button"
          >
            Back to stories <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  const authorName =
    profile.display_name.trim() ||
    profile.page_title.trim() ||
    "Author";

  return (
    <article className="public-story-page">
      <div className="page-container page-container--narrow">
        <Link
          to={`/stories/${profile.username}`}
          className="text-link public-story-page__back"
        >
          ← Back to {authorName}
        </Link>

        <header className="public-story-page__header">
          <p className="eyebrow eyebrow--accent">{authorName}</p>

          <h1 className="public-story-page__title">
            {post.title || "Untitled story"}
          </h1>

          <p className="public-story-page__date">
            {formatStoryDate(post)}
          </p>

          {post.excerpt.trim() ? (
            <p className="public-story-page__intro">
              {post.excerpt}
            </p>
          ) : null}
        </header>

        <StoryContent body={post.body} media={media} />
      </div>
    </article>
  );
}