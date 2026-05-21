import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Users,
  Settings,
  LogOut,
  Shield,
  Bell,
  Activity,
  UserCircle,
  PhoneCall,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userData } = useAuth();

  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const role = userData?.role;

    const commonItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Map, label: 'Live Tracking', path: '/tracking' }
    ];

    const roleSpecificItems = {
      admin: [
        { icon: Users, label: 'User Management', path: '/dashboard/admin' },
        { icon: Activity, label: 'Emergency Monitor', path: '/dashboard/admin' },
        { icon: Shield, label: 'Devices', path: '/dashboard/admin' }
      ],
      student: [
        { icon: PhoneCall, label: 'Emergency Contacts', path: '/dashboard/student' },
        { icon: UserCircle, label: 'Profile', path: '/dashboard/student' }
      ],
      parent: [
        { icon: Users, label: 'My Children', path: '/dashboard/parent' },
        { icon: Activity, label: 'Activity Log', path: '/dashboard/parent' }
      ],
      security: [
        { icon: AlertTriangle, label: 'Emergency Response', path: '/dashboard/admin' },
        { icon: Activity, label: 'Incident Log', path: '/dashboard/admin' }
      ]
    };

    return [...commonItems, ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || [])];
  };

  const navItems = getNavigationItems();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
        onClick={closeSidebar}
      />

      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0a1628]/90 text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 md:hidden"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-xs transform overflow-y-auto bg-[#0a1628] border-r border-white/10 transition-transform duration-300 ease-out md:static md:translate-x-0 md:w-full md:max-w-none md:flex md:flex-col lg:w-72 xl:w-80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-white">Campus Safety</h2>
                <p className="text-xs text-gray-400 capitalize">{userData?.role} Panel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={`${item.path}-${item.label}`}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10">
          <div className="mb-3 p-3 bg-white/5 rounded-lg">
            <p className="text-white truncate">{userData?.name}</p>
            <p className="text-xs text-gray-400 truncate">{userData?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
