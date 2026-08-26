"use client";

import { useState } from "react";
import { CheckInStage, PendingItem } from "@/types/api";
import { Bug, ChevronDown, ChevronUp, Copy, Check, Terminal, Activity } from "lucide-react";

export interface DebugLogEntry {
  timestamp: string;
  action: string;
  status: "pending" | "success" | "error";
  latencyMs?: number;
  payload?: any;
  response?: any;
}

interface CheckinDebugPanelProps {
  sessionId: string | null;
  currentStage: CheckInStage;
  pendingItems: PendingItem[];
  isRecording: boolean;
  recordingTime: number;
  logs: DebugLogEntry[];
  onClearLogs: () => void;
}

export function CheckinDebugPanel({
  sessionId,
  currentStage,
  pendingItems,
  isRecording,
  recordingTime,
  logs,
  onClearLogs,
}: CheckinDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"state" | "logs" | "payload">("state");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lastLog = logs[logs.length - 1];

  return (
    <div className="fixed bottom-3 right-3 z-50 font-mono text-xs select-text">
      {/* Floating Toggle Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl border backdrop-blur-md transition-all cursor-pointer ${
          isOpen
            ? "bg-neutral-900 text-white border-neutral-700"
            : lastLog?.status === "error"
            ? "bg-red-950/90 text-red-200 border-red-800"
            : "bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:bg-neutral-900"
        }`}
      >
        <Bug size={14} className={lastLog?.status === "error" ? "text-red-400" : "text-emerald-400"} />
        <span className="font-bold tracking-tight">EnatAI Debugger</span>
        <span
          className={`w-2 h-2 rounded-full ${
            isRecording ? "bg-red-500 animate-ping" : sessionId ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Expanded Debug Drawer */}
      {isOpen && (
        <div className="mt-2 w-[92vw] max-w-md bg-neutral-950/95 text-neutral-200 border border-neutral-800 rounded-2xl shadow-2xl p-4 space-y-3 backdrop-blur-lg animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" />
              <span className="font-bold text-white text-[11px]">EnatAI Intake Inspector</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify({ sessionId, currentStage, pendingItems, logs }, null, 2)
                  )
                }
                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 flex items-center gap-1"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copied ? "Copied" : "Dump JSON"}</span>
              </button>
              <button
                type="button"
                onClick={onClearLogs}
                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-400 hover:text-neutral-200"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-neutral-500 block">Stage</span>
              <span className="font-bold text-emerald-400 uppercase">{currentStage}</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-neutral-500 block">Items</span>
              <span className="font-bold text-amber-400">{pendingItems.length} Pending</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-neutral-500 block">Audio Mic</span>
              <span className={`font-bold ${isRecording ? "text-red-400" : "text-neutral-400"}`}>
                {isRecording ? `REC ${recordingTime}s` : "Idle"}
              </span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-1 border-b border-neutral-800 pb-1 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("state")}
              className={`px-2.5 py-1 rounded-lg ${
                activeTab === "state" ? "bg-neutral-800 text-white font-bold" : "text-neutral-400"
              }`}
            >
              Session State
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                activeTab === "logs" ? "bg-neutral-800 text-white font-bold" : "text-neutral-400"
              }`}
            >
              <Activity size={11} />
              <span>API Trace ({logs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payload")}
              className={`px-2.5 py-1 rounded-lg ${
                activeTab === "payload" ? "bg-neutral-800 text-white font-bold" : "text-neutral-400"
              }`}
            >
              Pending JSON
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-56 overflow-y-auto pr-1 space-y-2 text-[10px]">
            {activeTab === "state" && (
              <div className="space-y-1.5 text-neutral-300">
                <div className="p-2 rounded-xl bg-neutral-900/70 border border-neutral-800">
                  <span className="text-neutral-500 block">Active Session UUID:</span>
                  <span className="text-neutral-200 select-all">{sessionId || "Not Started"}</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-900/70 border border-neutral-800">
                  <span className="text-neutral-500 block">Danger Signs Triggered:</span>
                  <span
                    className={`font-bold ${
                      pendingItems.some((i) => i.danger_sign) ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {pendingItems.some((i) => i.danger_sign) ? "YES (Flagged)" : "NO (Clean)"}
                  </span>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-1.5">
                {logs.length === 0 ? (
                  <p className="text-neutral-500 py-3 text-center">No API calls recorded yet.</p>
                ) : (
                  logs
                    .slice()
                    .reverse()
                    .map((l, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-xl border ${
                          l.status === "error"
                            ? "bg-red-950/30 border-red-800 text-red-200"
                            : "bg-neutral-900/70 border-neutral-800 text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] text-neutral-500">
                          <span>{l.timestamp}</span>
                          {l.latencyMs && <span>{l.latencyMs}ms</span>}
                        </div>
                        <p className="font-bold text-white mt-0.5">{l.action}</p>
                        {l.response && (
                          <pre className="mt-1 p-1 bg-black/40 rounded text-[9px] overflow-x-auto text-neutral-400">
                            {JSON.stringify(l.response, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                )}
              </div>
            )}

            {activeTab === "payload" && (
              <pre className="p-2 bg-black/60 rounded-xl border border-neutral-800 text-neutral-300 overflow-x-auto text-[9px]">
                {JSON.stringify(pendingItems, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}