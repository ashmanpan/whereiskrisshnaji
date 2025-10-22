import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom marker icons
const plannedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const actualIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function TravelMap({ locations }) {
  // Calculate center point based on locations
  const center = locations.length > 0
    ? [
        locations.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / locations.length,
        locations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / locations.length
      ]
    : [20.5937, 78.9629] // Default to India center

  // Sort locations by date for polyline
  const sortedLocations = [...locations].sort((a, b) => new Date(a.date) - new Date(b.date))
  const routeCoordinates = sortedLocations.map(loc => [loc.coordinates.lat, loc.coordinates.lng])

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: '100%', width: '100%', minHeight: '500px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Draw route line */}
      {routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates}
          color="#666"
          weight={2}
          opacity={0.6}
          dashArray="5, 10"
        />
      )}

      {/* Add markers */}
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={location.type === 'actual' ? actualIcon : plannedIcon}
        >
          <Popup>
            <div>
              <h3>{location.name}</h3>
              <p><strong>Date:</strong> {new Date(location.date).toLocaleDateString()}</p>
              <p><strong>Type:</strong> {location.type === 'actual' ? 'Actual Location' : 'Planned Location'}</p>
              {location.notes && <p><strong>Notes:</strong> {location.notes}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default TravelMap
