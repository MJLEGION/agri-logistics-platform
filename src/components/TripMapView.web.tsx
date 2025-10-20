// Web-only version of TripMapView using Leaflet
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface TripMapViewProps {
  pickupLocation: Location;
  deliveryLocation: Location;
  currentLocation?: Location;
  isTracking?: boolean;
}

const GreenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const BlueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function TripMapView({
  pickupLocation,
  deliveryLocation,
  currentLocation,
  isTracking = false,
}: TripMapViewProps) {
  const { theme } = useTheme();
  const containerRef = useRef<View>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Initialize map only once
      if (!leafletMapRef.current) {
        try {
          const centerLat = (pickupLocation.latitude + deliveryLocation.latitude) / 2;
          const centerLng = (pickupLocation.longitude + deliveryLocation.longitude) / 2;

          const map = L.map(mapContainerRef.current, {
            attributionControl: true,
            zoomControl: true,
          }).setView([centerLat, centerLng], 12);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 2,
          }).addTo(map);

          leafletMapRef.current = map;
          setIsMapReady(true);

          // Prevent map from capturing scroll
          map.scrollWheelZoom.disable();
          mapContainerRef.current!.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              map.scrollWheelZoom.enable();
              setTimeout(() => map.scrollWheelZoom.disable(), 100);
            }
          });
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }

      const map = leafletMapRef.current;
      if (!map) return;

      // Clear previous markers and lines
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });

      // Add markers
      L.marker([pickupLocation.latitude, pickupLocation.longitude], { icon: GreenIcon })
        .bindPopup(`<b>📍 Pickup</b><br/><small>${pickupLocation.address}</small>`)
        .addTo(map);

      L.marker([deliveryLocation.latitude, deliveryLocation.longitude], { icon: RedIcon })
        .bindPopup(`<b>🏁 Delivery</b><br/><small>${deliveryLocation.address}</small>`)
        .addTo(map);

      if (currentLocation && isTracking) {
        L.marker([currentLocation.latitude, currentLocation.longitude], { icon: BlueIcon })
          .bindPopup('<b>🔵 Current Location</b>')
          .addTo(map);
      }

      // Draw route
      const routeCoordinates: [number, number][] = [
        [pickupLocation.latitude, pickupLocation.longitude],
        ...(currentLocation
          ? [[currentLocation.latitude, currentLocation.longitude] as [number, number]]
          : []),
        [deliveryLocation.latitude, deliveryLocation.longitude],
      ];

      L.polyline(routeCoordinates, {
        color: theme.tertiary || '#27AE60',
        weight: 3,
        opacity: 0.8,
        dashArray: isTracking ? undefined : '10, 5',
      }).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds([
        [pickupLocation.latitude, pickupLocation.longitude],
        [deliveryLocation.latitude, deliveryLocation.longitude],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }, 100);

    return () => clearTimeout(timer);
  }, [pickupLocation, deliveryLocation, currentLocation, isTracking, theme.tertiary]);

  return (
    <View ref={containerRef} style={styles.container}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* Info Box */}
      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
          },
        ]}
      >
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>📍 From:</Text>
          <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
            {pickupLocation.address}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>🏁 To:</Text>
          <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
            {deliveryLocation.address}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  infoBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  infoRow: {
    marginVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});