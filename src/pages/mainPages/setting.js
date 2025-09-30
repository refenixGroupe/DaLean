import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // State for settings
  const [settings, setSettings] = useState({
    language: localStorage.getItem("language") || "en",
    autoSave: localStorage.getItem("autoSave") === "true",
    notifications: {
      email: localStorage.getItem("emailNotifications") !== "false",
      browser: localStorage.getItem("browserNotifications") !== "false",
      cleaning: localStorage.getItem("cleaningNotifications") !== "false",
    },
    dataRetention: localStorage.getItem("dataRetention") || "30",
    exportFormat: localStorage.getItem("defaultExportFormat") || "csv",
    maxFileSize: localStorage.getItem("maxFileSize") || "100",
    timezone:
      localStorage.getItem("timezone") ||
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency: localStorage.getItem("currency") || "USD",
    dateFormat: localStorage.getItem("dateFormat") || "MM/DD/YYYY",
    keyboardShortcuts: {
      enabled: localStorage.getItem("keyboardShortcutsEnabled") !== "false",
      globalSearch: localStorage.getItem("globalSearchShortcut") !== "false",
      quickActions: localStorage.getItem("quickActionsShortcut") !== "false",
      tableNavigation:
        localStorage.getItem("tableNavigationShortcut") !== "false",
    },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (category, setting, value) => {
    if (category) {
      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: value,
        },
      }));

      // Save notifications to localStorage immediately
      if (category === "notifications") {
        localStorage.setItem(`${setting}Notifications`, value.toString());
      }
      // Save keyboard shortcuts to localStorage immediately
      if (category === "keyboardShortcuts") {
        localStorage.setItem(
          `${
            setting === "enabled"
              ? "keyboardShortcutsEnabled"
              : setting + "Shortcut"
          }`,
          value.toString()
        );
      }
    } else {
      setSettings((prev) => ({
        ...prev,
        [setting]: value,
      }));

      // Save non-theme settings to localStorage immediately
      if (setting !== "theme") {
        const storageKey =
          setting === "exportFormat" ? "defaultExportFormat" : setting;
        localStorage.setItem(storageKey, value.toString());
      }
    }
  };

  const saveSettings = async () => {
    setSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save to localStorage
    localStorage.setItem("theme", settings.theme);
    localStorage.setItem("language", settings.language);
    localStorage.setItem("autoSave", settings.autoSave.toString());
    localStorage.setItem(
      "emailNotifications",
      settings.notifications.email.toString()
    );
    localStorage.setItem(
      "browserNotifications",
      settings.notifications.browser.toString()
    );
    localStorage.setItem(
      "cleaningNotifications",
      settings.notifications.cleaning.toString()
    );
    localStorage.setItem("dataRetention", settings.dataRetention);
    localStorage.setItem("defaultExportFormat", settings.exportFormat);
    localStorage.setItem("maxFileSize", settings.maxFileSize);
    localStorage.setItem("timezone", settings.timezone);
    localStorage.setItem("currency", settings.currency);
    localStorage.setItem("dateFormat", settings.dateFormat);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const resetSettings = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to default?")
    ) {
      const defaultSettings = {
        theme: "light",
        language: "en",
        autoSave: false,
        notifications: {
          email: true,
          browser: true,
          cleaning: true,
        },
        dataRetention: "30",
        exportFormat: "csv",
        maxFileSize: "100",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
      };

      setSettings(defaultSettings);

      // Reset localStorage (except theme - let theme switcher handle that)
      localStorage.setItem("language", "en");
      localStorage.setItem("autoSave", "false");
      localStorage.setItem("emailNotifications", "true");
      localStorage.setItem("browserNotifications", "true");
      localStorage.setItem("cleaningNotifications", "true");
      localStorage.setItem("dataRetention", "30");
      localStorage.setItem("defaultExportFormat", "csv");
      localStorage.setItem("maxFileSize", "1000");
      localStorage.setItem(
        "timezone",
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      localStorage.setItem("currency", "USD");
      localStorage.setItem("dateFormat", "MM/DD/YYYY");

      alert("Settings have been reset to default values (except theme).");
    }
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL stored data? This action cannot be undone!"
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      alert("All data has been cleared. The page will now reload.");
      window.location.reload();
    }
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
    { code: "ru", name: "Русский" },
    { code: "zh", name: "中文" },
    { code: "ja", name: "日本語" },
  ];

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Kolkata",
    "Australia/Sydney",
  ];

  const currencies = [
    "DZD",
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "CHF",
    "CNY",
    "SEK",
    "NZD",
  ];

  const dateFormats = [
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY-MM-DD",
    "MMM DD, YYYY",
    "DD MMM YYYY",
  ];

  return (
    <div
      className={`transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                ⚙️ Settings
              </h1>
              <p
                className={`mt-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Customize your DaLean experience
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  settings.theme === "dark"
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
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
                Back
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <div
            className={`rounded-lg border p-6 ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              🎨 Appearance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme Toggle */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Theme
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      theme === "light"
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      theme === "dark"
                        ? "bg-blue-900 border-blue-700 text-blue-300"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Language */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleSettingChange(null, "language", e.target.value)
                  }
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    settings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data Processing Settings */}
          <div
            className={`rounded-lg border p-6 ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              🔧 Data Processing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div>
                  <label
                    className={`text-sm font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Auto-save cleaned data
                  </label>
                  <p
                    className={`text-xs ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Automatically save your work periodically
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(null, "autoSave", !settings.autoSave)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoSave ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoSave ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Default Export Format */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Default Export Format
                </label>
                <select
                  value={settings.exportFormat}
                  onChange={(e) =>
                    handleSettingChange(null, "exportFormat", e.target.value)
                  }
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    settings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                  <option value="sql">SQL</option>
                  <option value="xml">XML</option>
                  <option value="tsv">TSV</option>
                </select>
              </div>

              {/* Data Retention */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Data Retention (days)
                </label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) =>
                    handleSettingChange(null, "dataRetention", e.target.value)
                  }
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    settings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="never">Never delete</option>
                </select>
              </div>

              {/* Max File Size */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Max File Size (MB)
                </label>
                <select
                  value={settings.maxFileSize}
                  onChange={(e) =>
                    handleSettingChange(null, "maxFileSize", e.target.value)
                  }
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    settings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="50">50 MB</option>
                  <option value="100">100 MB</option>
                  <option value="250">250 MB</option>
                  <option value="500">500 MB</option>
                  <option value="1000">1 GB</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div
            className={`rounded-lg border p-6 ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              🔔 Notifications
            </h2>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label
                    className={`text-sm font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Email notifications
                  </label>
                  <p
                    className={`text-xs ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Receive email updates about your data processing
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "notifications",
                      "email",
                      !settings.notifications.email
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.email ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.email
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Browser Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label
                    className={`text-sm font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Browser notifications
                  </label>
                  <p
                    className={`text-xs ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Show desktop notifications in your browser
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "notifications",
                      "browser",
                      !settings.notifications.browser
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.browser
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.browser
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Cleaning Completion Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label
                    className={`text-sm font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Data cleaning completion
                  </label>
                  <p
                    className={`text-xs ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Notify when data cleaning processes complete
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "notifications",
                      "cleaning",
                      !settings.notifications.cleaning
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.cleaning
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.cleaning
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div
            className={`rounded-lg border p-6 ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              ⚡ Keyboard Shortcuts
            </h2>
            <p
              className={`text-sm mb-6 ${
                settings.theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Blazing fast and keyboard friendly navigation
            </p>

            {/* Enable/Disable Shortcuts */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <label
                    className={`text-sm font-medium ${
                      settings.theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    Enable keyboard shortcuts
                  </label>
                  <p
                    className={`text-xs ${
                      settings.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Turn on/off all keyboard shortcuts
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "keyboardShortcuts",
                      "enabled",
                      !settings.keyboardShortcuts.enabled
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.keyboardShortcuts.enabled
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.keyboardShortcuts.enabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-4">
              <h3
                className={`text-lg font-medium ${
                  settings.theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Available Shortcuts
              </h3>

              {/* General Navigation */}
              <div>
                <h4
                  className={`text-sm font-medium mb-3 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  General Navigation
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      Search and jump to a collection
                    </span>
                    <div className="flex gap-1">
                      <kbd
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          settings.theme === "dark"
                            ? "bg-gray-700 text-gray-300 border border-gray-600"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        Cmd
                      </kbd>
                      <span
                        className={
                          settings.theme === "dark"
                            ? "text-gray-500"
                            : "text-gray-400"
                        }
                      >
                        +
                      </span>
                      <kbd
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          settings.theme === "dark"
                            ? "bg-gray-700 text-gray-300 border border-gray-600"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        K
                      </kbd>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      Create new collection
                    </span>
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        settings.theme === "dark"
                          ? "bg-gray-700 text-gray-300 border border-gray-600"
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      N
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      Create new item in collection
                    </span>
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        settings.theme === "dark"
                          ? "bg-gray-700 text-gray-300 border border-gray-600"
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      C
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      Create new property
                    </span>
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        settings.theme === "dark"
                          ? "bg-gray-700 text-gray-300 border border-gray-600"
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      P
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      Open item detail
                    </span>
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        settings.theme === "dark"
                          ? "bg-gray-700 text-gray-300 border border-gray-600"
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      Space
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      Close drawer/modal
                    </span>
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        settings.theme === "dark"
                          ? "bg-gray-700 text-gray-300 border border-gray-600"
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      Escape
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Data Table Navigation */}
              <div>
                <h4
                  className={`text-sm font-medium mb-3 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Data Table Navigation
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      Select multiple items
                    </span>
                    <div className="flex gap-1">
                      <kbd
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          settings.theme === "dark"
                            ? "bg-gray-700 text-gray-300 border border-gray-600"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        Shift
                      </kbd>
                      <span
                        className={
                          settings.theme === "dark"
                            ? "text-gray-500"
                            : "text-gray-400"
                        }
                      >
                        +
                      </span>
                      <kbd
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          settings.theme === "dark"
                            ? "bg-gray-700 text-gray-300 border border-gray-600"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        ↓/↑
                      </kbd>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        settings.theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      Move to table edges
                    </span>
                    <div className="flex gap-1">
                      <kbd
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          settings.theme === "dark"
                            ? "bg-gray-700 text-gray-300 border border-gray-600"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        Ctrl
                      </kbd>
                      <span
                        className={
                          settings.theme === "dark"
                            ? "text-gray-500"
                            : "text-gray-400"
                        }
                      >
                        +
                      </span>
                      <kbd
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          settings.theme === "dark"
                            ? "bg-gray-700 text-gray-300 border border-gray-600"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        ↓/↑/→/←
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div
            className={`rounded-lg border p-6 ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              🌍 Regional
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timezone */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    handleSettingChange(null, "timezone", e.target.value)
                  }
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    settings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    handleSettingChange(null, "currency", e.target.value)
                  }
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    settings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Format */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    settings.theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) =>
                    handleSettingChange(null, "dateFormat", e.target.value)
                  }
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    settings.theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {dateFormats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`rounded-lg border p-6 ${
              settings.theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                settings.theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              🔧 Actions
            </h2>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={saveSettings}
                disabled={saving}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  saving
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : saved
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {saving ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Save Settings
                  </>
                )}
              </button>

              <button
                onClick={resetSettings}
                className={`px-6 py-2 rounded-lg font-medium border transition-colors flex items-center gap-2 ${
                  settings.theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset to Default
              </button>

              <button
                onClick={clearAllData}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
