"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentLanguage, t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useNotification } from "@/components/NotificationProvider";

export default function SettingsPage() {
  const router = useRouter();
  const notification = useNotification();
  const [lang, setLang] = useState("bn");
  const [adminInfo, setAdminInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Admin management
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminsList, setAdminsList] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const admin = localStorage.getItem("adminInfo");
    if (admin) {
      const adminData = JSON.parse(admin);
      setAdminInfo(adminData);
      setName(adminData.name);
      setEmail(adminData.email);
    }

    setLang(getCurrentLanguage());
    const handleLanguageChange = () => setLang(getCurrentLanguage());
    window.addEventListener("languageChanged", handleLanguageChange);

    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);
  }, [router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admins/${adminInfo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminInfo", JSON.stringify(data.admin));
        setAdminInfo(data.admin);
        notification.success(
          lang === "bn" ? "প্রোফাইল আপডেট হয়েছে" : "Profile updated"
        );
      } else {
        notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      notification.warning(
        lang === "bn" ? "পাসওয়ার্ড মিলছে না" : "Passwords do not match"
      );
      return;
    }

    if (newPassword.length < 6) {
      notification.warning(
        lang === "bn"
          ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
          : "Password must be at least 6 characters"
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admins/${adminInfo.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        notification.success(
          lang === "bn" ? "পাসওয়ার্ড পরিবর্তন হয়েছে" : "Password changed"
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error changing password:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      notification.warning(
        lang === "bn" ? "সব ফিল্ড পূরণ করুন" : "Please fill all fields"
      );
      return;
    }

    if (newAdminPassword.length < 6) {
      notification.warning(
        lang === "bn"
          ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
          : "Password must be at least 6 characters"
      );
      return;
    }

    setAdminLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
        }),
      });

      if (response.ok) {
        notification.success(
          lang === "bn"
            ? "নতুন অ্যাডমিন তৈরি হয়েছে"
            : "New admin created successfully"
        );
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
      } else {
        const data = await response.json();
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminsList(data.admins || []);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (
      !confirm(
        lang === "bn"
          ? "আপনি কি এই অ্যাডমিন মুছতে চান?"
          : "Are you sure you want to delete this admin?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admins/${adminId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        notification.success(
          lang === "bn"
            ? "অ্যাডমিন মুছে ফেলা হয়েছে"
            : "Admin deleted successfully"
        );
        fetchAdmins(); // Refresh the list
      } else {
        const data = await response.json();
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    }
  };

  // Fetch admins when Admins tab is active
  useEffect(() => {
    if (activeTab === "admins") {
      fetchAdmins();
    }
  }, [activeTab]);

  const handleLogout = () => {
    notification.info(
      lang === "bn" ? "আপনি কি লগআউট করতে চান?" : "Do you want to logout?"
    );
    // Give user time to see notification, then logout after 1 second if they don't cancel
    setTimeout(() => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("adminInfo");
      router.push("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/admin")}
                className="lg:hidden text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1
                  className={`text-2xl font-bold text-gray-900 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {t("settings", lang)}
                </h1>
                <p className="text-sm text-gray-600">
                  {lang === "bn" ? "অ্যাকাউন্ট সেটিংস" : "Account settings"}
                </p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex -mb-px flex-nowrap">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "profile"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${lang === "bn" ? "bengali-text" : ""}`}
              >
                {lang === "bn" ? "প্রোফাইল" : "Profile"}
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "password"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${lang === "bn" ? "bengali-text" : ""}`}
              >
                {lang === "bn" ? "পাসওয়ার্ড" : "Password"}
              </button>
              <button
                onClick={() => setActiveTab("admins")}
                className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "admins"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${lang === "bn" ? "bengali-text" : ""}`}
              >
                {lang === "bn" ? "অ্যাডমিন" : "Admins"}
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "about"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${lang === "bn" ? "bengali-text" : ""}`}
              >
                {lang === "bn" ? "সম্পর্কে" : "About"}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h2
                  className={`text-lg font-semibold text-gray-900 mb-4 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn" ? "প্রোফাইল তথ্য" : "Profile Information"}
                </h2>

                <form
                  onSubmit={handleProfileUpdate}
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 mb-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "নাম" : "Name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 mb-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "ইমেইল" : "Email"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 mb-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "ভূমিকা" : "Role"}
                    </label>
                    <input
                      type="text"
                      value={adminInfo?.role || "admin"}
                      disabled
                      className="input bg-gray-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="btn btn-primary w-full"
                  >
                    {profileLoading
                      ? lang === "bn"
                        ? "আপডেট হচ্ছে..."
                        : "Updating..."
                      : lang === "bn"
                      ? "প্রোফাইল আপডেট করুন"
                      : "Update Profile"}
                  </button>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div>
                <h2
                  className={`text-lg font-semibold text-gray-900 mb-4 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn" ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}
                </h2>

                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 mb-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn"
                        ? "বর্তমান পাসওয়ার্ড"
                        : "Current Password"}
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 mb-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {lang === "bn"
                        ? "কমপক্ষে ৬ অক্ষর"
                        : "Minimum 6 characters"}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 mb-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn"
                        ? "পাসওয়ার্ড নিশ্চিত করুন"
                        : "Confirm Password"}
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn btn-primary w-full"
                  >
                    {passwordLoading
                      ? lang === "bn"
                        ? "পরিবর্তন হচ্ছে..."
                        : "Changing..."
                      : lang === "bn"
                      ? "পাসওয়ার্ড পরিবর্তন করুন"
                      : "Change Password"}
                  </button>
                </form>
              </div>
            )}

            {/* Admins Tab */}
            {activeTab === "admins" && (
              <div>
                <h2
                  className={`text-lg font-semibold text-gray-900 mb-4 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn"
                    ? "নতুন অ্যাডমিন তৈরি করুন"
                    : "Create New Admin"}
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p
                        className={`text-sm text-blue-800 ${
                          lang === "bn" ? "bengali-text" : ""
                        }`}
                      >
                        {lang === "bn"
                          ? "নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করুন। নতুন অ্যাডমিন সমস্ত ফিচার অ্যাক্সেস করতে পারবে।"
                          : "Create a new admin account. The new admin will have access to all features."}
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleCreateAdmin}
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 mb-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "নাম" : "Name"}
                    </label>
                    <input
                      type="text"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={
                        lang === "bn" ? "অ্যাডমিনের নাম" : "Admin name"
                      }
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 mb-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "ইমেইল" : "Email"}
                    </label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={
                        lang === "bn" ? "ইমেইল ঠিকানা" : "Email address"
                      }
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-gray-700 mb-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "পাসওয়ার্ড" : "Password"}
                    </label>
                    <input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={
                        lang === "bn"
                          ? "কমপক্ষে ৬ অক্ষর"
                          : "At least 6 characters"
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className={`w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      lang === "bn" ? "bengali-text" : ""
                    }`}
                  >
                    {adminLoading
                      ? lang === "bn"
                        ? "তৈরি হচ্ছে..."
                        : "Creating..."
                      : lang === "bn"
                      ? "অ্যাডমিন তৈরি করুন"
                      : "Create Admin"}
                  </button>
                </form>

                {/* Admin List */}
                <div className="mt-8">
                  <h3
                    className={`text-lg font-semibold text-gray-900 mb-4 ${
                      lang === "bn" ? "bengali-text" : ""
                    }`}
                  >
                    {lang === "bn" ? "অ্যাডমিন তালিকা" : "Admin List"}
                  </h3>

                  {adminsLoading ? (
                    <div className="text-center py-8">
                      <div className="spinner mx-auto"></div>
                    </div>
                  ) : adminsList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {lang === "bn"
                        ? "কোন অ্যাডমিন পাওয়া যায়নি"
                        : "No admins found"}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                lang === "bn" ? "bengali-text" : ""
                              }`}
                            >
                              {lang === "bn" ? "নাম" : "Name"}
                            </th>
                            <th
                              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                lang === "bn" ? "bengali-text" : ""
                              }`}
                            >
                              {lang === "bn" ? "ইমেইল" : "Email"}
                            </th>
                            <th
                              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                lang === "bn" ? "bengali-text" : ""
                              }`}
                            >
                              {lang === "bn" ? "ভূমিকা" : "Role"}
                            </th>
                            <th
                              className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                lang === "bn" ? "bengali-text" : ""
                              }`}
                            >
                              {lang === "bn" ? "কার্যকরী" : "Actions"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {adminsList.map((admin) => (
                            <tr key={admin._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {admin.name}
                                  {admin._id === adminInfo?.id && (
                                    <span className="ml-2 text-xs text-blue-600">
                                      ({lang === "bn" ? "আপনি" : "You"})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {admin.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {admin.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {admin._id !== adminInfo?.id && (
                                  <button
                                    onClick={() => handleDeleteAdmin(admin._id)}
                                    className={`text-red-600 hover:text-red-900 ${
                                      lang === "bn" ? "bengali-text" : ""
                                    }`}
                                  >
                                    {lang === "bn" ? "মুছুন" : "Delete"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <div>
                <h2
                  className={`text-lg font-semibold text-gray-900 mb-4 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn" ? "অ্যাপ সম্পর্কে" : "About App"}
                </h2>

                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <h3
                      className={`font-semibold text-primary-900 mb-2 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "নায়ন শপ" : "Nayon Shop"}
                    </h3>
                    <p
                      className={`text-sm text-primary-800 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn"
                        ? "মেশিনারি এন্ড হার্ডওয়্যার ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম"
                        : "Machinery & Hardware Inventory Management System"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p
                        className={`text-sm text-gray-600 ${
                          lang === "bn" ? "bengali-text" : ""
                        }`}
                      >
                        {lang === "bn" ? "সংস্করণ" : "Version"}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        1.0.0
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p
                        className={`text-sm text-gray-600 ${
                          lang === "bn" ? "bengali-text" : ""
                        }`}
                      >
                        {lang === "bn" ? "ভাষা" : "Language"}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {lang === "bn" ? "বাংলা/English" : "Bangla/English"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4
                      className={`font-semibold text-blue-900 mb-2 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "বৈশিষ্ট্য" : "Features"}
                    </h4>
                    <ul
                      className={`text-sm text-blue-800 space-y-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      <li>
                        ✓{" "}
                        {lang === "bn"
                          ? "দ্বিভাষিক সমর্থন (বাংলা/ইংরেজি)"
                          : "Bilingual support (Bangla/English)"}
                      </li>
                      <li>
                        ✓{" "}
                        {lang === "bn"
                          ? "ইনভেন্টরি ম্যানেজমেন্ট"
                          : "Inventory management"}
                      </li>
                      <li>
                        ✓{" "}
                        {lang === "bn" ? "বিক্রয় রেকর্ডিং" : "Sales recording"}
                      </li>
                      <li>
                        ✓ {lang === "bn" ? "স্টক ট্র্যাকিং" : "Stock tracking"}
                      </li>
                      <li>
                        ✓ {lang === "bn" ? "পিডিএফ রিপোর্ট" : "PDF reports"}
                      </li>
                      <li>
                        ✓{" "}
                        {lang === "bn" ? "মোবাইল-ফ্রেন্ডলি" : "Mobile-friendly"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h2
              className={`text-lg font-semibold text-red-900 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "বিপদ জোন" : "Danger Zone"}
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`font-medium text-gray-900 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn" ? "লগআউট" : "Logout"}
                </h3>
                <p
                  className={`text-sm text-gray-600 mt-1 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn"
                    ? "আপনার অ্যাকাউন্ট থেকে লগআউট করুন"
                    : "Sign out of your account"}
                </p>
              </div>
              <button onClick={handleLogout} className="btn btn-danger">
                {t("logout", lang)}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
