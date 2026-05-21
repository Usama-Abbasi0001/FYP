import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { ArrowLeft, MapPin, Clock, Smartphone, Wifi, Bell, Shield, AlertTriangle } from 'lucide-react';
import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

interface StudentData {
  id: string;
  name: string;
  rollNumber?: string;
  grade?: string;
  section?: string;
  guardian?: string;
  phone?: string;
  email?: string;
  deviceId?: string;
  deviceStatus?: string;
  battery?: number;
  lastSeen?: string;
  photoUrl?: string;
}

interface LocationRecord {
  id: string;
  lat: number;
  lng: number;
  location?: string;
  timestamp?: Date;
  status?: string;
}

interface AlertRecord {
  id: string;
  type?: string;
  message?: string;
  severity?: string;
  createdAt?: Date;
  status?: string;
}

const defaultCenter = { lat: 40.7128, lng: -74.0060 };

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [movementHistory, setMovementHistory] = useState<LocationRecord[]>([]);
  const [alertsHistory, setAlertsHistory] = useState<AlertRecord[]>([]);
  const [latestLocation, setLatestLocation] = useState<LocationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    const studentRef = doc(db, 'users', id);
    const unsubStudent = onSnapshot(studentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setStudent({
          id: snapshot.id,
          name: data.name ?? data.fullName ?? 'Unknown Student',
          rollNumber: data.rollNumber ?? data.studentId ?? undefined,
          grade: data.grade ?? data.class ?? undefined,
          section: data.section ?? undefined,
          guardian: data.guardianName ?? data.parentName ?? undefined,
          phone: data.phone ?? data.contactNumber ?? undefined,
          email: data.email ?? undefined,
          deviceId: data.deviceId ?? data.deviceTag ?? undefined,
          deviceStatus: data.deviceStatus ?? data.status ?? 'Unknown',
          battery: typeof data.battery === 'number' ? data.battery : undefined,
          lastSeen: data.lastSeen ?? undefined,
          photoUrl: data.photoUrl ?? data.avatarUrl ?? undefined
        });
      } else {
        setStudent(null);
      }
      setLoading(false);
    });

    const locationsQuery = query(
      collection(db, 'studentLocations'),
      where('studentId', '==', id),
      orderBy('timestamp', 'desc')
    );
    const unsubLocations = onSnapshot(locationsQuery, (snapshot) => {
      const records: LocationRecord[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp ? new Date(data.timestamp) : undefined;
          return {
            id: doc.id,
            lat: Number(data.lat) || 0,
            lng: Number(data.lng) || 0,
            location: data.place ?? data.location ?? 'Unknown location',
            timestamp,
            status: data.status ?? undefined
          };
        })
        .filter((record) => Number.isFinite(record.lat) && Number.isFinite(record.lng));

      setMovementHistory(records.slice(0, 8));
      setLatestLocation(records[0] ?? null);
    });

    const alertsQuery = query(
      collection(db, 'alerts'),
      where('studentId', '==', id),
      orderBy('createdAt', 'desc')
    );
    const unsubAlerts = onSnapshot(alertsQuery, (snapshot) => {
      const records: AlertRecord[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : undefined;
        return {
          id: doc.id,
          type: data.type ?? data.alertType ?? 'Alert',
          message: data.message ?? data.detail ?? 'No details available',
          severity: data.severity ?? 'medium',
          status: data.status ?? 'New',
          createdAt
        };
      });
      setAlertsHistory(records.slice(0, 6));
    });

    return () => {
      unsubStudent();
      unsubLocations();
      unsubAlerts();
    };
  }, [id]);

  const mapCenter = useMemo(() => {
    if (latestLocation) {
      return { lat: latestLocation.lat, lng: latestLocation.lng };
    }
    return defaultCenter;
  }, [latestLocation]);

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <Link
              to="/dashboard/student"
              className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to student dashboard
            </Link>
            <h1 className="mt-4 text-3xl font-semibold text-white">Student Profile</h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              View student details, device health, live location, movement history, and alerts history for the selected student.
            </p>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 p-4 text-sm text-slate-300">
            <div className="font-medium text-slate-100">Profile status</div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="rounded-full bg-slate-900 px-3 py-1">Student ID: {id}</span>
              <span className="rounded-full bg-slate-900 px-3 py-1">
                {student?.deviceStatus ?? 'Device status unavailable'}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
            Loading student profile...
          </div>
        ) : !student ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center text-red-200">
            Student not found. Please verify the student ID or return to the dashboard.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
              <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full bg-slate-800">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} alt={student.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-700 text-3xl font-semibold text-slate-300">
                        {student.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{student.name}</h2>
                    <p className="text-sm text-slate-400">{student.grade ? `${student.grade}${student.section ? ` • Section ${student.section}` : ''}` : 'Grade information unavailable'}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/10">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400">Contact</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-200">
                      <p>{student.email ?? 'Email not available'}</p>
                      <p>{student.phone ?? 'Phone not available'}</p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/10">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400">Guardian</h3>
                    <p className="mt-3 text-sm text-slate-200">{student.guardian ?? 'Guardian details unavailable'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/10">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400">Device</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-200">
                      <p>Device ID: {student.deviceId ?? 'N/A'}</p>
                      <p>Battery: {student.battery != null ? `${student.battery}%` : 'Unknown'}</p>
                      <p>Last Seen: {student.lastSeen ?? 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Live Location</h3>
                    <p className="text-sm text-slate-400">Read-only map view for the latest known location.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                    <MapPin className="w-4 h-4" />
                    {latestLocation ? latestLocation.location : 'Location unavailable'}
                  </div>
                </div>

                <div className="h-[420px] rounded-3xl overflow-hidden border border-white/10 bg-slate-950">
                  {apiKey ? (
                    <LoadScript googleMapsApiKey={apiKey} loadingElement={<div className="h-full w-full" />}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={mapCenter}
                        zoom={14}
                        options={{
                          disableDefaultUI: true,
                          draggable: false,
                          zoomControl: true,
                          scrollwheel: false,
                          gestureHandling: 'greedy'
                        }}
                      >
                        {latestLocation && (
                          <Marker
                            position={{ lat: latestLocation.lat, lng: latestLocation.lng }}
                            icon={{
                              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                              scaledSize: new window.google.maps.Size(36, 36)
                            }}
                          />
                        )}
                      </GoogleMap>
                    </LoadScript>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-950 text-slate-400">
                      Google Maps API key not configured.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Movement History</h3>
                    <p className="text-sm text-slate-400">Recent location updates for this student.</p>
                  </div>
                  <Clock className="w-5 h-5 text-slate-300" />
                </div>

                <div className="space-y-4">
                  {movementHistory.length > 0 ? (
                    movementHistory.map((record) => (
                      <div key={record.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-300">{record.location}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDate(record.timestamp)}</p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              record.status === 'safe'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : record.status === 'warning'
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {record.status ?? 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/70 p-8 text-center text-slate-500">
                      No movement history available yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Device Status</h3>
                    <p className="text-sm text-slate-400">Current device health and connectivity.</p>
                  </div>
                  <Wifi className="w-5 h-5 text-slate-300" />
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl bg-slate-950/70 p-5 border border-white/10">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <p className="mt-2 text-lg font-semibold text-white">{student.deviceStatus}</p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                        {student.deviceId ?? 'No device'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-950/70 p-5 border border-white/10">
                    <p className="text-sm text-slate-400">Battery level</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${student.battery ?? 0}%` }} />
                      </div>
                      <span className="text-sm text-slate-200">{student.battery != null ? `${student.battery}%` : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-950/70 p-5 border border-white/10">
                    <p className="text-sm text-slate-400">Last synced</p>
                    <p className="mt-2 text-lg font-semibold text-white">{student.lastSeen ?? 'Not available'}</p>
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Alerts History</h3>
                  <p className="text-sm text-slate-400">Recent alerts associated with this student.</p>
                </div>
                <Bell className="w-5 h-5 text-slate-300" />
              </div>

              <div className="space-y-4">
                {alertsHistory.length > 0 ? (
                  alertsHistory.map((alert) => (
                    <div key={alert.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-base font-semibold text-white">{alert.type}</h4>
                          <p className="mt-2 text-sm text-slate-400">{alert.message}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            alert.severity === 'high'
                              ? 'bg-red-500/15 text-red-300'
                              : alert.severity === 'medium'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {alert.severity ?? 'Medium'}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                        <span>{formatDate(alert.createdAt)}</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1 text-slate-300">
                          <AlertTriangle className="w-4 h-4" />
                          {alert.status ?? 'New'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/70 p-8 text-center text-slate-500">
                    No alert history available for this student.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
