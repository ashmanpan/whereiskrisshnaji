import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import TravelMap from '../components/TravelMap'
import LocationList from '../components/LocationList'
import ListView from '../components/ListView'
import TimelineView from '../components/TimelineView'
import ChatBot from '../components/ChatBot'
import travelDataInitial from '../data/travelData.json'
import locationService from '../services/locationService'
import '../App.css'

function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [locations, setLocations] = useState([])
  const [viewMode, setViewMode] = useState('map') // 'map', 'list', 'timeline'
  const navigate = useNavigate()

  useEffect(() => {
    // Load locations from API (with localStorage fallback)
    const loadLocations = async () => {
      try {
        const data = await locationService.getAllLocations()
        setLocations(data.length > 0 ? data : travelDataInitial.locations)
      } catch (error) {
        console.error('Error loading locations:', error)
        // Fallback to localStorage
        const savedLocations = localStorage.getItem('travelLocations')
        if (savedLocations) {
          setLocations(JSON.parse(savedLocations))
        } else {
          setLocations(travelDataInitial.locations)
        }
      }
    }

    loadLocations()
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
          <div className="header-actions">
            <a
              href="https://krishnajipanse.com"
              className="portfolio-link-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Portfolio
            </a>
            <button
              className="admin-link-btn"
              onClick={() => navigate('/login')}
            >
              Admin Login
            </button>
          </div>
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
          <div className="view-header">
            <h2>Travel Visualization</h2>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                🗺️ Map
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋 List
              </button>
              <button
                className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                onClick={() => setViewMode('timeline')}
              >
                📊 Timeline
              </button>
            </div>
          </div>

          {viewMode === 'map' && (
            <>
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
            </>
          )}

          {viewMode === 'list' && <ListView locations={locations} />}

          {viewMode === 'timeline' && <TimelineView locations={locations} />}
        </div>
      </div>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  )
}

export default HomePage
