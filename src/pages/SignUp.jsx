import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// Using an upload icon for the logo picker
import { FiUpload } from "react-icons/fi";

function Signup() {
  const navigate = useNavigate();

  // All basic text fields stored together
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

  // Logo file + preview image
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Loading state for "creating account..."
  const [loading, setLoading] = useState(false);

  // Holds error messages for each field
  const [errors, setErrors] = useState({});

  /**
   * Handle text input changes
   * This updates formData dynamically based on input "name"
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle business logo upload
   * Instead of a plain file input, we use an icon button
   * When user picks a file → save it + create preview
   */
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file)); // Shows preview image
  };

  /**
   * Validate all fields before submitting
   * Each missing / incorrect field adds an error message
   */
  const validate = () => {
    let temp = {};

    // Basic user fields
    if (!formData.name) temp.name = "Full name is required";

    if (!formData.email) temp.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      temp.email = "Enter a valid email";

    if (!formData.password) temp.password = "Password is required";
    if (formData.password.length < 6)
      temp.password = "Minimum 6 characters required";

    // Business fields
    if (!formData.businessName) temp.businessName = "Business name is required";

    if (!formData.businessEmail) temp.businessEmail = "Business email required";
    if (!/\S+@\S+\.\S+/.test(formData.businessEmail))
      temp.businessEmail = "Enter a valid email";

    if (!formData.businessPhone)
      temp.businessPhone = "Business phone is required";

    if (!formData.businessAddress)
      temp.businessAddress = "Business address is required";

    setErrors(temp);
    return Object.keys(temp).length === 0; // If 0 errors → valid
  };

  /**
   * Submit form
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Stop if validation fails
    if (!validate()) return;

    setLoading(true);

    // Fake delay to show loading spinner
    setTimeout(() => {
      toast.success("Account created successfully!");
      navigate("/dashboard"); // Go to dashboard
    }, 1500);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FULL NAME */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              className={`border rounded-lg p-2 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              className={`border rounded-lg p-2 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Choose password"
              value={formData.password}
              onChange={handleChange}
              className={`border rounded-lg p-2 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* BUSINESS NAME */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Business Name</label>
            <input
              name="businessName"
              type="text"
              placeholder="Your business name"
              value={formData.businessName}
              onChange={handleChange}
              className={`border rounded-lg p-2 ${
                errors.businessName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.businessName && (
              <p className="text-red-500 text-sm">{errors.businessName}</p>
            )}
          </div>

          {/* BUSINESS EMAIL */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Business Email</label>
            <input
              name="businessEmail"
              type="email"
              placeholder="Business email"
              value={formData.businessEmail}
              onChange={handleChange}
              className={`border rounded-lg p-2 ${
                errors.businessEmail ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.businessEmail && (
              <p className="text-red-500 text-sm">{errors.businessEmail}</p>
            )}
          </div>

          {/* BUSINESS PHONE */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Business Phone</label>
            <input
              name="businessPhone"
              type="text"
              placeholder="Phone number"
              value={formData.businessPhone}
              onChange={handleChange}
              className={`border rounded-lg p-2 ${
                errors.businessPhone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.businessPhone && (
              <p className="text-red-500 text-sm">{errors.businessPhone}</p>
            )}
          </div>

          {/* BUSINESS ADDRESS */}
          <div className="flex flex-col md:col-span-2">
            <label className="font-medium mb-1">Business Address</label>
            <input
              name="businessAddress"
              type="text"
              placeholder="Your business address"
              value={formData.businessAddress}
              onChange={handleChange}
              className={`border rounded-lg p-2 ${
                errors.businessAddress ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.businessAddress && (
              <p className="text-red-500 text-sm">{errors.businessAddress}</p>
            )}
          </div>

          {/* BUSINESS LOGO UPLOAD WITH ICON */}
          <div className="flex flex-col md:col-span-2">
            <label className="font-medium mb-1">Business Logo</label>

            {/* Hidden input — triggered when user clicks icon */}
            <input
              id="logoInput"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {/* Logo picker box */}
            <div
              onClick={() => document.getElementById("logoInput").click()}
              className="w-24 h-24 border border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition"
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <>
                  <FiUpload size={28} />
                  <span className="text-xs mt-1">Upload</span>
                </>
              )}
            </div>
          </div>

          {/* BUSINESS DESCRIPTION */}
          <div className="flex flex-col md:col-span-2">
            <label className="font-medium mb-1">
              What type of quotes do you generate?
            </label>
            <textarea
              name="tips"
              placeholder="Describe your business needs"
              value={formData.tips}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 h-24"
            ></textarea>
          </div>
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
              <span className="ml-2">Creating Account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </button>

        {/* BACK TO LOGIN BUTTON */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full text-center text-black font-medium mt-3 hover:underline"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}

export default Signup;
