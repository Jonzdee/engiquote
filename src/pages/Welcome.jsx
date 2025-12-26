import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Welcome.jsx — Animated (no-rotation) logo + name with smooth timed redirect
 *
 * - Shows centered logo + app name.
 * - Redirects to /login after DEFAULT_SECONDS (no visible countdown).
 * - Smooth entrance and exit (fade + gentle scale) unless user prefers reduced motion.
 * - Logo uses a subtle pulse (no rotation) when allowed.
 * - All timers are cleaned up on unmount.
 */

export default function Welcome() {
  const navigate = useNavigate();
  const DEFAULT_SECONDS = 6;
  const ANIM_DURATION = 600; // ms for exit animation before navigation

  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);

  const enterTimeoutRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const navAfterExitRef = useRef(null);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      // No entrance/exit animations — just redirect after the delay
      const t = setTimeout(() => {
        navigate("/login");
      }, DEFAULT_SECONDS * 1000);
      return () => clearTimeout(t);
    }

    // Trigger entrance on next tick for CSS transition
    enterTimeoutRef.current = setTimeout(() => setMounted(true), 10);

    // Schedule exit (sets exit state, then navigates after ANIM_DURATION)
    redirectTimerRef.current = setTimeout(() => {
      setExiting(true);
      navAfterExitRef.current = setTimeout(() => {
        navigate("/login");
      }, ANIM_DURATION);
    }, DEFAULT_SECONDS * 1000);

    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      if (navAfterExitRef.current) clearTimeout(navAfterExitRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, prefersReducedMotion]);

  // cleanup on unmount (defensive)
  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      if (navAfterExitRef.current) clearTimeout(navAfterExitRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div
        className={`welcome-wrap ${
          mounted && !prefersReducedMotion ? "enter" : ""
        } ${exiting ? "exit" : ""}`}
        aria-hidden="false"
        style={{ textAlign: "center" }}
      >
        <div
          className="logo-area"
          aria-hidden="true"
          style={{ margin: "0 auto 12px", width: 112, height: 112 }}
        >
          <svg
            width="112"
            height="112"
            viewBox="0 0 112 112"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="EngiQuote logo"
            className={!prefersReducedMotion ? "logo-pulse" : ""}
          >
            <defs>
              <linearGradient id="gA" x1="0" x2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            <circle cx="56" cy="56" r="52" fill="#ffffff" opacity="0.04" />

            {/* Decorative shape (no rotation) */}
            <path
              d="M0-26 L6-34 L14-32 L18-24 L26-20 L26-10 L32-6 L30 2 L24 6 L24 18 L14 22 L8 30 L-8 30 L-14 22 L-24 18 L-24 6 L-30 2 L-32-6 L-26-10 L-26-20 L-18-24 L-14-32 L-6-34 Z"
              fill="url(#gA)"
              transform="translate(56,56) scale(1.35)"
              opacity="0.98"
            />

            <text
              x="56"
              y="64"
              textAnchor="middle"
              fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto"
              fontWeight="700"
              fontSize="20"
              fill="#0b1220"
            >
              EQ
            </text>
          </svg>
        </div>

        <h1
          className="app-name"
          style={{
            fontFamily:
              "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            fontSize: 22,
            fontWeight: 800,
            color: "white",
            margin: 0,
          }}
        >
          EngiQuote
        </h1>

       
      </div>

      {/* Animation CSS (no rotation) */}
      {!prefersReducedMotion && (
        <style>{`
          .welcome-wrap {
            opacity: 0;
            transform: scale(0.98);
            transition: opacity ${ANIM_DURATION}ms ease, transform ${ANIM_DURATION}ms ease;
          }
          .welcome-wrap.enter {
            opacity: 1;
            transform: scale(1);
          }
          .welcome-wrap.exit {
            opacity: 0;
            transform: scale(0.98);
          }

          /* gentle pulse on the logo (no rotation) */
          @keyframes logo-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.04); }
            100% { transform: scale(1); }
          }
          .logo-pulse {
            transform-box: fill-box;
            transform-origin: 56px 56px;
            animation: logo-pulse 2000ms ease-in-out infinite;
          }
        `}</style>
      )}
    </div>
  );
}
