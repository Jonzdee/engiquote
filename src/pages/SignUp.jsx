import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiUpload } from "react-icons/fi";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const validateStep = () => {
    let temp = {};

    if (step === 1) {
      if (!formData.name) temp.name = "Full name is required";
      if (!formData.email) temp.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        temp.email = "Enter a valid email";
      if (!formData.password) temp.password = "Password is required";
      else if (formData.password.length < 6)
        temp.password = "Minimum 6 characters required";
    }

    if (step === 2) {
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

    if (step === 3) {
      if (!logo) temp.logo = "Business logo is required";
      if (!formData.tips)
        temp.tips = "Please describe the type of quotes you generate";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);

    setTimeout(() => {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black p-4">
      <form className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 space-y-6">
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
              <label className="font-medium">Business Logo</label>
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
              type="button"
              onClick={handleSubmit}
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
