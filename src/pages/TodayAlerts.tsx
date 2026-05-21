import { Link } from 'react-router-dom';

export default function TodayAlerts() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
        <h1 className="text-3xl font-semibold text-white mb-4">Today's Alerts</h1>
        <p className="text-gray-400 mb-6">
          This is a placeholder page for today's alert details, incident summaries, and response history.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-900/70 p-5 border border-white/10">
            <h2 className="text-xl text-white mb-3">Recent alerts</h2>
            <p className="text-gray-400">Show today's alerts with location, severity, and assigned response teams.</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-5 border border-white/10">
            <h2 className="text-xl text-white mb-3">Alert analytics</h2>
            <p className="text-gray-400">Visualize alert counts, categories, and time distribution for the current day.</p>
          </div>
        </div>
        <div className="mt-8 text-right">
          <Link
            to="/dashboard/admin"
            className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
          >
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
