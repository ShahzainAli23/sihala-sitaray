import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../lib/supabase";

type LoginLocationState = {
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { session } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const locationState = location.state as LoginLocationState | null;

  const destination =
    locationState?.from &&
    locationState.from.startsWith("/")
      ? locationState.from
      : "/dashboard";

  useEffect(() => {
    if (session) {
      navigate(destination, { replace: true });
    }
  }, [destination, navigate, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setMessage("Enter both your email and password.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setMessage(
        "We could not sign you in. Check your email and password, then try again.",
      );
      setSubmitting(false);
      return;
    }

    navigate(destination, { replace: true });
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow eyebrow--accent">Author access</p>

        <h1>Sign in</h1>

        <p className="auth-card__intro">
          Use the account details provided by Sihala Sitaray.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email address</span>

            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>

          <label className="form-field">
            <span>Password</span>

            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {message ? (
            <p className="form-feedback form-feedback--error">
              {message}
            </p>
          ) : null}

          <button
            className="pill-button auth-form__submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"} <span>→</span>
          </button>
        </form>

        <Link to="/" className="auth-card__back-link">
          ← Back to stories
        </Link>
      </div>
    </section>
  );
}