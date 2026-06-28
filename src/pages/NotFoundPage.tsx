import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="not-found-page">
      <div className="not-found-page__content">
        <p className="not-found-page__number">404</p>

        <h1>Page not found</h1>

        <p>The page you are looking for does not exist.</p>

        <Link to="/" className="pill-button">
          Go home <span>→</span>
        </Link>
      </div>
    </section>
  );
}