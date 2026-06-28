import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";

import {
  createAuthor,
  fetchAdminAuthors,
  type CreateAuthorInput,
} from "../lib/adminAuthors";

import type { HeaderVariant, Profile } from "../types/profile";

type AuthorFormState = CreateAuthorInput;

const initialForm: AuthorFormState = {
  email: "",
  temporaryPassword: "",

  displayName: "",
  username: "",
  navLabel: "",
  pageTitle: "",
  bio: "",
  cardBlurb: "",

  headerVariant: "text",
  navOrder: 999,
  isFeatured: false,
  isActive: true,
};

function getAuthorName(author: Profile): string {
  return (
    author.display_name.trim() ||
    author.page_title.trim() ||
    author.nav_label.trim() ||
    "Untitled author"
  );
}

function getHeaderStyleLabel(
  headerVariant: HeaderVariant,
): string {
  if (headerVariant === "single-image") {
    return "One image";
  }

  if (headerVariant === "two-images") {
    return "Two images";
  }

  return "Text only";
}

function getProfileUrl(author: Profile): string | null {
  if (!author.is_active || !author.username) {
    return null;
  }

  return `/stories/${author.username}`;
}

export function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Profile[]>([]);
  const [form, setForm] = useState<AuthorFormState>(initialForm);

  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [creating, setCreating] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAuthors = useCallback(async () => {
    setLoadingAuthors(true);

    try {
      const loadedAuthors = await fetchAdminAuthors();
      setAuthors(loadedAuthors);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load existing authors.",
      );
    } finally {
      setLoadingAuthors(false);
    }
  }, []);

  useEffect(() => {
    void loadAuthors();
  }, [loadAuthors]);

  function updateForm(
    patch: Partial<AuthorFormState>,
  ) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  async function handleCreateAuthor(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage(null);
    setError(null);

    const username = form.username.trim().toLowerCase();

    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Enter a temporary email address.");
      return;
    }

    if (form.temporaryPassword.length < 8) {
      setError(
        "Temporary password must contain at least 8 characters.",
      );
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(username)) {
      setError(
        "Username can use lowercase letters, numbers, and single hyphens only.",
      );
      return;
    }

    if (
      !form.displayName.trim() ||
      !form.navLabel.trim() ||
      !form.pageTitle.trim()
    ) {
      setError(
        "Display name, navigation label, and page title are required.",
      );
      return;
    }

    if (!Number.isInteger(form.navOrder) || form.navOrder < 0) {
      setError("Navigation order must be 0 or higher.");
      return;
    }

    setCreating(true);

    try {
      const createdAuthor = await createAuthor({
        ...form,
        username,
      });

      setMessage(
        `${createdAuthor.displayName} was created successfully. Their temporary login is ${createdAuthor.email}.`,
      );

      setForm(initialForm);

      await loadAuthors();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create author account.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="dashboard-page">
      <div className="page-container page-container--wide">
        <div className="dashboard-page__topbar">
          <div>
            <p className="eyebrow eyebrow--accent">
              Admin author management
            </p>

            <h1>Manage writers</h1>

            <p className="dashboard-page__email">
              Create a temporary account, configure the writer’s public
              page, and they will appear in the scrollable header once
              active.
            </p>
          </div>

          <div className="admin-page-links">
            <Link to="/admin" className="text-link">
              Review stories
            </Link>

            <Link to="/dashboard" className="text-link">
              ← Dashboard
            </Link>
          </div>
        </div>

        <div className="admin-authors-layout">
          <form
            className="admin-author-form"
            onSubmit={handleCreateAuthor}
          >
            <div>
              <p className="eyebrow">New author</p>

              <h2>Create a writer account</h2>

              <p>
                You can use a temporary identity such as
                <strong> writer@sihala.com</strong>. The writer can
                later sign in and change both their password and email.
              </p>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>Temporary email</span>

                <input
                  type="email"
                  autoComplete="off"
                  value={form.email}
                  onChange={(event) =>
                    updateForm({
                      email: event.target.value,
                    })
                  }
                  placeholder="newwriter@sihala.com"
                  required
                />
              </label>

              <label className="form-field">
                <span>Temporary password</span>

                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.temporaryPassword}
                  onChange={(event) =>
                    updateForm({
                      temporaryPassword: event.target.value,
                    })
                  }
                  placeholder="At least 8 characters"
                  required
                />
              </label>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>Display name</span>

                <input
                  value={form.displayName}
                  onChange={(event) =>
                    updateForm({
                      displayName: event.target.value,
                    })
                  }
                  placeholder="Ayesha"
                  required
                />
              </label>

              <label className="form-field">
                <span>Username / URL</span>

                <input
                  value={form.username}
                  onChange={(event) =>
                    updateForm({
                      username: event.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-"),
                    })
                  }
                  placeholder="ayesha"
                  required
                />

                <small>
                  Their public page will be /stories/
                  {form.username.trim() || "username"}
                </small>
              </label>
            </div>

            <label className="form-field">
              <span>Header navigation label</span>

              <input
                value={form.navLabel}
                onChange={(event) =>
                  updateForm({
                    navLabel: event.target.value,
                  })
                }
                placeholder="Ayesha's Stories"
                required
              />
            </label>

            <label className="form-field">
              <span>Author page title</span>

              <input
                value={form.pageTitle}
                onChange={(event) =>
                  updateForm({
                    pageTitle: event.target.value,
                  })
                }
                placeholder="Ayesha Ahmed"
                required
              />
            </label>

            <label className="form-field">
              <span>Short author introduction</span>

              <textarea
                rows={4}
                value={form.bio}
                onChange={(event) =>
                  updateForm({
                    bio: event.target.value,
                  })
                }
                placeholder="A short introduction readers see on the author page..."
              />
            </label>

            <label className="form-field">
              <span>Writer-card description</span>

              <textarea
                rows={3}
                value={form.cardBlurb}
                onChange={(event) =>
                  updateForm({
                    cardBlurb: event.target.value,
                  })
                }
                placeholder="A short line for the homepage author card..."
              />
            </label>

            <div className="form-grid">
              <label className="form-field">
                <span>Author page header style</span>

                <select
                  value={form.headerVariant}
                  onChange={(event) =>
                    updateForm({
                      headerVariant: event.target
                        .value as HeaderVariant,
                    })
                  }
                >
                  <option value="text">Text only</option>
                  <option value="single-image">
                    One header image
                  </option>
                  <option value="two-images">
                    Two-image header
                  </option>
                </select>

                <small>
                  Header-image uploads are the next feature. Until then,
                  image styles safely fall back to text.
                </small>
              </label>

              <label className="form-field">
                <span>Header navigation order</span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.navOrder}
                  onChange={(event) =>
                    updateForm({
                      navOrder: Number(event.target.value),
                    })
                  }
                />

                <small>
                  Lower numbers appear first in the header.
                </small>
              </label>
            </div>

            <div className="admin-author-checkboxes">
              <label className="media-checkbox">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    updateForm({
                      isFeatured: event.target.checked,
                    })
                  }
                />
                Feature writer on the homepage
              </label>

              <label className="media-checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateForm({
                      isActive: event.target.checked,
                    })
                  }
                />
                Make profile publicly visible now
              </label>
            </div>

            {error ? (
              <p className="form-feedback form-feedback--error">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="form-feedback">{message}</p>
            ) : null}

            <button
              type="submit"
              className="pill-button admin-create-author-button"
              disabled={creating}
            >
              {creating ? "Creating account..." : "Create author"}{" "}
              <span>→</span>
            </button>
          </form>

          <section className="admin-authors-list-section">
            <div>
              <p className="eyebrow">Current writers</p>

              <h2>Existing author profiles</h2>

              <p>
                These are the writers currently stored in Supabase and
                shown according to their public status and header order.
              </p>
            </div>

            {loadingAuthors ? (
              <div className="admin-authors-empty">
                Loading authors...
              </div>
            ) : null}

            {!loadingAuthors && authors.length === 0 ? (
              <div className="admin-authors-empty">
                No author profiles found yet.
              </div>
            ) : null}

            {!loadingAuthors && authors.length > 0 ? (
              <div className="admin-author-list">
                {authors.map((author) => {
                  const publicUrl = getProfileUrl(author);

                  return (
                    <article
                      key={author.id}
                      className="admin-author-list-card"
                    >
                      <div>
                        <p className="eyebrow">
                          #{author.nav_order} ·{" "}
                          {getHeaderStyleLabel(
                            author.header_variant,
                          )}
                        </p>

                        <h3>{getAuthorName(author)}</h3>

                        <p className="admin-author-list-card__meta">
                          @{author.username || "no-username"} ·{" "}
                          {author.is_active
                            ? "Public"
                            : "Hidden"}{" "}
                          ·{" "}
                          {author.is_featured
                            ? "Featured"
                            : "Not featured"}
                        </p>
                      </div>

                      {publicUrl ? (
                        <Link
                          to={publicUrl}
                          className="secondary-button"
                        >
                          View page <span>→</span>
                        </Link>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ): null}
          </section>
        </div>
      </div>
    </section>
  )
}