"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchRecords, fetchSyncHistory, triggerSync, getToken, clearToken } from "./lib/api";

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

export default function Dashboard() {
  const [records, setRecords] = useState<Record[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

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
      const [recordsData, historyData] = await Promise.all([
        fetchRecords(),
        fetchSyncHistory(),
      ]);
      setRecords(recordsData);
      setSyncHistory(historyData);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await triggerSync("octocat", "Hello-World");
      await fetchData();
    } catch (err) {
      setLoading(false);
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

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SyncGuard Dashboard</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
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