import React, { useState } from "react";
import { toast } from "react-toastify";

function Profile() {
  const role = localStorage.getItem("role");
  const isGuest = role === "guest";

  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "johndoe@email.com",
    company: "EngiQuote Ltd",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatar, setAvatar] = useState(null);

  /* HANDLE PROFILE UPDATE */
  const handleProfileUpdate = (e) => {
    e.preventDefault();

    if (isGuest) {
      toast.warning("Create an account to update profile settings");
      return;
    }

    toast.success("Profile updated successfully");
  };

  /* HANDLE PASSWORD UPDATE */
  const handlePasswordUpdate = (e) => {
    e.preventDefault();

    if (isGuest) {
      toast.warning("Create an account to change password");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    toast.success("Password updated successfully");
  };

  /* HANDLE AVATAR UPLOAD */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your personal and account information
        </p>
      </div>

      {/* GUEST WARNING */}
      {isGuest && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg">
          Create an account to save profile changes and secure your data.
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl shadow-sm border p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AVATAR */}
        <div className="flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full overflow-hidden border mb-3">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                No Photo
              </div>
            )}
          </div>

          <label className="cursor-pointer text-sm font-medium text-black">
            Change Avatar
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        {/* PROFILE FORM */}
        <form
          onSubmit={handleProfileUpdate}
          className="md:col-span-2 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) =>
                setProfile({ ...profile, company: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* PASSWORD SECTION */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <form
          onSubmit={handlePasswordUpdate}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="password"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, currentPassword: e.target.value })
            }
            className="border rounded-lg p-2"
          />

          <input
            type="password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
            className="border rounded-lg p-2"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, confirmPassword: e.target.value })
            }
            className="border rounded-lg p-2"
          />

          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition md:col-span-3 w-fit"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
