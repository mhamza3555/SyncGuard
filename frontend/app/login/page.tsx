"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, saveToken } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await registerUser(email, password);
        setIsRegistering(false);
        setError("Account created. Log in below.");
      } else {
        const data = await loginUser(email, password);
        saveToken(data.access_token);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0E14] text-[#E8ECF1] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          80% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pulse-ring { animation: pulse-ring 2.2s cubic-bezier(0.2, 0.6, 0.4, 1) infinite; }
        .pulse-ring-delay { animation-delay: 0.7s; }
        .pulse-dot { animation: pulse-dot 2.2s ease-in-out infinite; }
        .grid-bg {
          background-image:
            linear-gradient(#1a212c 1px, transparent 1px),
            linear-gradient(90deg, #1a212c 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* Left panel — signature visual, hidden on small screens */}
      <div className="hidden md:flex md:w-1/2 relative grid-bg items-center justify-center overflow-hidden border-r border-[#1F2733]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14] via-transparent to-[#0A0E14]" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Sync pulse signature element */}
          <div className="relative w-40 h-40 flex items-center justify-center mb-10">
            <span className="absolute w-40 h-40 rounded-full border border-[#F0B429]/40 pulse-ring" />
            <span className="absolute w-40 h-40 rounded-full border border-[#F0B429]/40 pulse-ring pulse-ring-delay" />
            <span className="w-3 h-3 rounded-full bg-[#F0B429] pulse-dot shadow-[0_0_20px_4px_rgba(240,180,41,0.5)]" />
          </div>

          <p className="font-['JetBrains_Mono'] text-xs tracking-widest text-[#7C8798] uppercase mb-3">
            connector status: <span className="text-[#34D399]">live</span>
          </p>
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-center px-10 leading-tight">
            SyncGuard
          </h1>
          <p className="font-['JetBrains_Mono'] text-sm text-[#7C8798] mt-3 text-center px-14">
            Watching your connectors, one delta at a time.
          </p>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="font-['JetBrains_Mono'] text-xs tracking-widest text-[#F0B429] uppercase mb-2">
              {isRegistering ? "new session" : "authenticate"}
            </p>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold">
              {isRegistering ? "Create your account" : "Log in to SyncGuard"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-['JetBrains_Mono'] text-xs text-[#7C8798] uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full bg-[#12171F] border border-[#1F2733] rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#F0B429] focus:ring-1 focus:ring-[#F0B429] transition-colors placeholder:text-[#4A5568]"
              />
            </div>

            <div>
              <label className="font-['JetBrains_Mono'] text-xs text-[#7C8798] uppercase tracking-wide block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#12171F] border border-[#1F2733] rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#F0B429] focus:ring-1 focus:ring-[#F0B429] transition-colors placeholder:text-[#4A5568]"
              />
            </div>

            {error && (
              <p className={`font-['JetBrains_Mono'] text-xs px-3 py-2 rounded border ${
                error.includes("created")
                  ? "text-[#34D399] border-[#34D399]/30 bg-[#34D399]/5"
                  : "text-[#F87171] border-[#F87171]/30 bg-[#F87171]/5"
              }`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F0B429] hover:bg-[#e0a51f] text-[#0A0E14] font-semibold py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Working..." : isRegistering ? "Register" : "Log In"}
            </button>
          </form>

          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
            className="font-['JetBrains_Mono'] text-xs text-[#7C8798] hover:text-[#E8ECF1] mt-6 w-full text-center transition-colors"
          >
            {isRegistering ? "→ already have an account? log in" : "→ need an account? register"}
          </button>
        </div>
      </div>
    </main>
  );
}