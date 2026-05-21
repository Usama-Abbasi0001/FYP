import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { Users, Shield, AlertTriangle, Activity, MapPin, Bell, TrendingUp, Battery } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AdminDashboard() {
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 1247,
    activeDevices: 1189,
    todayAlerts: 3,
    emergencyCalls: 0
  });

  const weeklyAlerts = [
    { day: 'Mon', alerts: 2 },
    { day: 'Tue', alerts: 4 },
    { day: 'Wed', alerts: 1 },
    { day: 'Thu', alerts: 6 },
    { day: 'Fri', alerts: 3 },
    { day: 'Sat', alerts: 0 },
    { day: 'Sun', alerts: 1 }
  ];

  const deviceStatus = [
    { name: 'Active', value: 1189, color: '#10b981' },
    { name: 'Inactive', value: 45, color: '#6b7280' },
    { name: 'Low Battery', value: 13, color: '#f59e0b' }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'SOS',
      student: 'Sarah Johnson',
      location: 'Library Building',
      time: '2 mins ago',
      status: 'Active',
      severity: 'high'
    },
    {
      id: 2,
      type: 'Fall Detected',
      student: 'Mike Chen',
      location: 'Sports Complex',
      time: '15 mins ago',
      status: 'Resolved',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'Safe Zone Exit',
      student: 'Emma Davis',
      location: 'Campus Gate 3',
      time: '1 hour ago',
      status: 'Acknowledged',
      severity: 'low'
    }
  ];

  useEffect(() => {
    const today = new Date();

    const parseDate = (value: any) => {
      if (!value) return null;
      if (typeof value?.toDate === 'function') return value.toDate();
      return new Date(value);
    };

    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const studentSub = onSnapshot(studentsQuery, (snapshot) => {
      if (snapshot.size > 0) {
        setStats((prev) => ({ ...prev, totalStudents: snapshot.size }));
      }
    });

    const locationsSub = onSnapshot(collection(db, 'studentLocations'), (snapshot) => {
      if (snapshot.size > 0) {
        setStats((prev) => ({ ...prev, activeDevices: snapshot.size }));
      }
    });

    const alertsSub = onSnapshot(collection(db, 'alerts'), (snapshot) => {
      if (snapshot.size > 0) {
        let todayAlerts = 0;
        let emergencyCalls = 0;
        const alerts: any[] = [];

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const createdAt = parseDate(data.createdAt ?? data.timestamp ?? data.time);
          const isToday = createdAt?.toDateString() === today.toDateString();
          if (isToday) todayAlerts += 1;

          const type = String(data.type ?? data.alertType ?? '').toLowerCase();
          const severity = String(data.severity ?? '').toLowerCase();
          if (type.includes('sos') || type.includes('emergency') || severity === 'high') {
            emergencyCalls += 1;
          }

          alerts.push({ id: doc.id, ...data });
        });

        setStats((prev) => ({ ...prev, todayAlerts, emergencyCalls }));
        setLiveAlerts(alerts);
      } else {
        setLiveAlerts(recentAlerts);
      }
    });

    return () => {
      studentSub();
      locationsSub();
      alertsSub();
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'low':
        return 'border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Real-time campus safety monitoring and analytics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link to="/dashboard/admin/students" className="block rounded-3xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20">
              <StatCard
                icon={Users}
                label="Total Students"
                value={stats.totalStudents}
                change="+12 this month"
                changeType="positive"
                color="blue"
              />
            </Link>
            <Link to="/dashboard/admin/devices" className="block rounded-3xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20">
              <StatCard
                icon={Shield}
                label="Active Devices"
                value={stats.activeDevices}
                change={`${Math.round((stats.activeDevices / stats.totalStudents) * 100)}% online`}
                changeType="positive"
                color="green"
              />
            </Link>
            <Link to="/dashboard/admin/alerts" className="block rounded-3xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20">
              <StatCard
                icon={AlertTriangle}
                label="Today's Alerts"
                value={stats.todayAlerts}
                change="-2 from yesterday"
                changeType="positive"
                color="orange"
              />
            </Link>
            <Link to="/dashboard/admin/emergencies" className="block rounded-3xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20">
              <StatCard
                icon={Activity}
                label="Emergency Calls"
                value={stats.emergencyCalls}
                change="All clear"
                changeType="positive"
                color="purple"
              />
            </Link>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Alerts Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-white mb-4">Weekly Alert Trends</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyAlerts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a2f4a',
                      border: '1px solid #ffffff20',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="alerts" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Device Status Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-white mb-4">Device Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deviceStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a2f4a',
                      border: '1px solid #ffffff20',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-white">Recent Alerts</h3>
              <button className="w-full sm:w-auto px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/30">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {liveAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${alert.severity === 'high' ? 'bg-red-500/20' : alert.severity === 'medium' ? 'bg-orange-500/20' : 'bg-yellow-500/20'} flex items-center justify-center border ${alert.severity === 'high' ? 'border-red-500/30' : alert.severity === 'medium' ? 'border-orange-500/30' : 'border-yellow-500/30'}`}>
                      <AlertTriangle className={`w-6 h-6 ${alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-orange-400' : 'text-yellow-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-white">{alert.type}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${alert.status === 'Active' ? 'bg-red-500/20 text-red-400' : alert.status === 'Resolved' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-gray-400">{alert.student}</p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-2 text-sm text-gray-500">
                        <span className="flex flex-1 min-w-0 items-center gap-1 truncate text-gray-300">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{alert.location}</span>
                        </span>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/30">
                      View
                    </button>
                    {alert.status === 'Active' && (
                      <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all border border-green-500/30">
                        Respond
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
