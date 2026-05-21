import { useEffect, useMemo, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface StudentLocation {
  id: string;
  studentId: string;
  name: string;
  lat: number;
  lng: number;
  status?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const clusterOptions = {
  imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
};

export default function LiveMap({
  apiKey,
  center = defaultCenter,
  zoom = 13
}: {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}) {
  const [locations, setLocations] = useState<StudentLocation[]>([]);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  useEffect(() => {
    const locationsQuery = query(collection(db, 'studentLocations'));
    const unsubscribe = onSnapshot(locationsQuery, (snapshot) => {
      const updatedLocations: StudentLocation[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const lat = typeof data.lat === 'number' ? data.lat : 0;
          const lng = typeof data.lng === 'number' ? data.lng : 0;

          return {
            id: doc.id,
            studentId: data.studentId ?? '',
            name: data.name ?? `Student ${data.studentId ?? doc.id}`,
            lat,
            lng,
            status: data.status ?? 'Unknown'
          };
        })
        .filter((location) => Number.isFinite(location.lat) && Number.isFinite(location.lng));

      setLocations(updatedLocations);
    });

    return () => unsubscribe();
  }, []);

  const markers = useMemo(() => locations, [locations]);

  return (
    <div className="relative min-h-[520px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a1628]">
      <LoadScript googleMapsApiKey={apiKey} loadingElement={<div className="h-full w-full" />}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          options={{
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            gestureHandling: 'greedy',
            mapId: undefined
          }}
        >
          <MarkerClusterer options={clusterOptions}>
            {(clusterer) =>
              markers.map((location) => (
                <Marker
                  key={location.id}
                  position={{ lat: location.lat, lng: location.lng }}
                  clusterer={clusterer}
                  onClick={() => setActiveMarker(location.id)}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(36, 36)
                  }}
                />
              ))
            }
          </MarkerClusterer>

          {activeMarker && (
            <InfoWindow
              position={
                markers.find((marker) => marker.id === activeMarker)
                  ? {
                      lat: markers.find((marker) => marker.id === activeMarker)?.lat ?? center.lat,
                      lng: markers.find((marker) => marker.id === activeMarker)?.lng ?? center.lng
                    }
                  : center
              }
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="max-w-xs">
                <h3 className="text-sm font-semibold">{markers.find((marker) => marker.id === activeMarker)?.name}</h3>
                <p className="text-xs text-slate-600 mt-1">ID: {markers.find((marker) => marker.id === activeMarker)?.studentId}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
