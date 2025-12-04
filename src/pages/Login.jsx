import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

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

  const handleSubmit = (e) => {
    e.preventDefault();

    let valid = true;

    setEmailError("");
    setPasswordError("");

    // Email validation
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email");
      valid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }

    if (!valid) return;

    // Start loading
    setLoading(true);

    // Fake login delay to show spinner
    setTimeout(() => {
      toast.success("Login Successful!");
      navigate("/dashboard");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="h-screen flex justify-center items-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-xl rounded-lg p-6"
      >
        <h1 className="font-bold text-2xl text-center mb-6">
          Welcome to EngiQuote
        </h1>

        {/* EMAIL FIELD */}
        <div className="flex flex-col mb-4">
          <label className="font-medium mb-1">Email:</label>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`border rounded-lg p-2 focus:outline-none ${
              emailError
                ? "border-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-blue-500"
            }`}
          />
          {emailError && (
            <span className="text-red-500 text-sm mt-1">{emailError}</span>
          )}
        </div>

        {/* PASSWORD FIELD WITH SHOW/HIDE */}
        <div className="flex flex-col mb-4">
          <label className="font-medium mb-1">Password:</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`border w-full rounded-lg p-2 pr-10 focus:outline-none ${
                passwordError
                  ? "border-red-500"
                  : "border-gray-300 focus:ring-2 focus:ring-blue-500"
              }`}
            />

            {/* EYE ICON */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-2.5 right-3 text-gray-600"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {passwordError && (
            <span className="text-red-500 text-sm mt-1">{passwordError}</span>
          )}
        </div>

        {/* Links */}
        <div className="flex justify-between mt-2 text-sm">
          <Link to="/signup" className="text-black hover:underline">
            Create Account
          </Link>
          <Link to="/forgot-password" className="text-black hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg mt-5 hover:bg-gray-800 transition disabled:bg-gray-600"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </div>
  );
}

export default Login;
