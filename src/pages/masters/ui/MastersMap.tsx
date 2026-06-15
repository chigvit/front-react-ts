'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface MastersMapProps {
  masters: any[]
  userLocation: { latitude: number; longitude: number } | null
  radius: number
}

function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export const MastersMap = ({ masters, userLocation, radius }: MastersMapProps) => {
  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [53.8008, -1.5491]

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SetView center={center} zoom={12} />

      {userLocation && (
        <>
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>Your location</Popup>
          </Marker>
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={radius * 1000}
            pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.1 }}
          />
        </>
      )}

      {masters.map((master, index) => {
        if (!master.latitude || !master.longitude) return null
        return (
          <Marker
            key={`marker-${master.user_id || index}`}
            position={[master.latitude, master.longitude]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{master.first_name} {master.last_name}</p>
                {master.rating > 0 && (
                  <p className="text-yellow-500">⭐ {master.rating} ({master.reviews_count})</p>
                )}
                {master.distance_meters > 0 && (
                  <p className="text-gray-500">{(master.distance_meters / 1000).toFixed(1)} km away</p>
                )}
                <Link
                  href={`/masters/${master.user_id}`}
                  className="text-orange-500 hover:underline"
                >
                  View profile →
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
