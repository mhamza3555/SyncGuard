"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchRecords, fetchSyncHistory, fetchActivity, triggerSync, askQuestion, getToken, clearToken } from "./lib/api";

type Record = {
  id: number;
  title: string;
  status: string;
  owner: string;
};

type SyncRun = {
  id: number;
  status: string;
  records_changed: number;
  started_at: string;
};

type Activity = {
  owner: string;
  record_count: number;
};

export default function Dashboard() {
  const [records, setRecords] = useState<Record[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncRun[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sqlUsed, setSqlUsed] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setCheckingAuth(false);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsData, historyData, activityData] = await Promise.all([
        fetchRecords(),
        fetchSyncHistory(),
        fetchActivity(),
      ]);
      setRecords(recordsData);
      setSyncHistory(historyData);
      setActivity(activityData);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await triggerSync("octocat");
      await fetchData();
    } catch (err) {
      setLoading(false);
    }
};
  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAskError("");
    setAnswer("");
    setSqlUsed("");
    try {
      const result = await askQuestion(question);
      setAnswer(result.answer);
      setSqlUsed(result.sql || "");
    } catch (err: any) {
      setAskError(err.message || "Something went wrong");
    } finally {
      setAsking(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Checking session...</p>
      </main>
    );
  }

  const maxCount = activity[0]?.record_count || 1;

  return (
    <main className="min-h-screen bg-[#0A0E14] text-[#E8ECF1] p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(240, 180, 41, 0.15); }
          50% { box-shadow: 0 0 0 8px rgba(240, 180, 41, 0); }
        }
        .ai-card { animation: glow-pulse 3s ease-in-out infinite; }
        .bar-fill { transition: width 0.6s ease-out; }
      `}</style>

      <div className="flex justify-between items-center mb-6">
        <h1 className="font-['Space_Grotesk'] text-3xl font-bold">SyncGuard Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white border border-gray-800 px-3 py-1.5 rounded"
        >
          Log Out
        </button>
      </div>

      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-8 disabled:opacity-50"
      >
        {loading ? "Syncing..." : "Sync Now"}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-gray-400 text-sm mb-1">Connector</p>
          <p className="text-xl font-semibold">GitHub</p>
          <p className="text-green-400 text-sm mt-2">● Connected</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-gray-400 text-sm mb-1">Total Records</p>
          <p className="text-xl font-semibold">{records.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-gray-400 text-sm mb-1">Last Sync</p>
          <p className="text-xl font-semibold">
            {syncHistory[0] ? new Date(syncHistory[0].started_at).toLocaleString() : "Never"}
          </p>
        </div>
      </div>

      {/* AI Q&A */}
      <div className="ai-card bg-gradient-to-br from-[#1a1508] to-[#12171F] border border-[#F0B429]/30 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F0B429]" />
          <p className="font-['JetBrains_Mono'] text-xs tracking-widest text-[#F0B429] uppercase">
            ai insights
          </p>
        </div>

        <form onSubmit={handleAsk} className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about your data — e.g. how many issues are open?"
            className="flex-1 bg-[#12171F] border border-[#232B36] rounded-md px-4 py-2.5 text-sm outline-none focus:border-[#F0B429] focus:ring-1 focus:ring-[#F0B429] transition-colors placeholder:text-[#4A5568]"
          />
          <button
            type="submit"
            disabled={asking}
            className="bg-[#F0B429] hover:bg-[#e0a51f] text-[#0A0E14] font-semibold px-5 py-2.5 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {asking ? "Thinking..." : "Ask"}
          </button>
        </form>

        {askError && (
          <p className="font-['JetBrains_Mono'] text-xs text-[#F87171] mt-4">{askError}</p>
        )}

        {answer && (
          <div className="mt-5 pt-5 border-t border-[#232B36]">
            <p className="text-[#E8ECF1] leading-relaxed">{answer}</p>
            {sqlUsed && (
              <details className="mt-3 group">
                <summary className="font-['JetBrains_Mono'] text-xs text-[#7C8798] hover:text-[#F0B429] cursor-pointer transition-colors list-none flex items-center gap-1">
                  <span className="group-open:rotate-90 transition-transform inline-block">›</span>
                  view query
                </summary>
                <p className="font-['JetBrains_Mono'] text-xs text-[#7C8798] mt-2 break-all pl-3 border-l border-[#232B36]">
                  {sqlUsed}
                </p>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Top Activity leaderboard */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Top Activity</h2>
        <div className="space-y-3">
          {activity.map((a, i) => (
            <div key={a.owner} className="flex items-center gap-3">
              <span className="text-gray-500 text-sm w-5">{i + 1}</span>
              <span className="text-sm w-40 truncate">{a.owner}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bar-fill bg-[#F0B429] h-full rounded-full"
                  style={{ width: `${(a.record_count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-8 text-right">{a.record_count}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Sync History</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Run ID</th>
              <th className="py-2">Status</th>
              <th className="py-2">Records Changed</th>
              <th className="py-2">Started At</th>
            </tr>
          </thead>
          <tbody>
            {syncHistory.map((run) => (
              <tr key={run.id} className="border-b border-gray-800">
                <td className="py-2">{run.id}</td>
                <td className="py-2">{run.status}</td>
                <td className="py-2">{run.records_changed}</td>
                <td className="py-2">{new Date(run.started_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Records ({records.length})</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Title</th>
              <th className="py-2">Status</th>
              <th className="py-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-gray-800">
                <td className="py-2">{record.title}</td>
                <td className="py-2">{record.status}</td>
                <td className="py-2">{record.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}