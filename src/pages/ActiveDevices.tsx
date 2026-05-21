import { Link } from 'react-router-dom';

export default function ActiveDevices() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
        <h1 className="text-3xl font-semibold text-white mb-4">Active Devices</h1>
        <p className="text-gray-400 mb-6">
          This placeholder shows a detail page for active device tracking and device health.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-900/70 p-5 border border-white/10">
            <h2 className="text-xl text-white mb-3">Device summary</h2>
            <p className="text-gray-400">List all currently connected student devices and their last seen times.</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-5 border border-white/10">
            <h2 className="text-xl text-white mb-3">Health status</h2>
            <p className="text-gray-400">Display battery status, connectivity, and any alerts for each device.</p>
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
