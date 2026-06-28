import { Link } from "react-router-dom";

import {
  homeIntroduction,
  referenceAuthors,
} from "../data/referenceContent";

export function HomePage() {
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
              Minahil Tariq &amp; Anusha Sharif — Teach for Pakistan Alumni and
              Sihala Sitaray&apos;s number one fans
            </p>
          </div>

          <div className="hero-section__actions">
            {referenceAuthors.map((author) => (
              <Link
                key={author.username}
                to={`/stories/${author.username}`}
                className="pill-button"
              >
                Read {author.name}&apos;s stories <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="writers" className="writers-section section-border-top">
        <div className="page-container">
          <p className="eyebrow">The Writers</p>

          <div className="writer-grid">
            {referenceAuthors.map((author) => (
              <Link
                key={author.username}
                to={`/stories/${author.username}`}
                className="writer-card"
              >
                <div className="writer-card__heading">
                  <h2>{author.name}</h2>
                  <span aria-hidden="true">→</span>
                </div>

                <p>{author.blurb}</p>
              </Link>
            ))}
          </div>
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

      <section id="gallery" className="gallery-section section-border-top">
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