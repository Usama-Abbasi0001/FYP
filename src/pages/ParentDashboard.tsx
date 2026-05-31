import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { Users, MapPin, Shield, Plus, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface ChildData {
  id: string;
  name: string;
  seatNumber?: string;
}

export default function ParentDashboard() {
  const { userData, managedUsers } = useAuth();
  const [linkedChildren, setLinkedChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);

  useEffect(() => {
    if (!userData?.parentOf?.length) {
      setLinkedChildren([]);
      setSelectedChild(null);
      return;
    }

    const children = userData.parentOf
      .map((id) => managedUsers.find((u) => u.id === id))
      .filter((u): u is NonNullable<typeof u> => Boolean(u && u.role === 'student'))
      .map((child) => ({
        id: child.id,
        name: child.name,
        seatNumber: child.seatNumber
      }));

    setLinkedChildren(children);
    setSelectedChild((prev) => (prev && children.some((c) => c.id === prev.id) ? prev : children[0] ?? null));
  }, [userData?.parentOf, managedUsers]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <h1 className="text-white mb-2">Parent Dashboard</h1>
        <p className="text-gray-400 mb-8">Monitor your linked children (local data)</p>

        {linkedChildren.length === 0 ? (
          <motion.div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400 mb-4">No children linked yet.</p>
            <Link
              to="/parent/link-child"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Link Child
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard icon={Users} label="Linked Children" value={linkedChildren.length} change="Local" changeType="positive" color="blue" />
              <StatCard icon={Shield} label="Safety Status" value="Normal" change="Demo mode" changeType="positive" color="green" />
              <StatCard icon={MapPin} label="Tracking" value="Local" change="No GPS sync" changeType="positive" color="purple" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {linkedChildren.map((child) => (
                <Link
                  key={child.id}
                  to={`/parent/child/${child.id}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 hover:border-blue-500/30 transition"
                >
                  <p className="text-white font-medium">{child.name}</p>
                  <p className="text-sm text-gray-400">Seat: {child.seatNumber ?? 'N/A'}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
