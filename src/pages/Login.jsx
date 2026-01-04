import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

/**
 * Login.jsx (soft enforcement)
 * - Allows sign-in even if email is unverified
 * - If unverified, sets a state so UI / dashboard can show a banner
 * - Provides a Resend verification action
 */

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validateInputs = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      toast.error("Please fix the errors and try again");
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = credential.user;

      // soft enforcement: allow sign-in but if unverified show a toast/nudge
      if (user && !user.emailVerified) {
        toast.info(
          "Email not verified — check your inbox (and spam). A banner will show in your dashboard."
        );
      } else {
        toast.success("Login successful 👌");
      }

      // persist minimal info and navigate
      localStorage.setItem("role", "user");
      localStorage.setItem("user_email", email);
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No account found for that email.");
          setEmailError("No account found for that email.");
          emailRef.current?.focus();
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password. Please try again.");
          setPasswordError("Incorrect password");
          passwordRef.current?.focus();
          break;
        case "auth/too-many-requests":
          toast.error("Too many failed attempts. Try again later.");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email address.");
          setEmailError("Enter a valid email address");
          emailRef.current?.focus();
          break;
        default:
          toast.error(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      toast.error("Enter your email to resend verification.");
      return;
    }

    setLoading(true);
    try {
      // If the currentUser is the same email, use it; otherwise sign in to get a user object
      if (auth.currentUser && auth.currentUser.email === email) {
        await sendEmailVerification(auth.currentUser);
      } else {
        // sign in to obtain user, but keep signed-in (soft enforcement)
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
      }
      toast.success(
        "Verification email resent. Check your inbox and spam folder."
      );
    } catch (err) {
      console.error("Resend verification failed:", err);
      if (err.code === "auth/wrong-password") {
        toast.error(
          "Wrong password — cannot resend verification. Try signing in first."
        );
      } else if (err.code === "auth/too-many-requests") {
        toast.error("Too many requests. Try again later.");
      } else {
        toast.error(err.message || "Could not resend verification.");
      }
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
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
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={passwordError ? "password-error" : undefined}
              aria-invalid={!!passwordError}
              disabled={loading}
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

        {/* Resend verification quick link */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={resendVerification}
            disabled={loading}
            className="text-sm underline"
          >
            Resend verification email
          </button>
        </div>

        {/* CONTINUE AS GUEST (kept from previous) */}
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("role", "guest");
            localStorage.setItem("guest_since", new Date().toISOString());
            toast.success("Continuing as guest — limited access");
            navigate("/dashboard");
          }}
          className="w-full border border-black text-black py-2 rounded-lg mt-3 hover:bg-black hover:text-white transition"
          aria-label="Continue as guest"
          disabled={loading}
        >
          Continue as Guest
        </button>
      </form>
    </div>
  );
}

export default Login;
