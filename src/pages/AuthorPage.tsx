import { Link, useParams } from "react-router-dom";

import { referenceAuthors } from "../data/referenceContent";

export function AuthorPage() {
  const { username } = useParams();

  const author = referenceAuthors.find(
    (item) => item.username === username,
  );

  if (!author) {
    return (
      <section className="author-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">Author</p>

          <h1 className="author-page__title">Author not found</h1>

          <p className="author-page__tagline">
            This writer does not exist or has not been added yet.
          </p>

          <Link to="/" className="pill-button">
            Go home <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="author-page">
      <div className="page-container page-container--narrow">
        <div className="author-page__intro">
          <p className="eyebrow eyebrow--accent">Author</p>

          <h1 className="author-page__title">{author.name}</h1>

          <p className="author-page__tagline">{author.tagline}</p>
        </div>

        <div className="story-empty-state">
          <p className="eyebrow">Stories</p>

          <h2>No stories published yet.</h2>

          <p>
            Once this author publishes an approved story, it will appear here.
          </p>
        </div>
      </div>
    </section>
  );
}