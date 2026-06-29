import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2, Shield } from "lucide-react";

interface CheckResult {
  status: "ok" | "error" | "degraded";
  message: string;
  latencyMs?: number;
}

interface HealthData {
  status: "ok" | "error" | "degraded";
  timestamp: string;
  totalLatencyMs: number;
  checks: Record<string, CheckResult>;
}

const SERVICE_LABELS: Record<string, { label: string; icon: string }> = {
  database: { label: "Neon DB (Drizzle ORM)", icon: "🗄️" },
  redis: { label: "Upstash Redis Cache", icon: "⚡" },
  cloudinary: { label: "Cloudinary CDN", icon: "☁️" },
  razorpay: { label: "Razorpay Payments", icon: "💳" },
  resend: { label: "Resend Email API", icon: "📧" },
  pusher: { label: "Pusher Real-Time", icon: "🔌" },
  ai: { label: "AI (Anthropic/Google)", icon: "🤖" },
};

function StatusIcon({ status }: { status: CheckResult["status"] }) {
  if (status === "ok") return <CheckCircle className="w-5 h-5 text-brand-green shrink-0" />;
  if (status === "error") return <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
  return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
}

const statusBadgeClass: Record<string, string> = {
  ok: "bg-emerald-50 text-brand-green border border-emerald-200",
  error: "bg-rose-50 text-rose-700 border border-rose-200",
  degraded: "bg-amber-50 text-amber-700 border border-amber-200",
};

interface HealthPageProps {
  user?: any;
}

export function HealthPage({ user }: HealthPageProps) {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const isAdmin = user?.role === "admin";
  const isProd = !(import.meta as any).env.DEV;

  // Guard: in production, only admins can see this page
  if (isProd && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans bg-[#FDFCFB]">
        <div className="text-center space-y-4 p-8 border border-black/10 bg-white max-w-sm">
          <Shield className="w-12 h-12 text-brand-dark/30 mx-auto" />
          <h2 className="text-xl font-serif italic font-black text-brand-dark">Access Restricted</h2>
          <p className="text-xs text-brand-dark/60">
            The FMI Health Dashboard is restricted to Platform Administrators in production.
          </p>
        </div>
      </div>
    );
  }

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health-check");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to reach health endpoint");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 inline-block">
              SYSTEM STATUS
            </span>
            <h1 className="text-3xl font-serif italic font-black text-brand-dark">
              FMI Platform Health
            </h1>
            <p className="text-xs text-brand-dark/50">
              Integration diagnostics across all FMI backend services and third-party providers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-mono text-brand-dark/40">
              Last refresh: {lastRefresh.toLocaleTimeString("en-IN")}
            </span>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-dark hover:bg-brand-dark/90 text-white text-xs font-mono uppercase tracking-widest border border-brand-dark transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Checking..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="border border-rose-200 bg-rose-50 p-5 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-800">Unable to reach health endpoint</p>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="flex items-center justify-center py-20 gap-3 text-brand-dark/40">
            <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
            <span className="text-xs font-mono uppercase tracking-widest">Probing all services...</span>
          </div>
        )}

        {/* Data Loaded */}
        {data && (
          <>
            {/* Overall Status Banner */}
            <div className={`p-5 border flex items-center gap-4 ${
              data.status === "ok" ? "bg-emerald-50 border-emerald-200" :
              data.status === "error" ? "bg-rose-50 border-rose-200" :
              "bg-amber-50 border-amber-200"
            }`}>
              <StatusIcon status={data.status} />
              <div className="flex-1">
                <p className={`font-mono font-bold text-sm uppercase tracking-wider ${
                  data.status === "ok" ? "text-brand-green" :
                  data.status === "error" ? "text-rose-700" : "text-amber-700"
                }`}>
                  {data.status === "ok" ? "All Systems Operational" :
                   data.status === "error" ? "Critical Service Degradation" :
                   "Partial Degradation Detected"}
                </p>
                <p className="text-[10px] font-mono text-brand-dark/50 mt-0.5">
                  Completed in {data.totalLatencyMs}ms — {new Date(data.timestamp).toLocaleString("en-IN")}
                </p>
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 ${statusBadgeClass[data.status]}`}>
                {data.status.toUpperCase()}
              </span>
            </div>

            {/* Individual Service Checks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.checks).map(([key, check]) => {
                const checkVal = check as CheckResult;
                const meta = SERVICE_LABELS[key] || { label: key, icon: "🔧" };
                return (
                  <div key={key} className="bg-white border border-black/10 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{meta.icon}</span>
                        <div>
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/40">{key.toUpperCase()}</p>
                          <p className="text-xs font-bold text-brand-dark">{meta.label}</p>
                        </div>
                      </div>
                      <StatusIcon status={checkVal.status} />
                    </div>

                    <div className="border-t border-black/5 pt-3 space-y-1">
                      <p className="text-[11px] text-brand-dark/70 leading-relaxed">{checkVal.message}</p>
                      {checkVal.latencyMs !== undefined && (
                        <p className="text-[10px] font-mono text-brand-dark/35">Latency: {checkVal.latencyMs}ms</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 ${statusBadgeClass[checkVal.status]}`}>
                        {checkVal.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HealthPage;
