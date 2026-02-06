/**
 * Mobile Crash Diagnostics Panel
 * On-screen log viewer for ?diag=1 mode
 */

import { useState, useEffect } from "react";
import { diagEnabled, readDiagLogs, clearDiagLogs } from "@/lib/client/diag";

interface DiagLogEntry {
  t: number;
  level: "log" | "warn" | "error";
  msg: string;
}

export function DiagPanel() {
  const [open, setOpen] = useState(true);
  const [logs, setLogs] = useState<DiagLogEntry[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check if diag mode is enabled (client-side only)
    const isEnabled = diagEnabled();
    setEnabled(isEnabled);
    if (!isEnabled) return;

    // Initial load
    setLogs(readDiagLogs());

    // Poll for new logs
    const id = setInterval(() => {
      setLogs(readDiagLogs());
    }, 1500);

    return () => clearInterval(id);
  }, []);

  if (!enabled) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "#ff6b6b";
      case "warn": return "#ffd93d";
      default: return "#6bcf6b";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        borderTop: "2px solid #444",
        fontFamily: "monospace",
        fontSize: "11px",
        maxHeight: open ? "40vh" : "32px",
        transition: "max-height 0.2s ease",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          backgroundColor: "#222",
          borderBottom: "1px solid #444",
        }}
      >
        <span style={{ color: "#ff9f43", fontWeight: "bold" }}>
          📱 Mobile DIAG ({logs.length} logs)
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              clearDiagLogs();
              setLogs([]);
            }}
            style={{
              color: "#ff6b6b",
              background: "none",
              border: "1px solid #ff6b6b",
              padding: "2px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "10px",
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              color: "#fff",
              background: "none",
              border: "1px solid #666",
              padding: "2px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "10px",
            }}
          >
            {open ? "▼ Hide" : "▲ Show"}
          </button>
        </div>
      </div>

      {open && (
        <div
          style={{
            overflowY: "auto",
            maxHeight: "calc(40vh - 40px)",
            padding: "8px",
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: "#888", padding: "12px" }}>
              No logs yet. Waiting for events...
            </div>
          ) : (
            logs.slice(-50).map((l, i) => (
              <div
                key={i}
                style={{
                  color: getLevelColor(l.level),
                  padding: "2px 0",
                  borderBottom: "1px solid #333",
                  wordBreak: "break-word",
                }}
              >
                <span style={{ color: "#888" }}>
                  {new Date(l.t).toLocaleTimeString()}
                </span>{" "}
                <span style={{ 
                  backgroundColor: getLevelColor(l.level),
                  color: "#000",
                  padding: "0 4px",
                  borderRadius: "2px",
                  fontSize: "9px",
                  fontWeight: "bold",
                }}>
                  {l.level.toUpperCase()}
                </span>{" "}
                <span style={{ color: "#ddd" }}>{l.msg}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
