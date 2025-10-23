import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import travelDataInitial from '../data/travelData.json'
import locationService from '../services/locationService'
import './AdminPanel.css'

function AdminPanel() {
  const { logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [newLocation, setNewLocation] = useState({
    name: '',
    country: '',
    type: 'planned',
    fromDate: '',
    toDate: '',
    lat: '',
    lng: '',
    notes: ''
  })
  const [recentCities, setRecentCities] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [message, setMessage] = useState('')
  const [fetchingCoords, setFetchingCoords] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Load locations from API (with localStorage fallback)
    loadLocations()

    // Load recent cities
    const savedRecent = localStorage.getItem('recentCities')
    if (savedRecent) {
      setRecentCities(JSON.parse(savedRecent))
    }
  }, [isAuthenticated, navigate])

  const loadLocations = async () => {
    setLoading(true)
    try {
      const data = await locationService.getAllLocations()
      setLocations(data.length > 0 ? data : travelDataInitial.locations)
    } catch (error) {
      console.error('Error loading locations:', error)
      showMessage('Error loading locations from cloud. Using local data.')
      // Fallback to localStorage
      const savedLocations = localStorage.getItem('travelLocations')
      if (savedLocations) {
        setLocations(JSON.parse(savedLocations))
      } else {
        setLocations(travelDataInitial.locations)
      }
    } finally {
      setLoading(false)
    }
  }

  const saveLocations = (newLocations) => {
    setLocations(newLocations)
    localStorage.setItem('travelLocations', JSON.stringify(newLocations))
    showMessage('Locations updated successfully!')
  }

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const fetchCoordinates = async () => {
    if (!newLocation.name) {
      showMessage('Please enter a city name first')
      return
    }

    setFetchingCoords(true)
    try {
      // Using Nominatim (OpenStreetMap) API - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newLocation.name)}&format=json&limit=1&addressdetails=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const country = result.address?.country || ''

        setNewLocation({
          ...newLocation,
          lat: parseFloat(result.lat).toFixed(4),
          lng: parseFloat(result.lon).toFixed(4),
          country: country
        })
        showMessage(`Found: ${newLocation.name}, ${country}`)
      } else {
        showMessage('Could not find coordinates. Please enter manually.')
      }
    } catch (error) {
      showMessage('Error fetching coordinates. Please enter manually.')
      console.error('Error fetching coordinates:', error)
    } finally {
      setFetchingCoords(false)
    }
  }

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.fromDate || !newLocation.lat || !newLocation.lng) {
      showMessage('Please fill all required fields')
      return
    }

    const location = {
      name: newLocation.name,
      country: newLocation.country,
      type: newLocation.type,
      date: newLocation.fromDate, // Keep for backward compatibility
      fromDate: newLocation.fromDate,
      toDate: newLocation.toDate || newLocation.fromDate, // If no end date, use start date
      latitude: parseFloat(newLocation.lat),
      longitude: parseFloat(newLocation.lng),
      notes: newLocation.notes
    }

    try {
      setLoading(true)
      await locationService.addLocation(location)
      await loadLocations() // Reload from API
      showMessage('Location added successfully!')

      // Update recent cities
      const cityEntry = `${newLocation.name}${newLocation.country ? ', ' + newLocation.country : ''}`
      const updatedRecent = [cityEntry, ...recentCities.filter(c => c !== cityEntry)].slice(0, 10)
      setRecentCities(updatedRecent)
      localStorage.setItem('recentCities', JSON.stringify(updatedRecent))

      setNewLocation({ name: '', country: '', type: 'planned', fromDate: '', toDate: '', lat: '', lng: '', notes: '' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding location:', error)
      showMessage('Error adding location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        setLoading(true)
        await locationService.deleteLocation(id)
        await loadLocations() // Reload from API
        showMessage('Location deleted successfully!')
      } catch (error) {
        console.error('Error deleting location:', error)
        showMessage('Error deleting location. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUpdateType = async (id, newType) => {
    try {
      setLoading(true)
      await locationService.updateLocation(id, { type: newType })
      await loadLocations() // Reload from API
      showMessage('Location updated successfully!')
    } catch (error) {
      console.error('Error updating location:', error)
      showMessage('Error updating location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncToCloud = async () => {
    if (!window.confirm('This will sync all localStorage data to the cloud. Continue?')) {
      return
    }

    try {
      setSyncing(true)
      const result = await locationService.syncFromLocalStorage()
      if (result.success) {
        await loadLocations() // Reload from API
        showMessage(`Sync complete! ${result.synced} locations synced, ${result.failed} failed.`)
      } else {
        showMessage(result.message || 'No data to sync')
      }
    } catch (error) {
      console.error('Error syncing to cloud:', error)
      showMessage('Error syncing to cloud. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const downloadData = () => {
    const dataStr = JSON.stringify({ locations }, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'travelData.json'
    link.click()
    showMessage('Data downloaded successfully!')
  }

  const sortedLocations = [...locations].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel {loading && <span className="loading-indicator">Loading...</span>}</h1>
        <div className="admin-actions">
          <button onClick={() => navigate('/')} className="btn-secondary">
            View Site
          </button>
          <button onClick={handleSyncToCloud} className="btn-sync" disabled={syncing || loading}>
            {syncing ? 'Syncing...' : '☁️ Sync to Cloud'}
          </button>
          <button onClick={downloadData} className="btn-secondary">
            Download Data
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}

      <div className="admin-content">
        <div className="section">
          <div className="section-header">
            <h2>Travel Locations ({locations.length})</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary"
            >
              {showAddForm ? 'Cancel' : '+ Add Location'}
            </button>
          </div>

          {showAddForm && (
            <div className="add-form">
              <h3>Add New Location</h3>

              {recentCities.length > 0 && (
                <div className="recent-cities">
                  <label>Recent Cities (click to use):</label>
                  <div className="recent-cities-list">
                    {recentCities.map((city, index) => (
                      <button
                        key={index}
                        type="button"
                        className="recent-city-btn"
                        onClick={() => {
                          const [cityName, country] = city.split(', ')
                          setNewLocation({ ...newLocation, name: cityName, country: country || '' })
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>City Name *</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      placeholder="e.g., Mumbai, India"
                      list="city-suggestions"
                    />
                    <button
                      type="button"
                      onClick={fetchCoordinates}
                      className="btn-fetch-coords"
                      disabled={fetchingCoords || !newLocation.name}
                    >
                      {fetchingCoords ? 'Fetching...' : 'Get Coordinates'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={newLocation.type}
                    onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                  >
                    <option value="planned">Planned</option>
                    <option value="actual">Actual</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>From Date *</label>
                  <input
                    type="date"
                    value={newLocation.fromDate}
                    onChange={(e) => setNewLocation({ ...newLocation, fromDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>To Date (optional)</label>
                  <input
                    type="date"
                    value={newLocation.toDate}
                    onChange={(e) => setNewLocation({ ...newLocation, toDate: e.target.value })}
                    min={newLocation.fromDate}
                  />
                </div>

                <div className="form-group">
                  <label>Latitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLocation.lat}
                    onChange={(e) => setNewLocation({ ...newLocation, lat: e.target.value })}
                    placeholder="e.g., 19.0760"
                  />
                </div>

                <div className="form-group">
                  <label>Longitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLocation.lng}
                    onChange={(e) => setNewLocation({ ...newLocation, lng: e.target.value })}
                    placeholder="e.g., 72.8777"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <input
                    type="text"
                    value={newLocation.notes}
                    onChange={(e) => setNewLocation({ ...newLocation, notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <button onClick={handleAddLocation} className="btn-primary">
                Add Location
              </button>

              <p className="help-text">
                Tip: Find coordinates at{' '}
                <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer">
                  latlong.net
                </a>
              </p>
            </div>
          )}

          <div className="locations-list">
            {sortedLocations.map((location) => (
              <div key={location.id} className={`location-card ${location.type}`}>
                <div className="location-card-header">
                  <h3>
                    {location.name}
                    {location.country && <span className="country-badge">{location.country}</span>}
                  </h3>
                  <div className="location-actions">
                    <select
                      value={location.type}
                      onChange={(e) => handleUpdateType(location.id, e.target.value)}
                      className={`type-select ${location.type}`}
                    >
                      <option value="planned">Planned</option>
                      <option value="actual">Actual</option>
                    </select>
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="location-details">
                  <div className="detail-item">
                    <strong>Date:</strong>{' '}
                    {location.fromDate && location.toDate && location.fromDate !== location.toDate
                      ? `${new Date(location.fromDate).toLocaleDateString()} - ${new Date(location.toDate).toLocaleDateString()}`
                      : new Date(location.date || location.fromDate).toLocaleDateString()}
                  </div>
                  <div className="detail-item">
                    <strong>Coordinates:</strong> {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                  </div>
                  {location.notes && (
                    <div className="detail-item">
                      <strong>Notes:</strong> {location.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {locations.length === 0 && (
              <div className="empty-state">
                <p>No locations added yet. Click "Add Location" to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
