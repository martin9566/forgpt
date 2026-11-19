
import { useCallback, useEffect, useState } from "react";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import HomePage from "./HomePage.jsx";
import ProfileSetup from "./ProfileSetup.jsx";
import { apiRequest } from "./api.js";
import "./App.css";

function PasswordField({
  autoComplete,
  showPassword,
  onTogglePassword,
  value,
  onChange,
}) {
  return (
    <label className="input-field has-icon password-field">
      <LockKeyhole size={18} aria-hidden="true" />

      <span className="sr-only">Password</span>

      <input
        name="password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter Password"
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        minLength={8}
        required
      />

      <button
        type="button"
        className="password-toggle"
        onClick={onTogglePassword}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </label>
  );
}

export default function App() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleProfileCompleted = useCallback(() => {
    setIsProfileComplete(true);
    setProfileToEdit(false);
  }, []);

  const handleProfileSaved = useCallback(() => {
    setIsProfileComplete(true);
    setProfileToEdit(false);
  }, []);

  const handleProfileEditCancelled = useCallback(() => {
    setProfileToEdit(false);
  }, []);

  const handleSignedOut = useCallback(() => {
    setIsAuthenticated(false);
    setIsProfileComplete(false);
    setProfileToEdit(false);
    setCurrentUser(null);
    setMessage("");
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const { response, data } = await apiRequest(
          "/api/auth/me",
          undefined,
          { allowUnauthorized: true },
        );
        if (response.status === 401) return;

        if (active) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (active) {
          setMessageType("error");
          setMessage(error.message || "Unable to restore your session.");
        }
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const update = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const switchMode = (signup) => {
    setIsSignUp(signup);
    setShowPassword(false);
    setForm({ name: "", email: "", password: "" });
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();

    if (form.password.length < 8) {
      setMessageType("error");
      setMessage("Use a password with at least 8 characters.");
      return;
    }

    if (isSignUp && !form.name.trim()) {
      setMessageType("error");
      setMessage("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isSignUp
        ? "/api/auth/signup"
        : "/api/auth/signin";
      const { data } = await apiRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isSignUp && { name: form.name.trim() }),
          email: form.email.trim(),
          password: form.password,
        }),
      });
      setMessageType("success");
      setMessage(
        isSignUp
          ? "Your account has been created. You can now sign in."
          : "You are signed in successfully.",
      );
      setForm({ name: "", email: "", password: "" });

      if (!isSignUp) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to reach the authentication service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && currentUser) {
    if (isProfileComplete && !profileToEdit) {
      return (
        <HomePage
          user={currentUser}
          onEditProfile={() => setProfileToEdit(true)}
          onSignedOut={handleSignedOut}
        />
      );
    }

    return (
      <ProfileSetup
        user={currentUser}
        startEditing={profileToEdit}
        onCompleted={handleProfileCompleted}
        onProfileSaved={handleProfileSaved}
        onCancelEdit={handleProfileEditCancelled}
        onSignedOut={handleSignedOut}
      />
    );
  }

  return (
    <main
      className={`auth-shell ${
        isSignUp ? "signup-mode" : "login-mode"
      }`}
    >
      <section className="auth-card">
        {/* SIGN UP FORM */}
        <div className="form-container sign-up-container">
          <form className="auth-form" onSubmit={submit} autoComplete="off">
            <h1>Create Account</h1>

            <p className="form-subtitle">
              Sign up with your email address
            </p>

            <label className="input-field">
              <span className="sr-only">Full name</span>

              <input
                name="name"
                type="text"
                placeholder="Enter Full Name"
                autoComplete="off"
                value={form.name}
                onChange={update}
                required
              />
            </label>

            <label className="input-field has-icon">
              <Mail size={18} aria-hidden="true" />

              <span className="sr-only">Email</span>

              <input
                name="email"
                type="email"
                placeholder="Enter E-mail"
                autoComplete="off"
                value={form.email}
                onChange={update}
                required
              />
            </label>

            <PasswordField
              autoComplete="off"
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((previous) => !previous)}
              value={form.password}
              onChange={update}
            />

            {message && (
              <p className={`status-message ${messageType}`} role={messageType === "error" ? "alert" : "status"}>
                {message}
              </p>
            )}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "CREATING ACCOUNT..." : "SIGN UP"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>

            <p className="mobile-switch">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => switchMode(false)}
              >
                Sign in
              </button>
            </p>
          </form>
        </div>

        {/* SIGN IN FORM */}
        <div className="form-container sign-in-container">
          <form className="auth-form" onSubmit={submit} autoComplete="off">
            <h1>Sign In</h1>

            <p className="form-subtitle">
              Sign in with email &amp; password
            </p>

            <label className="input-field has-icon">
              <Mail size={18} aria-hidden="true" />

              <span className="sr-only">Email</span>

              <input
                name="email"
                type="email"
                placeholder="Enter E-mail"
                autoComplete="off"
                value={form.email}
                onChange={update}
                required
              />
            </label>

            <PasswordField
              autoComplete="off"
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((previous) => !previous)}
              value={form.password}
              onChange={update}
            />

            <button
              type="button"
              className="forgot-password"
              onClick={() => {
                setMessageType("error");
                setMessage("Password reset is not connected yet.");
              }}
            >
              Forgot your password?
            </button>

            {message && (
              <p className={`status-message ${messageType}`} role={messageType === "error" ? "alert" : "status"}>
                {message}
              </p>
            )}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>

            <p className="mobile-switch">
              New here?{" "}
              <button
                type="button"
                onClick={() => switchMode(true)}
              >
                Create account
              </button>
            </p>
          </form>
        </div>

        {/* ANIMATED WELCOME OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Access Your Account</h1>

              <p>
                Sign in to review relevant government schemes and
                continue exploring benefits for which you may be eligible.
              </p>

              <button
                type="button"
                className="ghost-button"
                onClick={() => switchMode(false)}
              >
                SIGN IN
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Discover Government Schemes</h1>

              <p>
                Create an account to explore government schemes and
                identify benefits relevant to your eligibility.
              </p>

              <button
                type="button"
                className="ghost-button"
                onClick={() => switchMode(true)}
              >
                CREATE ACCOUNT
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
