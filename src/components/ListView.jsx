import React, { useState, useEffect } from 'react'
import { getTimezoneInfo, getTimeDifference } from '../utils/timezoneUtils'
import './ListView.css'

function ListView({ locations }) {
  const [currentTimes, setCurrentTimes] = useState({})
  const sortedLocations = [...locations].sort((a, b) => {
    const dateA = new Date(a.fromDate || a.date)
    const dateB = new Date(b.fromDate || b.date)
    return dateA - dateB
  })

  const formatDateRange = (location) => {
    const fromDate = new Date(location.fromDate || location.date)
    const toDate = location.toDate ? new Date(location.toDate) : null

    if (toDate && location.fromDate !== location.toDate) {
      return `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`
    }
    return fromDate.toLocaleDateString()
  }

  const getDuration = (location) => {
    if (!location.toDate || location.fromDate === location.toDate) {
      return '1 day'
    }
    const from = new Date(location.fromDate)
    const to = new Date(location.toDate)
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1
    return `${days} days`
  }

  // Update times every second for all locations
  useEffect(() => {
    const updateTimes = () => {
      const times = {}
      locations.forEach(location => {
        const timezoneInfo = getTimezoneInfo(
          location.name,
          location.coordinates.lat,
          location.coordinates.lng
        )
        times[location.id] = timezoneInfo
      })
      setCurrentTimes(times)
    }

    // Initial update
    updateTimes()

    // Update every second
    const interval = setInterval(updateTimes, 1000)

    return () => clearInterval(interval)
  }, [locations])

  return (
    <div className="list-view">
      <div className="list-view-header">
        <h3>Travel Schedule ({locations.length} locations)</h3>
      </div>

      <div className="table-container">
        <table className="locations-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Location</th>
              <th>Date Range</th>
              <th>Duration</th>
              <th>Type</th>
              <th>Local Time & Timezone</th>
              <th>Coordinates</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sortedLocations.map((location, index) => (
              <tr key={location.id} className={`location-row ${location.type}`}>
                <td className="row-number">{index + 1}</td>
                <td className="location-name">
                  <strong>{location.name}</strong>
                  {location.country && <div className="country-text">{location.country}</div>}
                </td>
                <td className="date-range">{formatDateRange(location)}</td>
                <td className="duration">{getDuration(location)}</td>
                <td className="type-cell">
                  <span className={`type-badge ${location.type}`}>
                    {location.type === 'actual' ? 'Actual' : 'Planned'}
                  </span>
                </td>
                <td className="timezone-cell">
                  {currentTimes[location.id] ? (
                    <div className="timezone-info">
                      <div className="current-time">{currentTimes[location.id].currentTime}</div>
                      <div className="timezone-name">{currentTimes[location.id].timezone}</div>
                      <div className="timezone-offset">{currentTimes[location.id].offsetString}</div>
                    </div>
                  ) : (
                    <div className="timezone-loading">Loading...</div>
                  )}
                </td>
                <td className="coordinates">
                  {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                </td>
                <td className="notes">{location.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {locations.length === 0 && (
          <div className="empty-list">
            <p>No locations to display</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListView
