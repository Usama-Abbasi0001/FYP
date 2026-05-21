import Sidebar from '../components/Sidebar';
import LiveMap from '../components/LiveMap';

export default function LiveTracking() {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Live Tracking Dashboard</h1>
              <p className="text-gray-400 mt-2">View all students on the live map with real-time location updates.</p>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="h-[620px] lg:h-[720px]">
              <LiveMap apiKey={GOOGLE_MAPS_API_KEY} />
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
                <h2 className="text-lg font-semibold text-white mb-4">Live Map Overview</h2>
                <p className="text-gray-400 leading-relaxed">
                  Markers are populated from Firebase in real time. Click any marker to view the student name and details.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
                <h2 className="text-lg font-semibold text-white mb-4">Status Analytics</h2>
                <div className="space-y-3 text-gray-400 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Total students</span>
                    <span className="font-semibold text-white">--</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Live markers</span>
                    <span className="font-semibold text-white">--</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active feeds</span>
                    <span className="font-semibold text-white">--</span>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
