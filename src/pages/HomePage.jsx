import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import TravelMap from '../components/TravelMap'
import LocationList from '../components/LocationList'
import travelDataInitial from '../data/travelData.json'
import '../App.css'

function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [locations, setLocations] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Load locations from localStorage or use initial data
    const savedLocations = localStorage.getItem('travelLocations')
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations))
    } else {
      setLocations(travelDataInitial.locations)
    }
  }, [])

  const getLocationsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return locations.filter(loc => loc.date === dateStr)
  }

  const getTileClassName = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayLocations = locations.filter(loc => loc.date === dateStr)

    if (dayLocations.length === 0) return null

    const hasPlanned = dayLocations.some(loc => loc.type === 'planned')
    const hasActual = dayLocations.some(loc => loc.type === 'actual')

    if (hasActual) return 'actual-location'
    if (hasPlanned) return 'planned-location'
    return null
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Where is Krishnaji?</h1>
          <button
            className="admin-link-btn"
            onClick={() => navigate('/login')}
          >
            Admin Login
          </button>
        </div>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color planned"></span>
            <span>Planned Location</span>
          </div>
          <div className="legend-item">
            <span className="legend-color actual"></span>
            <span>Actual Location</span>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="calendar-section">
          <h2>Travel Calendar</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={getTileClassName}
          />
          <LocationList
            locations={getLocationsForDate(selectedDate)}
            selectedDate={selectedDate}
          />
        </div>

        <div className="map-section">
          <h2>Travel Map</h2>
          <p className="map-info">
            {getLocationsForDate(selectedDate).length > 0
              ? `Showing locations for ${selectedDate.toLocaleDateString()}`
              : 'Showing all locations'}
          </p>
          <TravelMap
            locations={
              getLocationsForDate(selectedDate).length > 0
                ? getLocationsForDate(selectedDate)
                : locations
            }
          />
        </div>
      </div>
    </div>
  )
}

export default HomePage
