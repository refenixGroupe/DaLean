import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const KeyboardShortcutsContext = createContext();

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      "useKeyboardShortcuts must be used within a KeyboardShortcutsProvider"
    );
  }
  return context;
};

export const KeyboardShortcutsProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isEnabled, setIsEnabled] = useState(
    localStorage.getItem("keyboardShortcutsEnabled") !== "false"
  );
  const [showShortcutHint, setShowShortcutHint] = useState(null);

  // Show shortcut hint toast
  const showHint = (shortcut, action) => {
    setShowShortcutHint({ shortcut, action });
    setTimeout(() => setShowShortcutHint(null), 2000);
  };

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when user is typing in inputs
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.contentEditable === "true"
      ) {
        // Only allow Escape to work in inputs to close modals
        if (event.key === "Escape") {
          event.target.blur();
          showHint("Esc", "Input unfocused");
        }
        return;
      }

      // Prevent default for our handled shortcuts
      const shouldPreventDefault = () => {
        if (event.key === "Escape") return true;
        if (event.key === "n" || event.key === "N") return true;
        if (event.key === "c" || event.key === "C") return true;
        if (event.key === "p" || event.key === "P") return true;
        if (event.key === " ") return true;
        if ((event.metaKey || event.ctrlKey) && event.key === "k") return true;
        return false;
      };

      if (shouldPreventDefault()) {
        event.preventDefault();
      }

      // Handle shortcuts
      switch (true) {
        // Global search: Cmd/Ctrl + K
        case (event.metaKey || event.ctrlKey) && event.key === "k":
          showHint("⌘K", "Global search");
          // TODO: Implement global search modal
          console.log("Global search triggered");
          break;

        // New collection: N
        case event.key === "n" || event.key === "N":
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
            showHint("N", "New collection");
            navigate("/upload"); // Navigate to upload for new data
          }
          break;

        // Create item in collection: C
        case event.key === "c" || event.key === "C":
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
            showHint("C", "Create item");
            // TODO: Implement create item functionality
            console.log("Create item triggered");
          }
          break;

        // Create property: P
        case event.key === "p" || event.key === "P":
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
            showHint("P", "Create property");
            // TODO: Implement create property functionality
            console.log("Create property triggered");
          }
          break;

        // Open item detail: Space
        case event.key === " ":
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
            showHint("Space", "Item details");
            // TODO: Implement item detail functionality
            console.log("Open item detail triggered");
          }
          break;

        // Close drawer/modal: Escape
        case event.key === "Escape":
          showHint("Esc", "Close modal");
          // TODO: Implement close modal functionality
          console.log("Close modal triggered");
          break;

        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, navigate]);

  const value = {
    isEnabled,
    setIsEnabled,
    showShortcutHint,
    showHint,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}

      {/* Shortcut Hint Toast */}
      {showShortcutHint && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">
            {showShortcutHint.shortcut}
          </kbd>
          <span className="text-sm">{showShortcutHint.action}</span>
        </div>
      )}
    </KeyboardShortcutsContext.Provider>
  );
};
