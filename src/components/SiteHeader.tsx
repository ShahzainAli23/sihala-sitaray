import { NavLink } from "react-router-dom";

import { referenceAuthors } from "../data/referenceContent";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="site-brand">
          <span className="site-brand__title">
            Sihala <span>Sitaray</span>
          </span>

          <span className="site-brand__subtitle">Student Voices</span>
        </NavLink>

        <nav className="site-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `site-nav__link ${isActive ? "site-nav__link--active" : ""}`
            }
          >
            Home
          </NavLink>

          {referenceAuthors.map((author) => (
            <NavLink
              key={author.username}
              to={`/stories/${author.username}`}
              className={({ isActive }) =>
                `site-nav__link ${isActive ? "site-nav__link--active" : ""}`
              }
            >
              {author.navLabel}
            </NavLink>
          ))}

          <NavLink
            to="/others"
            className={({ isActive }) =>
              `site-nav__link ${isActive ? "site-nav__link--active" : ""}`
            }
          >
            Others
          </NavLink>
        </nav>
      </div>
    </header>
  );
}