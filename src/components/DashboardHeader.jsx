"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

/**
 * DashboardHeader.jsx
 * - Uses toast for sign-out feedback
 * - Accessible search with debounce and mobile behavior
 */

export default function DashboardHeader({
  user = { name: "Johnson", avatar: "" },
  onSignOut,
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileBtnRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const debouncedSearch = useRef();
  const handleSearchChange = useCallback(
    (value) => {
      setQuery(value);
      if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
      debouncedSearch.current = setTimeout(() => {
        if (value && value.trim()) {
          navigate(`/search?q=${encodeURIComponent(value.trim())}`);
        }
      }, 500);
    },
    [navigate]
  );

  useEffect(() => {
    const onDocClick = (e) => {
      if (!profileBtnRef.current) return;
      if (!profileBtnRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setShowMobileSearch(false);
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [showMobileSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => setUnreadCount(3), 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("role");
    toast.success("Signed out");
    if (typeof onSignOut === "function") onSignOut();
    navigate("/login");
  };

  const displayName = user?.name || "User";
  const shortName =
    displayName.length > 16 ? `${displayName.slice(0, 15)}…` : displayName;

  return (
    <header className="w-full sticky top-0 z-40 bg-white dark:bg-slate-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Open search"
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setShowMobileSearch((s) => !s)}
            >
              <Search size={18} className="text-gray-600 dark:text-slate-300" />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
              Engineer Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 -mt-1">
              Create quotations • Manage clients
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-lg w-64">
            <Search size={18} className="text-gray-500 dark:text-slate-300" />
            <label htmlFor="header-search" className="sr-only">
              Search clients and quotations
            </label>
            <input
              id="header-search"
              type="text"
              placeholder="Search clients, quotations..."
              className="bg-transparent text-sm ml-2 outline-none w-full text-gray-700 dark:text-slate-200"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Search clients and quotations"
            />
          </div>

          {showMobileSearch && (
            <div className="absolute left-4 right-4 top-16 md:hidden">
              <div className="flex items-center bg-white dark:bg-slate-800 border rounded-lg shadow-sm px-3 py-2">
                <Search
                  size={18}
                  className="text-gray-500 dark:text-slate-300"
                />
                <input
                  ref={mobileSearchRef}
                  type="text"
                  placeholder="Search clients, quotations..."
                  className="bg-transparent text-sm ml-2 outline-none w-full text-gray-700 dark:text-slate-200"
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  aria-label="Mobile search"
                />
                <button
                  type="button"
                  onClick={() => setShowMobileSearch(false)}
                  className="ml-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label="Close search"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            aria-label={`Notifications (${unreadCount} unread)`}
            title="Notifications"
            className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={18} className="text-gray-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-rose-600 text-white"
                aria-hidden="true"
              >
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative" ref={profileBtnRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((s) => !s)}
              aria-haspopup="true"
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${displayName} avatar`}
                  className="w-9 h-9 rounded-full border"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm text-slate-600 dark:text-slate-300 border">
                  {displayName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}

              <span className="hidden sm:flex text-sm font-medium text-gray-700 dark:text-slate-200">
                {shortName}
              </span>
              <ChevronDown
                size={18}
                className="text-gray-600 dark:text-slate-300 hidden sm:flex"
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                aria-label="Profile"
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border rounded-md shadow-lg py-1 z-50"
              >
                <button
                  role="menuitem"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => {
                    navigate("/profile");
                    setProfileOpen(false);
                  }}
                >
                  Profile
                </button>
               
                <div className="border-t my-1" />
                <button
                  role="menuitem"
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => handleSignOut()}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
