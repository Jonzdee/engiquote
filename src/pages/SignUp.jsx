import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiUpload } from "react-icons/fi";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase";

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    tips: "",
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // cleanup preview URL
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, logo: "Please upload an image file." }));
      return;
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setErrors((p) => ({ ...p, logo: "Image is too large (max 5MB)." }));
      return;
    }

    setErrors((p) => ({ ...p, logo: undefined }));
    setLogo(file);

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(file));
  };

  const validateStep = (s) => {
    let temp = {};

    if (s === 1) {
      if (!formData.name) temp.name = "Full name is required";
      if (!formData.email) temp.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        temp.email = "Enter a valid email";
      if (!formData.password) temp.password = "Password is required";
      else if (formData.password.length < 6)
        temp.password = "Minimum 6 characters required";
    }

    if (s === 2) {
      if (!formData.businessName)
        temp.businessName = "Business name is required";
      if (!formData.businessEmail)
        temp.businessEmail = "Business email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.businessEmail))
        temp.businessEmail = "Enter a valid email";
      if (!formData.businessPhone)
        temp.businessPhone = "Business phone is required";
      if (!formData.businessAddress)
        temp.businessAddress = "Business address is required";
    }

    if (s === 3) {
      // logo optional in soft enforcement flow
      if (!formData.tips)
        temp.tips = "Please describe the type of quotes you generate";
    }

    setErrors((p) => ({ ...p, ...temp }));
    return Object.keys(temp).length === 0;
  };

  const validateAll = () => {
    const temp = {};

    if (!formData.name) temp.name = "Full name is required";
    if (!formData.email) temp.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      temp.email = "Enter a valid email";
    if (!formData.password) temp.password = "Password is required";
    else if (formData.password.length < 6)
      temp.password = "Minimum 6 characters required";

    if (!formData.businessName) temp.businessName = "Business name is required";
    if (!formData.businessEmail)
      temp.businessEmail = "Business email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.businessEmail))
      temp.businessEmail = "Enter a valid email";
    if (!formData.businessPhone)
      temp.businessPhone = "Business phone is required";
    if (!formData.businessAddress)
      temp.businessAddress = "Business address is required";

    if (!formData.tips)
      temp.tips = "Please describe the type of quotes you generate";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    setLoading(true);

    try {
      // 1) Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2) Update user profile (displayName)
      try {
        await updateProfile(user, { displayName: formData.name });
      } catch (err) {
        console.warn("updateProfile failed:", err);
      }

      // 3) Save user + business data to Firestore (no logo upload)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        businessAddress: formData.businessAddress,
        tips: formData.tips,
        logoMeta: logo
          ? { name: logo.name, size: logo.size, type: logo.type }
          : null,
        createdAt: serverTimestamp(),
      });

      // 4) Send verification email — soft enforcement: DO NOT sign out the user
      try {
        await sendEmailVerification(user);
        toast.info(
          "Verification email sent — check your inbox and spam. You can continue using the app."
        );
      } catch (sendErr) {
        console.warn("sendEmailVerification failed:", sendErr);
        toast.info(
          "Account created. Please verify your email (we couldn't send the verification automatically)."
        );
      }

      // 5) Navigate to dashboard (user remains signed-in)
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already exists");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak");
      } else {
        toast.error(error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 space-y-6"
      >
        <h1 className="text-3xl font-bold text-center">Create Account</h1>

        <div className="flex justify-center mb-4 gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              step === 1 ? "bg-black" : "bg-gray-400"
            }`}
          />
          <div
            className={`w-3 h-3 rounded-full ${
              step === 2 ? "bg-black" : "bg-gray-400"
            }`}
          />
          <div
            className={`w-3 h-3 rounded-full ${
              step === 3 ? "bg-black" : "bg-gray-400"
            }`}
          />
        </div>

        {step === 1 && (
          <div className="space-y-2">
            <div>
              <label className="font-medium">Full Name</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="font-medium">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <div>
              <label className="font-medium">Business Name</label>
              <input
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 ${
                  errors.businessName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm">{errors.businessName}</p>
              )}
            </div>

            <div>
              <label className="font-medium">Business Email</label>
              <input
                name="businessEmail"
                type="email"
                value={formData.businessEmail}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 ${
                  errors.businessEmail ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.businessEmail && (
                <p className="text-red-500 text-sm">{errors.businessEmail}</p>
              )}
            </div>

            <div>
              <label className="font-medium">Business Phone</label>
              <input
                name="businessPhone"
                type="text"
                value={formData.businessPhone}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 ${
                  errors.businessPhone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.businessPhone && (
                <p className="text-red-500 text-sm">{errors.businessPhone}</p>
              )}
            </div>

            <div>
              <label className="font-medium">Business Address</label>
              <input
                name="businessAddress"
                type="text"
                value={formData.businessAddress}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 ${
                  errors.businessAddress ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.businessAddress && (
                <p className="text-red-500 text-sm">{errors.businessAddress}</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <div>
              <label className="font-medium">Business Logo (optional)</label>
              <input
                id="logoInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <div
                onClick={() => document.getElementById("logoInput").click()}
                className="w-24 h-24 border border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <>
                    <FiUpload size={26} />
                    <p className="text-xs mt-1">Upload</p>
                  </>
                )}
              </div>
              {errors.logo && (
                <p className="text-red-500 text-sm">{errors.logo}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Note: logo is stored locally for now (no upload).
              </p>
            </div>

            <div>
              <label className="font-medium">
                What type of quotes do you generate?
              </label>
              <textarea
                name="tips"
                value={formData.tips}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 h-24 ${
                  errors.tips ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.tips && (
                <p className="text-red-500 text-sm">{errors.tips}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Back
            </button>
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-4 py-2 bg-black text-white rounded-lg"
            >
              Next
            </button>
          )}

          {step === 3 && (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto px-4 py-2 bg-black text-white rounded-lg disabled:bg-gray-600"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full text-center  text-black font-medium hover:underline"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}

export default Signup;
