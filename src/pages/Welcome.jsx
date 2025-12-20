import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Welcome.jsx
 *
 * - Shows an animated SVG logo (respects prefers-reduced-motion).
 * - Displays a short onboarding modal the first time a user visits (persisted in localStorage).
 * - Adds a "Do not auto-redirect again" toggle (persisted in localStorage).
 * - Countdown auto-redirects to /login unless the user chose to disable auto-redirect.
 * - Provides Skip to Login and Continue as Guest actions.
 *
 * LocalStorage keys used:
 * - welcome_seen: "true" after onboarding is dismissed/completed
 * - welcome_no_redirect: "true" if user toggles "Do not auto-redirect again"
 */

export default function Welcome() {
  const navigate = useNavigate();
  const DEFAULT_SECONDS = 6;

  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS);
  const [running, setRunning] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [skipRedirect, setSkipRedirect] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const skipBtnRef = useRef(null);
  const timerRef = useRef(null);

  // Read persisted flags once on mount
  useEffect(() => {
    const seen = localStorage.getItem("welcome_seen");
    const noRedirect = localStorage.getItem("welcome_no_redirect") === "true";
    setSkipRedirect(noRedirect);

    // Show onboarding if not seen before
    if (!seen) {
      setShowOnboarding(true);
    }

    // If user already has a role, go straight to dashboard
    const role = localStorage.getItem("role");
    if (role === "user" || role === "guest") {
      // short delay to avoid flash
      const t = setTimeout(() => navigate("/dashboard"), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Countdown timer (only if auto-redirect is allowed)
  useEffect(() => {
    if (skipRedirect) return; // do not auto-redirect if user opted out
    if (!running) return;

    if (secondsLeft <= 0) {
      navigate("/login");
      return;
    }

    timerRef.current = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [secondsLeft, running, navigate, skipRedirect]);

  const handleSkip = () => {
    setRunning(false);
    navigate("/login");
  };

  const handleGuest = () => {
    localStorage.setItem("role", "guest");
    localStorage.setItem("guest_since", new Date().toISOString());
    navigate("/dashboard");
  };

  const handleToggleNoRedirect = (checked) => {
    setSkipRedirect(checked);
    localStorage.setItem("welcome_no_redirect", checked ? "true" : "false");
  };

  // Onboarding modal controls
  const onboardingSteps = [
    {
      title: "Create your first quote",
      body: "Use the Create Quotation screen to add items, set VAT, and save a professional quote.",
    },
    {
      title: "Choose a template",
      body: "Pick a template that matches your brand under Browse Template. Templates change layout & colors.",
    },
    {
      title: "Save and send",
      body: "Save quotes to history, download PDFs, or print A4-ready quotes for clients.",
    },
  ];

  const handleCloseOnboarding = (complete = true) => {
    // mark onboarding as seen (persist) so we don't show again
    if (complete) {
      localStorage.setItem("welcome_seen", "true");
    } else {
      // still mark as seen when dismissed to avoid repetition
      localStorage.setItem("welcome_seen", "true");
    }
    setShowOnboarding(false);
  };

  const goToNextStep = () => {
    setOnboardingStep((s) => Math.min(s + 1, onboardingSteps.length - 1));
  };

  const goToPrevStep = () => {
    setOnboardingStep((s) => Math.max(s - 1, 0));
  };

  const pct = Math.max(
    0,
    Math.min(100, ((DEFAULT_SECONDS - secondsLeft) / DEFAULT_SECONDS) * 100)
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black px-4">
      <div className="max-w-xl w-full text-center">
        {/* Animated SVG logo */}
        <div className="flex items-center justify-center mb-6">
          <div
            className="w-28 h-28 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              width="112"
              height="112"
              viewBox="0 0 112 112"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="EngiQuote logo"
            >
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {/* Background circle */}
              <circle cx="56" cy="56" r="52" fill="#0b1220" opacity="0.06" />

              {/* Rotating gear (animated unless prefers-reduced-motion) */}
              <g
                transform="translate(56,56)"
                className={!prefersReducedMotion ? "logo-rotate" : ""}
                style={{
                  transformOrigin: "56px 56px",
                }}
              >
                <path
                  d="M0-26 L6-34 L14-32 L18-24 L26-20 L26-10 L32-6 L30 2 L24 6 L24 18 L14 22 L8 30 L-8 30 L-14 22 L-24 18 L-24 6 L-30 2 L-32-6 L-26-10 L-26-20 L-18-24 L-14-32 L-6-34 Z"
                  fill="url(#g1)"
                  transform="scale(1.4)"
                  opacity="0.95"
                />
              </g>

              {/* Center EQ letters */}
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                fontFamily="Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto"
                fontWeight="700"
                fontSize="18"
                fill="#0b1220"
              >
                EQ
              </text>
            </svg>
          </div>
        </div>

        <h1
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3"
          style={{
            fontFamily:
              "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          }}
        >
          EngiQuote
        </h1>

        <p className="text-sm text-gray-300 mb-6">
          Smart engineering quotations — create, send and manage quotes faster.
        </p>

        {/* Progress / countdown (hidden when user disabled auto-redirect) */}
        {!skipRedirect && (
          <div className="mb-4" aria-hidden={prefersReducedMotion}>
            <div className="w-full bg-white/8 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-indigo-500"
                style={{
                  width: `${pct}%`,
                  transition: prefersReducedMotion ? "none" : "width 1s linear",
                }}
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <div
            role="status"
            aria-live="polite"
            className="text-sm text-gray-300"
          >
            {!skipRedirect ? (
              <>
                Redirecting to <strong className="text-white">Login</strong> in{" "}
                <span aria-atomic="true" className="font-medium">
                  {secondsLeft}s
                </span>
                …
              </>
            ) : (
              <>Auto-redirect disabled — use the buttons below to continue.</>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            ref={skipBtnRef}
            onClick={handleSkip}
            className="px-2 py-2 rounded bg-white text-black font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Skip to Login
          </button>

          <button
            onClick={handleGuest}
            className="px-4 py-2 rounded border border-white/20 text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Continue as Guest
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-300">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={skipRedirect}
              onChange={(e) => handleToggleNoRedirect(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 bg-white"
            />
            <span>Do not auto-redirect again</span>
          </label>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          EngiQuote v1.0 • Built for fast quotations
        </div>
      </div>

      {/* Onboarding modal (first time only) */}
      {showOnboarding && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => handleCloseOnboarding(false)}
            aria-hidden="true"
          />

          <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  EQ
                </div>
                <div>
                  <h2 id="onboarding-title" className="text-lg font-semibold">
                    Welcome to EngiQuote
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Quick tour: create a quote, pick a template, and save to
                    history.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <ol className="list-decimal list-inside space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <li>
                    Create a quotation with items, quantities and unit prices.
                  </li>
                  <li>
                    Browse templates to match your brand and choose
                    layout/colors.
                  </li>
                  <li>
                    Export PDF, save to history, or print A4-ready quotes.
                  </li>
                </ol>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  You can always re-open this tour from the Help menu.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleCloseOnboarding(false);
                    }}
                    className="px-3 py-2 rounded border"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      handleCloseOnboarding(true);
                    }}
                    className="px-3 py-2 rounded bg-indigo-600 text-white"
                  >
                    Get started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative animation CSS (only add if not reduced motion) */}
      {!prefersReducedMotion && (
        <style>
          {`
            @keyframes logo-rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .logo-rotate {
              animation: logo-rotate 8s linear infinite;
            }
          `}
        </style>
      )}
    </div>
  );
}
