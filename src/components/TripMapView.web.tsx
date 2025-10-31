// Web-only version of TripMapView using Leaflet
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { calculateRouteETA, calculateRemainingETA, formatDuration, formatArrivalTime } from '../services/etaService';
import { ensureCoordinates, isValidLocation } from '../services/geocodingService';
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
  speed?: number;
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
  const [etaData, setEtaData] = useState<any>(null);

  // Ensure locations have valid coordinates
  const validPickup = ensureCoordinates(pickupLocation);
  const validDelivery = ensureCoordinates(deliveryLocation);
  const validCurrent = currentLocation ? ensureCoordinates(currentLocation) : null;

  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Initialize map only once
      if (!leafletMapRef.current) {
        try {
          const centerLat = (validPickup.latitude + validDelivery.latitude) / 2;
          const centerLng = (validPickup.longitude + validDelivery.longitude) / 2;

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
      L.marker([validPickup.latitude, validPickup.longitude], { icon: GreenIcon })
        .bindPopup(`<b>📦 Pickup</b><br/><small>${validPickup.address}</small>`)
        .addTo(map);

      L.marker([validDelivery.latitude, validDelivery.longitude], { icon: RedIcon })
        .bindPopup(`<b>🎯 Delivery</b><br/><small>${validDelivery.address}</small>`)
        .addTo(map);

      if (validCurrent && isTracking) {
        L.marker([validCurrent.latitude, validCurrent.longitude], { icon: BlueIcon })
          .bindPopup('<b>📍 Current Location</b>')
          .addTo(map);
      }

      // Draw route
      const routeCoordinates: [number, number][] = [
        [validPickup.latitude, validPickup.longitude],
        ...(validCurrent
          ? [[validCurrent.latitude, validCurrent.longitude] as [number, number]]
          : []),
        [validDelivery.latitude, validDelivery.longitude],
      ];

      L.polyline(routeCoordinates, {
        color: theme.tertiary || '#27AE60',
        weight: 3,
        opacity: 0.8,
        dashArray: isTracking ? undefined : '10, 5',
      }).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds([
        [validPickup.latitude, validPickup.longitude],
        [validDelivery.latitude, validDelivery.longitude],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }, 100);

    return () => clearTimeout(timer);
  }, [validPickup, validDelivery, validCurrent, isTracking, theme.tertiary]);

  // Calculate ETA when locations change
  useEffect(() => {
    if (isTracking && validCurrent) {
      // Calculate remaining ETA from current location to delivery
      const eta = calculateRemainingETA(
        validCurrent.latitude,
        validCurrent.longitude,
        validDelivery.latitude,
        validDelivery.longitude,
        validCurrent.speed || 50
      );
      setEtaData(eta);
    } else {
      // Calculate full route ETA
      const eta = calculateRouteETA({
        from: validPickup,
        to: validDelivery,
        currentLocation: validCurrent,
      });
      setEtaData(eta);
    }
  }, [validPickup, validDelivery, validCurrent, isTracking]);

  return (
    <div ref={containerRef} style={{...styles.container, minHeight: '500px', height: '100%'}}>
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
      <div
        style={{
          ...styles.infoBox,
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        }}
      >
        {/* Route Info */}
        <div style={styles.infoRow}>
          <div style={styles.labelRow}>
            <i className="fas fa-cube" style={{marginRight: '6px', color: theme.textSecondary, fontSize: '12px'}}></i>
            <p style={{...styles.label, color: theme.textSecondary, margin: 0}}>From:</p>
          </div>
          <p style={{...styles.value, color: theme.text}}>
            {validPickup.address}
          </p>
        </div>
        <div style={styles.infoRow}>
          <div style={styles.labelRow}>
            <i className="fas fa-flag" style={{marginRight: '6px', color: theme.textSecondary, fontSize: '12px'}}></i>
            <p style={{...styles.label, color: theme.textSecondary, margin: 0}}>To:</p>
          </div>
          <p style={{...styles.value, color: theme.text}}>
            {validDelivery.address}
          </p>
        </div>

        {/* ETA Section */}
        {etaData && (
          <>
            <div style={{...styles.divider, borderColor: theme.border}} />
            
            {/* ETA Info Row */}
            <div style={styles.etaContainer}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{
                  ...styles.etaIcon,
                  backgroundColor: etaData.trafficInfo.color + '20',
                }}>
                  <span style={{fontSize: '20px'}}>{etaData.trafficInfo.icon}</span>
                </div>
                <div>
                  <p style={{...styles.etaTime, color: etaData.trafficInfo.color}}>
                    🕐 {formatArrivalTime(etaData.arrivalTime)}
                  </p>
                  <p style={{...styles.etaDuration, color: theme.textSecondary}}>
                    {formatDuration(etaData.durationMinutes)} ({etaData.distanceKm} km)
                  </p>
                </div>
              </div>

              {/* Traffic Status */}
              <div style={{
                ...styles.trafficStatus,
                borderColor: etaData.trafficInfo.color,
              }}>
                <p style={{...styles.trafficLevel, color: etaData.trafficInfo.color}}>
                  {etaData.trafficInfo.description}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
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
    maxHeight: '40vh',
    overflowY: 'auto',
  },
  infoRow: {
    marginVertical: 6,
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 0,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: '#e0e0e0',
  },
  etaContainer: {
    marginTop: 8,
  },
  etaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaTime: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  etaDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  trafficStatus: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 3,
    borderRadius: 4,
  },
  trafficLevel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 0,
  },
});