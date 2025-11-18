import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackingMapViewProps {
  mapRegion: any;
  shippingCenter?: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  destination?: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  routeCoordinates: any[];
  itemName?: string;
}

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const generateWaypoints = (from: any, to: any, steps: number = 5) => {
  if (!from || !to || !from.latitude || !from.longitude || !to.latitude || !to.longitude) {
    return [];
  }

  const waypoints = [from];
  for (let i = 1; i < steps; i++) {
    const progress = i / steps;
    waypoints.push({
      latitude: from.latitude + (to.latitude - from.latitude) * progress,
      longitude: from.longitude + (to.longitude - from.longitude) * progress,
    });
  }
  waypoints.push(to);
  return waypoints;
};

export default function TrackingMapView({
  mapRegion,
  shippingCenter,
  destination,
  routeCoordinates,
  itemName,
}: TrackingMapViewProps) {
  const normalizeCoordinates = (location: any) => {
    if (!location) return null;
    if (location.coordinates) {
      return {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
      };
    }
    if (location.latitude && location.longitude) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }
    return null;
  };

  const startCoord = normalizeCoordinates(shippingCenter);
  const endCoord = normalizeCoordinates(destination);

  const polylineCoordinates = useMemo(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      return routeCoordinates
        .filter((coord) => coord && coord.latitude && coord.longitude)
        .map((coord) => [coord.latitude, coord.longitude]);
    }

    if (startCoord && endCoord) {
      const waypoints = generateWaypoints(startCoord, endCoord, 8);
      return waypoints
        .filter((coord) => coord && coord.latitude && coord.longitude)
        .map((coord) => [coord.latitude, coord.longitude]);
    }

    return [];
  }, [routeCoordinates, startCoord, endCoord]);

  const mapCenter = useMemo(() => {
    if (mapRegion?.latitude && mapRegion?.longitude) {
      return [mapRegion.latitude, mapRegion.longitude];
    }
    if (endCoord) {
      return [endCoord.latitude, endCoord.longitude];
    }
    if (startCoord) {
      return [startCoord.latitude, startCoord.longitude];
    }
    return [-1.9441, 30.0619];
  }, [mapRegion, startCoord, endCoord]);

  const mapZoom = 12;

  return (
    <div style={styles.container}>
      <MapContainer
        center={mapCenter as [number, number]}
        zoom={mapZoom}
        style={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polylineCoordinates.length > 0 && (
          <Polyline
            positions={polylineCoordinates}
            color="#10797D"
            weight={4}
            opacity={0.9}
            dashArray="5, 5"
          />
        )}

        {startCoord && (
          <Marker
            position={[startCoord.latitude, startCoord.longitude]}
            icon={greenIcon}
          >
            <Popup>
              <div style={styles.popupContent}>
                <strong>Shipping Center (Start)</strong>
                <p>{shippingCenter?.address || 'Origin'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {polylineCoordinates.length > 2 &&
          polylineCoordinates.slice(1, -1).map((coord: [number, number], idx: number) => (
            <Marker
              key={`waypoint-${idx}`}
              position={coord}
              icon={orangeIcon}
            >
              <Popup>
                <div style={styles.popupContent}>
                  <strong>Route Waypoint {idx + 1}</strong>
                  <p>Progress along route</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {endCoord && (
          <Marker
            position={[endCoord.latitude, endCoord.longitude]}
            icon={redIcon}
          >
            <Popup>
              <div style={styles.popupContent}>
                <strong>Destination (End)</strong>
                <p>{destination?.address || 'Destination'}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div style={styles.legend}>
        <h3 style={styles.legendTitle}>{itemName || 'Shipment Route'}</h3>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendMarker, backgroundColor: '#28a745' }}></div>
          <span>Start Point</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendMarker, backgroundColor: '#fd7e14' }}></div>
          <span>Route Waypoints</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendMarker, backgroundColor: '#dc3545' }}></div>
          <span>Destination</span>
        </div>
        <div style={styles.legendItem}>
          <div
            style={{
              ...styles.legendMarker,
              height: '2px',
              borderTop: '2px dashed #10797D',
            }}
          ></div>
          <span>Route Path</span>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
  },
  popupContent: {
    padding: '8px',
    textAlign: 'left',
    fontSize: '12px',
  },
  legend: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    fontSize: '12px',
    zIndex: 1000,
  },
  legendTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px',
  },
  legendMarker: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
  },
};
