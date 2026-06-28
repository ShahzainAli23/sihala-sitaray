import { Link } from "react-router-dom";

import {
  homeIntroduction,
  homeSignature,
} from "../data/referenceContent";
import { usePublicProfiles } from "../hooks/usePublicProfiles";
import type { Profile } from "../types/profile";

function getAuthorName(profile: Profile): string {
  return (
    profile.display_name.trim() ||
    profile.page_title.trim() ||
    profile.nav_label.trim() ||
    "Author"
  );
}

function getCardBlurb(profile: Profile): string {
  return (
    profile.card_blurb.trim() ||
    "Stories, thoughts, and imagination shared one page at a time."
  );
}

export function HomePage() {
  const { profiles, loading, error } = usePublicProfiles();

  const featuredProfiles = profiles.filter(
    (profile) => profile.is_featured,
  );

  const displayedProfiles =
    featuredProfiles.length > 0 ? featuredProfiles : profiles;

  return (
    <>
      <section className="hero-section">
        <div className="page-container">
          <p className="eyebrow eyebrow--accent">Sihala · Sitaray</p>

          <h1 className="hero-section__title">
            Stories from the students who light up the Sihala community.
          </h1>

          <div className="hero-section__content">
            {homeIntroduction.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            <p className="hero-section__signature">
              {homeSignature}
            </p>
          </div>

          {!loading && displayedProfiles.length > 0 ? (
            <div className="hero-section__actions">
              {displayedProfiles.map((profile) => {
                if (!profile.username) {
                  return null;
                }

                return (
                  <Link
                    key={profile.id}
                    to={`/stories/${profile.username}`}
                    className="pill-button"
                  >
                    Read {getAuthorName(profile)}&apos;s stories{" "}
                    <span>→</span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="writers-section section-border-top">
        <div className="page-container">
          <p className="eyebrow">The Writers</p>

          {loading ? (
            <div className="writer-loading-state">
              Loading writers...
            </div>
          ) : null}

          {!loading && error ? (
            <div className="writer-empty-state">
              <p>Unable to load writers right now.</p>
              <span>{error}</span>
            </div>
          ) : null}

          {!loading && !error && displayedProfiles.length === 0 ? (
            <div className="writer-empty-state">
              <p>Writer profiles will appear here soon.</p>
              <span>
                Once an author is activated, their page will appear in the
                navigation and here on the homepage.
              </span>
            </div>
          ) : null}

          {!loading && !error && displayedProfiles.length > 0 ? (
            <div className="writer-grid">
              {displayedProfiles.map((profile) => {
                if (!profile.username) {
                  return null;
                }

                return (
                  <Link
                    key={profile.id}
                    to={`/stories/${profile.username}`}
                    className="writer-card"
                  >
                    <div className="writer-card__heading">
                      <h2>{getAuthorName(profile)}</h2>
                      <span aria-hidden="true">→</span>
                    </div>

                    <p>{getCardBlurb(profile)}</p>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="quote-section">
        <div className="page-container page-container--narrow">
          <p>
            “Every student is a star, and every star has a story worth
            telling.”
          </p>
        </div>
      </section>

      <section className="gallery-section section-border-top">
        <div className="page-container page-container--wide">
          <p className="eyebrow">The Gallery</p>

          <h2 className="gallery-section__title">
            Moments from our classroom.
          </h2>

          <div className="gallery-empty-state">
            <p>No photos or videos have been published yet.</p>
            <span>
              Uploaded media from approved stories will appear here.
            </span>
          </div>
        </div>
      </section>
    </>
  );
}