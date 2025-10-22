import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import travelDataInitial from '../data/travelData.json'
import './AdminPanel.css'

function AdminPanel() {
  const { logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'planned',
    date: '',
    lat: '',
    lng: '',
    notes: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Load locations from localStorage or use initial data
    const savedLocations = localStorage.getItem('travelLocations')
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations))
    } else {
      setLocations(travelDataInitial.locations)
    }
  }, [isAuthenticated, navigate])

  const saveLocations = (newLocations) => {
    setLocations(newLocations)
    localStorage.setItem('travelLocations', JSON.stringify(newLocations))
    showMessage('Locations updated successfully!')
  }

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.date || !newLocation.lat || !newLocation.lng) {
      showMessage('Please fill all required fields')
      return
    }

    const location = {
      id: Math.max(0, ...locations.map(l => l.id)) + 1,
      name: newLocation.name,
      type: newLocation.type,
      date: newLocation.date,
      coordinates: {
        lat: parseFloat(newLocation.lat),
        lng: parseFloat(newLocation.lng)
      },
      notes: newLocation.notes
    }

    saveLocations([...locations, location])
    setNewLocation({ name: '', type: 'planned', date: '', lat: '', lng: '', notes: '' })
    setShowAddForm(false)
  }

  const handleDeleteLocation = (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      saveLocations(locations.filter(loc => loc.id !== id))
    }
  }

  const handleUpdateType = (id, newType) => {
    saveLocations(
      locations.map(loc =>
        loc.id === id ? { ...loc, type: newType } : loc
      )
    )
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
        <h1>Admin Panel</h1>
        <div className="admin-actions">
          <button onClick={() => navigate('/')} className="btn-secondary">
            View Site
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
              <div className="form-grid">
                <div className="form-group">
                  <label>City Name *</label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="e.g., Mumbai"
                  />
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
                  <label>Date *</label>
                  <input
                    type="date"
                    value={newLocation.date}
                    onChange={(e) => setNewLocation({ ...newLocation, date: e.target.value })}
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
                  <h3>{location.name}</h3>
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
                    <strong>Date:</strong> {new Date(location.date).toLocaleDateString()}
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
