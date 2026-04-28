'use client';
import { useEffect, useRef } from 'react';
import { Shipment } from '@/types';

interface WorldMapProps {
  shipments: Shipment[];
}

declare global {
  interface Window {
    mapboxgl: {
      Map: new (options: MapOptions) => MapInstance;
      Marker: new (options?: MarkerOptions) => MarkerInstance;
      accessToken: string;
      supported: () => boolean;
    };
  }
}

interface MapOptions {
  container: HTMLElement | string;
  style: string;
  center: [number, number];
  zoom: number;
  projection?: string;
}

interface MapInstance {
  on: (event: string, callback: () => void) => void;
  remove: () => void;
  addControl: (control: unknown, position?: string) => void;
}

interface MarkerOptions {
  element?: HTMLElement;
  color?: string;
}

interface MarkerInstance {
  setLngLat: (lngLat: [number, number]) => MarkerInstance;
  addTo: (map: MapInstance) => MarkerInstance;
  setPopup: (popup: unknown) => MarkerInstance;
}

export default function WorldMap({ shipments }: WorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token || !mapContainerRef.current) {
      return;
    }

    const loadMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        (mapboxgl as unknown as { accessToken: string }).accessToken = token;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [20, 20],
          zoom: 1.5,
          projection: 'globe',
        }) as unknown as MapInstance;

        mapRef.current = map;

        map.on('load', () => {
          // Add vessel markers
          shipments.forEach((shipment) => {
            if (shipment.current_lat !== undefined && shipment.current_lng !== undefined) {
              const el = document.createElement('div');
              el.style.cssText = `
                width: 12px; height: 12px; border-radius: 50%;
                background: ${shipment.status === 'DELAYED' ? '#ffd60a' : shipment.status === 'DELIVERED' ? '#00ff41' : '#00d4ff'};
                border: 2px solid white; box-shadow: 0 0 8px currentColor; cursor: pointer;
              `;

              const mb = mapboxgl as unknown as { Marker: new (options: MarkerOptions) => MarkerInstance };
              new mb.Marker({ element: el })
                .setLngLat([shipment.current_lng, shipment.current_lat])
                .addTo(map as unknown as MapInstance);
            }
          });
        });
      } catch (err) {
        console.error('Failed to load Mapbox:', err);
      }
    };

    loadMap();

    return () => {
      mapRef.current?.remove();
    };
  }, [shipments]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    // Placeholder map when no Mapbox token
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)', minHeight: 360 }}
      >
        <div className="text-6xl mb-4">🌍</div>
        <p className="text-text-secondary text-sm">World Map</p>
        <p className="text-text-secondary text-xs mt-1">Add NEXT_PUBLIC_MAPBOX_TOKEN to enable live map</p>
        <div className="mt-6 flex gap-6">
          {shipments.map((s) => (
            s.current_lat !== undefined && (
              <div key={s.id} className="text-center">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{
                    background: s.status === 'DELAYED' ? '#ffd60a' : s.status === 'DELIVERED' ? '#00ff41' : '#00d4ff',
                    boxShadow: `0 0 8px ${s.status === 'DELAYED' ? '#ffd60a' : s.status === 'DELIVERED' ? '#00ff41' : '#00d4ff'}`,
                  }}
                />
                <p className="text-xs text-text-secondary">{s.vessel_name || s.shipment_id_display}</p>
                <p className="text-xs text-text-secondary opacity-60">{s.current_lat?.toFixed(1)}°, {s.current_lng?.toFixed(1)}°</p>
              </div>
            )
          ))}
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: 360 }} />;
}
