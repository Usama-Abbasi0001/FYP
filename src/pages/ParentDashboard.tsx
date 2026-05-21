import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { Users, MapPin, Shield, AlertCircle, Battery, CheckCircle, Clock, Plus, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ChildData {
  id: string;
  name: string;
  grade?: string;
  deviceStatus?: string;
  location?: string;
  battery?: number;
  todayAlerts?: number;
}

export default function ParentDashboard() {
  const { userData } = useAuth();
  const [linkedChildren, setLinkedChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.parentOf || userData.parentOf.length === 0) {
      setLoading(false);
      setLinkedChildren([]);
      return;
    }

    setLoading(true);
    const unsubscribes: (() => void)[] = [];

    userData.parentOf.forEach((childId) => {
      const childRef = doc(db, 'users', childId);
      const unsub = onSnapshot(childRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setLinkedChildren((prev) => {
            const filtered = prev.filter((c) => c.id !== childId);
            return [
              ...filtered,
              {
                id: childId,
                name: (data as any).name ?? (data as any).fullName ?? 'Unknown',
                grade: (data as any).grade ?? (data as any).class ?? undefined,
                deviceStatus: (data as any).deviceStatus ?? (data as any).status ?? 'Unknown',
                location: 'Loading...',
                battery: typeof (data as any).battery === 'number' ? (data as any).battery : undefined,
                todayAlerts: 0,
              },
            ];
          });
        }
      });
      unsubscribes.push(unsub);
    });

    setTimeout(() => setLoading(false), 500);

    return () => unsubscribes.forEach((u) => u());
  }, [userData?.parentOf]);

  useEffect(() => {
    if (linkedChildren.length > 0 && !selectedChild) {
      setSelectedChild(linkedChildren[0]);
    }
  }, [linkedChildren, selectedChild]);

  const recentActivity = [
    { event: 'Device Connected', location: 'Automatic', time: '2 mins ago', type: 'info' },
    { event: 'Entered Safe Zone', location: 'Main Campus', time: '15 mins ago', type: 'safe' },
    { event: 'Location Updated', location: 'Automatic', time: '1 hour ago', type: 'info' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-white mb-2">Parent Dashboard</h1>
            <p className="text-gray-400">Monitor your children's safety, location, and alerts</p>
          </div>

          {/* Child Selector & Link Button */}
          {loading ? (
            <div className="mb-8 flex items-center justify-center h-20">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : linkedChildren.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center"
            >
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-xl font-semibold text-white mb-2">No Children Linked Yet</h3>
              <p className="text-gray-400 mb-6">Link your child's account to start monitoring their safety.</p>
              <Link
                to="/parent/link-child"
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-400 transition gap-2"
              >
                <Plus className="w-5 h-5" />
                Link Your Child
              </Link>
            </motion.div>
          ) : (
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              {linkedChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all ${
                    selectedChild?.id === child.id
                      ? 'bg-blue-500/20 border-2 border-blue-500/50'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">{child.name?.[0] ?? '?'}</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white">{child.name}</h4>
                    <p className="text-sm text-gray-400">{child.grade ?? 'Grade N/A'}</p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      child.deviceStatus?.toLowerCase() === 'connected' || child.deviceStatus?.toLowerCase() === 'online'
                        ? 'bg-green-400'
                        : 'bg-red-400'
                    } ${
                      child.deviceStatus?.toLowerCase() === 'connected' || child.deviceStatus?.toLowerCase() === 'online'
                        ? 'animate-pulse'
                        : ''
                    }`}
                  />
                </button>
              ))}

              <Link
                to="/parent/link-child"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition text-gray-400 hover:text-white"
              >
                <Plus className="w-5 h-5" />
                <span>Link Child</span>
              </Link>
            </div>
          )}

          {selectedChild && linkedChildren.length > 0 && (
            <>
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link
                  to={`/parent/child/${selectedChild.id}`}
                  className="block rounded-3xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20"
                >
                  <StatCard
                    icon={Shield}
                    label="Safety Status"
                    value="Safe"
                    change={selectedChild.deviceStatus}
                    changeType="positive"
                    color="green"
                  />
                </Link>

                <Link
                  to={`/parent/child/${selectedChild.id}`}
                  className="block rounded-3xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20"
                >
                  <StatCard
                    icon={MapPin}
                    label="Current Location"
                    value={selectedChild.location ?? 'Loading...'}
                    change="Real-time tracking"
                    changeType="positive"
                    color="blue"
                  />
                </Link>

                <Link
                  to={`/parent/child/${selectedChild.id}`}
                  className="block rounded-3xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20"
                >
                  <StatCard
                    icon={Battery}
                    label="Device Battery"
                    value={selectedChild.battery ? `${selectedChild.battery}%` : 'Unknown'}
                    change={
                      selectedChild.battery && selectedChild.battery > 20
                        ? 'Good'
                        : selectedChild.battery && selectedChild.battery <= 20
                        ? 'Low'
                        : 'Unknown'
                    }
                    changeType={selectedChild.battery && selectedChild.battery > 20 ? 'positive' : 'negative'}
                    color={selectedChild.battery && selectedChild.battery > 20 ? 'green' : 'orange'}
                  />
                </Link>

                <Link
                  to={`/parent/child/${selectedChild.id}`}
                  className="block rounded-3xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20"
                >
                  <StatCard
                    icon={AlertCircle}
                    label="Today's Alerts"
                    value={selectedChild.todayAlerts ?? 0}
                    change="All clear"
                    changeType="positive"
                    color="green"
                  />
                </Link>
              </div>

              {/* Quick Access */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link
                  to={`/parent/child/${selectedChild.id}`}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">View Full Profile</h3>
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400">See live location map, movement history, and device status details.</p>
                </Link>

                <Link
                  to={`/parent/child/${selectedChild.id}`}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">View Alerts</h3>
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-sm text-gray-400">Check recent alerts and safety incidents for your child.</p>
                </Link>
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
              >
                <h3 className="text-white mb-6 font-semibold">Recent Activity</h3>

                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.type === 'safe' ? 'bg-green-500/20 border border-green-500/30' : 'bg-blue-500/20 border border-blue-500/30'
                          }`}
                        >
                          {activity.type === 'safe' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white">{activity.event}</h4>
                        <p className="text-sm text-gray-400 mt-1">{activity.location}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
