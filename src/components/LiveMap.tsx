import { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export interface StudentLocation {
  id: string;
  studentId: string;
  name: string;
  lat: number;
  lng: number;
}

const mapContainerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 31.5204, lng: 74.3587 };

export default function LiveMap() {
  const [locations] = useState<StudentLocation[]>([]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-gray-400 text-sm mb-4">
        Live map (local mode — no GPS data synced)
      </p>
      {locations.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg bg-[#0a1628] text-gray-500">
          No live locations in local memory
        </div>
      ) : (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''}>
          <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={14}>
            {locations.map((loc) => (
              <Marker key={loc.id} position={{ lat: loc.lat, lng: loc.lng }} title={loc.name} />
            ))}
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
}
