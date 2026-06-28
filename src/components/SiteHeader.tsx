import { NavLink } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { usePublicProfiles } from "../hooks/usePublicProfiles";
import type { Profile } from "../types/profile";

function getNavigationLabel(profile: Profile): string {
  return (
    profile.nav_label.trim() ||
    profile.page_title.trim() ||
    profile.display_name.trim() ||
    "Untitled Author"
  );
}

export function SiteHeader() {
  const { profiles, loading } = usePublicProfiles();
  const { session } = useAuth();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="site-brand">
          <span className="site-brand__title">
            Sihala <span>Sitaray</span>
          </span>

          <span className="site-brand__subtitle">Student Voices</span>
        </NavLink>

        <div className="site-header__nav-area">
          <nav className="site-nav" aria-label="Main navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `site-nav__link ${
                  isActive ? "site-nav__link--active" : ""
                }`
              }
            >
              Home
            </NavLink>

            {loading ? (
              <span className="site-nav__status">Loading writers...</span>
            ) : (
              profiles.map((profile) => {
                if (!profile.username) {
                  return null;
                }

                return (
                  <NavLink
                    key={profile.id}
                    to={`/stories/${profile.username}`}
                    className={({ isActive }) =>
                      `site-nav__link ${
                        isActive ? "site-nav__link--active" : ""
                      }`
                    }
                  >
                    {getNavigationLabel(profile)}
                  </NavLink>
                );
              })
            )}

            <NavLink
              to="/others"
              className={({ isActive }) =>
                `site-nav__link ${
                  isActive ? "site-nav__link--active" : ""
                }`
              }
            >
              Others
            </NavLink>

            <NavLink
              to={session ? "/dashboard" : "/login"}
              className={({ isActive }) =>
                `site-nav__link ${
                  isActive ? "site-nav__link--active" : ""
                }`
              }
            >
              {session ? "Dashboard" : "Sign in"}
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}