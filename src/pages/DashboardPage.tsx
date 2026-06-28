import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";

export function DashboardPage() {
  const navigate = useNavigate();

  const { user, profile, signOut } = useAuth();

  const displayName =
    profile?.display_name.trim() ||
    profile?.page_title.trim() ||
    "Author";

  const publicProfileUrl =
    profile?.is_active && profile.username
      ? `/stories/${profile.username}`
      : null;

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Could not sign out:", error);
    }
  }

  return (
    <section className="dashboard-page">
      <div className="page-container page-container--narrow">
        <div className="dashboard-page__topbar">
          <div>
            <p className="eyebrow eyebrow--accent">
              {profile?.role === "admin" ? "Admin area" : "Author area"}
            </p>

            <h1>Welcome, {displayName}</h1>

            <p className="dashboard-page__email">
              Signed in as {user?.email ?? "unknown email"}
            </p>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <p className="eyebrow">My stories</p>

            <h2>Write, edit, and track your work.</h2>

            <p>
              Create drafts, return to unfinished stories, and see whether a
              submission is waiting for review.
            </p>

            <Link
              to="/dashboard/stories"
              className="secondary-button"
            >
              Manage my stories <span>→</span>
            </Link>
          </article>

          <article className="dashboard-card">
            <p className="eyebrow">Start writing</p>

            <h2>Have a new idea?</h2>

            <p>
              Begin a new draft now. You can save it privately and return to
              it whenever you need.
            </p>

            <Link
              to="/dashboard/stories/new"
              className="pill-button"
            >
              New story <span>→</span>
            </Link>
          </article>

          <article className="dashboard-card">
            <p className="eyebrow">Account</p>

            <h2>Keep your account details current.</h2>

            <p>
              Change your temporary email, choose your own password, and edit
              your public author details.
            </p>

            <Link to="/account" className="secondary-button">
              Open account settings <span>→</span>
            </Link>
          </article>

          {publicProfileUrl ? (
            <article className="dashboard-card">
              <p className="eyebrow">Public page</p>

              <h2>Your author page is live.</h2>

              <p>
                See the page visitors currently see for your stories and
                profile.
              </p>

              <Link to={publicProfileUrl} className="secondary-button">
                View public page <span>→</span>
              </Link>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}