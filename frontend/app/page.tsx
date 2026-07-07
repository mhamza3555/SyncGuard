"use client";

import { useEffect, useState } from "react";

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

  const fetchData = async () => {
    setLoading(true);
    const recordsRes = await fetch("http://127.0.0.1:8000/records");
    const recordsData = await recordsRes.json();
    setRecords(recordsData);

    const historyRes = await fetch("http://127.0.0.1:8000/sync-history");
    const historyData = await historyRes.json();
    setSyncHistory(historyData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerSync = async () => {
    setLoading(true);
    await fetch("http://127.0.0.1:8000/sync/octocat/Hello-World", {
      method: "POST",
    });
    await fetchData();
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">SyncGuard Dashboard</h1>

      <button
        onClick={triggerSync}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-8 disabled:opacity-50"
      >
        {loading ? "Syncing..." : "Sync Now"}
      </button>

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