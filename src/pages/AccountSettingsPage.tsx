import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../lib/supabase";
import type { HeaderVariant } from "../types/profile";

type ProfileFormState = {
  displayName: string;
  navLabel: string;
  pageTitle: string;
  bio: string;
  cardBlurb: string;
  headerVariant: HeaderVariant;
};

function makeProfileForm(
  profile: ReturnType<typeof useAuth>["profile"],
): ProfileFormState {
  return {
    displayName: profile?.display_name ?? "",
    navLabel: profile?.nav_label ?? "",
    pageTitle: profile?.page_title ?? "",
    bio: profile?.bio ?? "",
    cardBlurb: profile?.card_blurb ?? "",
    headerVariant: profile?.header_variant ?? "text",
  };
}

export function AccountSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();

  const [email, setEmail] = useState(user?.email ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileForm, setProfileForm] = useState<ProfileFormState>(
    makeProfileForm(profile),
  );

  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(
    null,
  );
  const [profileMessage, setProfileMessage] = useState<string | null>(
    null,
  );

  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setEmail(user?.email ?? "");
  }, [user?.email]);

  useEffect(() => {
    setProfileForm(makeProfileForm(profile));
  }, [profile]);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setEmailMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailMessage("Enter an email address.");
      return;
    }

    if (normalizedEmail === user?.email?.toLowerCase()) {
      setEmailMessage("That is already your current email address.");
      return;
    }

    setSavingEmail(true);

    const { error } = await supabase.auth.updateUser({
      email: normalizedEmail,
    });

    setSavingEmail(false);

    if (error) {
      setEmailMessage(error.message);
      return;
    }

    setEmailMessage(
      "Email change requested. Check your new email inbox for the confirmation message.",
    );
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage(
        "Use a password with at least 8 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Your passwords do not match.");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSavingPassword(false);

    if (error) {
      setPasswordMessage(error.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password changed successfully.");
  }

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setProfileMessage(null);
    setSavingProfile(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profileForm.displayName.trim(),
        nav_label: profileForm.navLabel.trim(),
        page_title: profileForm.pageTitle.trim(),
        bio: profileForm.bio.trim(),
        card_blurb: profileForm.cardBlurb.trim(),
        header_variant: profileForm.headerVariant,
      })
      .eq("id", user.id);

    setSavingProfile(false);

    if (error) {
      setProfileMessage(error.message);
      return;
    }

    await refreshProfile();

    setProfileMessage("Public profile settings saved.");
  }

  return (
    <section className="account-page">
      <div className="page-container page-container--narrow">
        <div className="account-page__heading">
          <div>
            <p className="eyebrow eyebrow--accent">Account settings</p>

            <h1>Your profile and login</h1>
          </div>

          <Link to="/dashboard" className="text-link">
            ← Dashboard
          </Link>
        </div>

        <div className="account-settings-stack">
          <form
            className="settings-card"
            onSubmit={handleProfileSubmit}
          >
            <div>
              <p className="eyebrow">Public author profile</p>

              <h2>How readers see you</h2>

              <p>
                Your username and page order stay managed by the site admin.
              </p>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>Display name</span>

                <input
                  value={profileForm.displayName}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      displayName: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="form-field">
                <span>Header navigation label</span>

                <input
                  value={profileForm.navLabel}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      navLabel: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="form-field">
              <span>Author page title</span>

              <input
                value={profileForm.pageTitle}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    pageTitle: event.target.value,
                  }))
                }
              />
            </label>

            <label className="form-field">
              <span>Short author introduction</span>

              <textarea
                rows={5}
                value={profileForm.bio}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
              />
            </label>

            <label className="form-field">
              <span>Writer-card description</span>

              <textarea
                rows={3}
                value={profileForm.cardBlurb}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    cardBlurb: event.target.value,
                  }))
                }
              />
            </label>

            <label className="form-field">
              <span>Author page header style</span>

              <select
                value={profileForm.headerVariant}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    headerVariant: event.target
                      .value as HeaderVariant,
                  }))
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
            </label>

            {profileMessage ? (
              <p className="form-feedback">
                {profileMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="secondary-button"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save public profile"}{" "}
              <span>→</span>
            </button>
          </form>

          <form
            className="settings-card"
            onSubmit={handleEmailSubmit}
          >
            <div>
              <p className="eyebrow">Email address</p>

              <h2>Move the account to your own email</h2>

              <p>
                Change the temporary account email to an email address you
                personally control.
              </p>
            </div>

            <label className="form-field">
              <span>New email address</span>

              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            {emailMessage ? (
              <p className="form-feedback">{emailMessage}</p>
            ) : null}

            <button
              type="submit"
              className="secondary-button"
              disabled={savingEmail}
            >
              {savingEmail ? "Requesting..." : "Change email"}{" "}
              <span>→</span>
            </button>
          </form>

          <form
            className="settings-card"
            onSubmit={handlePasswordSubmit}
          >
            <div>
              <p className="eyebrow">Password</p>

              <h2>Choose your own password</h2>

              <p>
                Replace the temporary password given to you by the site
                administrator.
              </p>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>New password</span>

                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  required
                />
              </label>

              <label className="form-field">
                <span>Confirm new password</span>

                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                />
              </label>
            </div>

            {passwordMessage ? (
              <p className="form-feedback">
                {passwordMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="secondary-button"
              disabled={savingPassword}
            >
              {savingPassword
                ? "Changing password..."
                : "Change password"}{" "}
              <span>→</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}