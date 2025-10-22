import React from 'react'
import './LocationList.css'

function LocationList({ locations, selectedDate }) {
  if (locations.length === 0) {
    return (
      <div className="location-list">
        <h3>Locations for {selectedDate.toLocaleDateString()}</h3>
        <p className="no-locations">No locations scheduled for this date</p>
      </div>
    )
  }

  return (
    <div className="location-list">
      <h3>Locations for {selectedDate.toLocaleDateString()}</h3>
      {locations.map((location) => (
        <div key={location.id} className={`location-item ${location.type}`}>
          <div className="location-header">
            <h4>{location.name}</h4>
            <span className={`badge ${location.type}`}>
              {location.type === 'actual' ? 'Actual' : 'Planned'}
            </span>
          </div>
          {location.notes && <p className="location-notes">{location.notes}</p>}
          <p className="location-coords">
            Coordinates: {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
          </p>
        </div>
      ))}
    </div>
  )
}

export default LocationList
