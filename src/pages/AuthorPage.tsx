import { Link, useParams } from "react-router-dom";

import { usePublicProfile } from "../hooks/usePublicProfiles";
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

export function AuthorPage() {
  const { username } = useParams();

  const { profile, loading, error } = usePublicProfile(username);

  if (loading) {
    return (
      <section className="author-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">Author</p>
          <h1 className="author-page__title">Loading stories...</h1>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="author-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">Author</p>

          <h1 className="author-page__title">
            Unable to load this author.
          </h1>

          <p className="author-page__tagline">{error}</p>

          <Link to="/" className="pill-button">
            Go home <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  if (!profile) {
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

        <div className="story-empty-state">
          <p className="eyebrow">Stories</p>

          <h2>No stories published yet.</h2>

          <p>
            Once this author publishes an approved story, it will appear
            here.
          </p>
        </div>
      </div>
    </section>
  );
}