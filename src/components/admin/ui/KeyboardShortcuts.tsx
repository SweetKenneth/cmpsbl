import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const shortcuts = [
  { key: "d", path: "/admin/dashboard", label: "Dashboard" },
  { key: "u", path: "/admin/users", label: "Users" },
  { key: "k", path: "/admin/api-keys", label: "API Keys" },
  { key: "b", path: "/admin/billing", label: "Billing" },
  { key: "s", path: "/admin/settings", label: "Settings" },
];

export function useKeyboardShortcuts(enabled = true) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if Cmd/Ctrl + Shift is pressed
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        const shortcut = shortcuts.find((s) => s.key === e.key.toLowerCase());
        if (shortcut) {
          e.preventDefault();
          navigate(shortcut.path);
          toast.success(`Navigated to ${shortcut.label}`, { duration: 1500 });
        }
      }

      // Show shortcuts helper with ?
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        showShortcutsModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [enabled, navigate]);
}

function showShortcutsModal() {
  toast.info(
    <div className="space-y-2">
      <p className="font-semibold">Keyboard Shortcuts</p>
      {shortcuts.map((s) => (
        <div key={s.key} className="flex justify-between text-xs">
          <span>{s.label}</span>
          <kbd className="px-2 py-1 bg-muted rounded">
            ⌘⇧{s.key.toUpperCase()}
          </kbd>
        </div>
      ))}
    </div>,
    { duration: 5000 }
  );
}
