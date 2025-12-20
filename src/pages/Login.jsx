import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

/**
 * Login.jsx
 * - Uses react-toastify for notifications
 * - Accessible labels and aria attributes
 * - Guest login with confirmation and toast
 */

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Loading spinner state
  const [loading, setLoading] = useState(false);

  // Show/hide password toggle
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      toast.error("Please enter your email");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address");
      toast.error("Please enter a valid email");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      toast.error("Please enter your password");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      valid = false;
    }

    if (!valid) {
      if (emailError) emailRef.current?.focus();
      else if (passwordError) passwordRef.current?.focus();
      return;
    }

    setLoading(true);

    // Simulate async login with toast.promise
    const loginPromise = new Promise((resolve) => setTimeout(resolve, 1200));
    toast
      .promise(loginPromise, {
        pending: "Signing in…",
        success: "Login successful 👌",
        error: "Login failed. Please try again.",
      })
      .then(() => {
        localStorage.setItem("role", "user");
        localStorage.setItem("user_email", email);
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  };

  // inside your component
  const handleGuestLogin = () => {
    // create a mutable id so handlers can dismiss the same toast
    let toastId = null;

    const ConfirmContent = () => (
      <div className="max-w-xs">
        <div className="text-sm mb-3">
          Continue as Guest? Some features may be restricted.
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // close the confirmation toast
              toast.dismiss(toastId);
              // perform guest login
              localStorage.setItem("role", "guest");
              localStorage.setItem("guest_since", new Date().toISOString());
              toast.success("Continuing as guest — limited access");
              navigate("/dashboard");
            }}
            className="px-3 py-1 rounded bg-black text-white text-sm"
          >
            Continue
          </button>

          <button
            onClick={() => {
              toast.dismiss(toastId);
              toast.info("Guest login cancelled");
            }}
            className="px-3 py-1 rounded border text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );

    // show the confirmation toast (keep it open until user acts)
    toastId = toast(<ConfirmContent />, {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
    });
  };
  return (
    <div className="h-screen flex justify-center items-center bg-black dark:bg-slate-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6"
        aria-labelledby="login-heading"
      >
        <h1
          id="login-heading"
          className="font-bold text-2xl text-center mb-4 text-gray-900 dark:text-slate-100"
        >
          Welcome to EngiQuote
        </h1>

        <p className="text-center text-sm text-gray-500 dark:text-slate-300 mb-6">
          Sign in to manage quotations, or continue as a guest.
        </p>

        {/* EMAIL */}
        <div className="flex flex-col mb-4">
          <label
            htmlFor="email"
            className="font-medium mb-1 text-sm text-gray-700 dark:text-slate-200"
          >
            Email
          </label>
          <input
            id="email"
            ref={emailRef}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={emailError ? "email-error" : undefined}
            aria-invalid={!!emailError}
            className={`border rounded-lg p-2 focus:outline-none focus:ring-2 ${
              emailError
                ? "border-rose-500 focus:ring-rose-200"
                : "border-gray-300 focus:ring-black"
            } bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100`}
          />
          {emailError && (
            <span
              id="email-error"
              role="alert"
              className="text-rose-600 text-sm mt-1"
            >
              {emailError}
            </span>
          )}
        </div>

        {/* PASSWORD */}
        <div className="flex flex-col mb-4">
          <label
            htmlFor="password"
            className="font-medium mb-1 text-sm text-gray-700 dark:text-slate-200"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={passwordError ? "password-error" : undefined}
              aria-invalid={!!passwordError}
              className={`border w-full rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 ${
                passwordError
                  ? "border-rose-500 focus:ring-rose-200"
                  : "border-gray-300 focus:ring-black"
              } bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-600 dark:text-slate-300"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {passwordError && (
            <span
              id="password-error"
              role="alert"
              className="text-rose-600 text-sm mt-1"
            >
              {passwordError}
            </span>
          )}
        </div>

        {/* LINKS */}
        <div className="flex justify-between items-center mt-2 text-sm">
          <Link
            to="/signup"
            className="hover:underline text-slate-700 dark:text-slate-200"
          >
            Create Account
          </Link>
          <Link
            to="/forgot-password"
            className="hover:underline text-slate-700 dark:text-slate-200"
          >
            Forgot Password?
          </Link>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg mt-5 hover:bg-gray-800 transition disabled:bg-gray-600 flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing in…</span>
            </div>
          ) : (
            "Login"
          )}
        </button>

        {/* CONTINUE AS GUEST */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full border border-black text-black py-2 rounded-lg mt-3 hover:bg-black hover:text-white transition"
          aria-label="Continue as guest"
        >
          Continue as Guest
        </button>
      </form>
    </div>
  );
}

export default Login;
