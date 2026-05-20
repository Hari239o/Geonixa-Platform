"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, Eye, Zap, AlertCircle } from "lucide-react";

interface DebugLog {
  timestamp: number;
  type: "detection" | "error" | "warning" | "info";
  message: string;
  data?: any;
}

export function AIProctorDebugPanel() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intercept console for debugging
    const originalLog = console.log;
    const originalError = console.error;
    const originalDebug = console.debug;
    const originalWarn = console.warn;

    const captureLog = (type: DebugLog["type"], ...args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(" ");

      if (
        message.includes("[VISION]") ||
        message.includes("[FRAME]") ||
        message.includes("[DETECTION]") ||
        message.includes("[AUDIO]") ||
        message.includes("[MODELS]") ||
        message.includes("detected") ||
        message.includes("Model load error") ||
        message.includes("Failed to load")
      ) {
        setLogs(prev => [
          ...prev.slice(-100), // Keep last 100 logs
          {
            timestamp: Date.now(),
            type,
            message,
            data: args.length > 1 ? args[1] : undefined
          }
        ]);
      }
    };

    console.log = (...args) => {
      originalLog(...args);
      captureLog("info", ...args);
    };
    console.error = (...args) => {
      originalError(...args);
      captureLog("error", ...args);
    };
    console.debug = (...args) => {
      originalDebug(...args);
      captureLog("info", ...args);
    };
    console.warn = (...args) => {
      originalWarn(...args);
      captureLog("warning", ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.debug = originalDebug;
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 z-50 flex items-center gap-2 text-sm"
      >
        <Terminal className="w-4 h-4" />
        Debug Panel
      </button>
    );
  }

  const errorCount = logs.filter(l => l.type === "error").length;
  const detectionCount = logs.filter(l => l.message.includes("[DETECTION]")).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-100 p-4 max-h-96 overflow-y-auto border-t border-orange-500 z-50">
      <div className="flex justify-between items-center mb-3 sticky top-0 bg-gray-900">
        <h3 className="font-bold text-orange-400 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          AI Proctor Debug Panel
        </h3>
        <div className="flex gap-3 items-center">
          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
            Detections: {detectionCount}
          </span>
          {errorCount > 0 && (
            <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Errors: {errorCount}
            </span>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>

      <div className="space-y-1 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">Waiting for detection logs...</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`${
                log.type === "error"
                  ? "text-red-400"
                  : log.type === "warning"
                    ? "text-yellow-400"
                    : log.message.includes("[DETECTION]")
                      ? "text-green-400"
                      : "text-gray-300"
              } whitespace-nowrap overflow-x-auto pb-0.5`}
            >
              <span className="text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>{" "}
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Status Summary */}
      <div className="mt-4 pt-3 border-t border-gray-700 text-xs">
        <div className="grid grid-cols-2 gap-2 text-gray-400">
          <div>Total Logs: {logs.length}</div>
          <div>Errors: {errorCount}</div>
        </div>
      </div>
    </div>
  );
}
