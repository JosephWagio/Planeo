import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeSlash,
  WarningCircle,
} from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { BrandMark } from "./BrandMark";

interface AuthPageProps {
  mode: "login" | "signup" | "reset";
  navigate: (path: string) => void;
}

export function AuthPage({ mode, navigate }: AuthPageProps) {
  const {
    configured,
    initialize,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
  } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const isSignup = mode === "signup";
  const isReset = mode === "reset";

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const result = isReset
      ? await updatePassword(password)
      : isSignup
        ? await signUp(name.trim(), email.trim(), password)
        : await signIn(email.trim(), password);

    setSubmitting(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    if (result.needsEmailConfirmation) {
      setMessage({
        type: "success",
        text: "Check your inbox to confirm your email, then return here to log in.",
      });
      return;
    }
    if (isReset) {
      setMessage({
        type: "success",
        text: "Your password has been updated. Opening your workspace…",
      });
    }
    navigate("/app");
  };

  const sendReset = async () => {
    if (!email.trim()) {
      setMessage({ type: "error", text: "Enter your email address first." });
      return;
    }
    setSubmitting(true);
    const result = await resetPassword(email.trim());
    setSubmitting(false);
    setMessage({
      type: result.error ? "error" : "success",
      text:
        result.error ??
        "Password reset instructions are on their way to your inbox.",
    });
  };

  return (
    <div className="auth-shell">
      <section className="auth-brand-panel">
        <button
          type="button"
          className="auth-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} weight="bold" />
          Back to Planeo
        </button>
        <div className="auth-brand-copy">
          <BrandMark />
          <h1>Make progress visible.</h1>
          <p>
            A colorful, focused workspace for planning the work and carrying it
            all the way through.
          </p>
          <div className="auth-benefits">
            <span><CheckCircle size={18} weight="fill" /> Cloud-synced boards</span>
            <span><CheckCircle size={18} weight="fill" /> Secure personal workspace</span>
            <span><CheckCircle size={18} weight="fill" /> Start with a ready-made project</span>
          </div>
        </div>
      </section>

      <main className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-heading">
            <p>
              {isReset
                ? "Secure your account"
                : isSignup
                  ? "Create your workspace"
                  : "Welcome back"}
            </p>
            <h2>
              {isReset
                ? "Choose a new password."
                : isSignup
                  ? "Start planning in minutes."
                  : "Log in to keep moving."}
            </h2>
            {!isReset && (
              <span>
                {isSignup ? "Already have an account? " : "New to Planeo? "}
                <button
                  type="button"
                  onClick={() => navigate(isSignup ? "/login" : "/signup")}
                >
                  {isSignup ? "Log in" : "Create an account"}
                </button>
              </span>
            )}
          </div>

          {!configured && (
            <div className="auth-config-notice">
              <WarningCircle size={19} weight="fill" />
              <span>
                <strong>Connect Supabase to enable sign-in.</strong>
                Add the two Vite environment variables described in the README.
              </span>
            </div>
          )}

          <form onSubmit={submit}>
            {isSignup && (
              <label>
                Full name
                <input
                  required
                  autoComplete="name"
                  aria-invalid={message?.type === "error"}
                  aria-describedby={message ? "auth-feedback" : undefined}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </label>
            )}
            {!isReset && (
              <label>
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  aria-invalid={message?.type === "error"}
                  aria-describedby={message ? "auth-feedback" : undefined}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                />
              </label>
            )}
            <label>
              <span className="auth-label-row">
                {isReset ? "New password" : "Password"}
                {!isSignup && !isReset && (
                  <button type="button" onClick={sendReset}>
                    Forgot password?
                  </button>
                )}
              </span>
              <span className="password-input">
                <input
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isSignup || isReset ? "new-password" : "current-password"
                  }
                  aria-invalid={message?.type === "error"}
                  aria-describedby={message ? "auth-feedback" : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isSignup || isReset
                      ? "At least 8 characters"
                      : "Your password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlash size={19} /> : <Eye size={19} />}
                </button>
              </span>
            </label>

            {message && (
              <div
                id="auth-feedback"
                className={`auth-message is-${message.type}`}
                role={message.type === "error" ? "alert" : "status"}
              >
                {message.type === "success" ? (
                  <CheckCircle size={18} weight="fill" />
                ) : (
                  <WarningCircle size={18} weight="fill" />
                )}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
            >
              {submitting
                ? "Please wait…"
                : isReset
                  ? "Update password"
                  : isSignup
                    ? "Create my workspace"
                    : "Log in"}
              {!submitting && <ArrowRight size={18} weight="bold" />}
            </button>
          </form>
          <p className="auth-legal">
            By continuing, you agree to Planeo’s Terms and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}
