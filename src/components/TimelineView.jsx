import React, { useMemo } from 'react'
import './TimelineView.css'

function TimelineView({ locations }) {
  const timelineData = useMemo(() => {
    if (locations.length === 0) return { locations: [], minDate: null, maxDate: null, totalDays: 0 }

    const sortedLocations = [...locations].sort((a, b) => {
      const dateA = new Date(a.fromDate || a.date)
      const dateB = new Date(b.fromDate || b.date)
      return dateA - dateB
    })

    const allDates = sortedLocations.flatMap(loc => {
      const from = new Date(loc.fromDate || loc.date)
      const to = loc.toDate ? new Date(loc.toDate) : from
      return [from, to]
    })

    const minDate = new Date(Math.min(...allDates))
    const maxDate = new Date(Math.max(...allDates))
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1

    const processedLocations = sortedLocations.map(loc => {
      const fromDate = new Date(loc.fromDate || loc.date)
      const toDate = loc.toDate ? new Date(loc.toDate) : fromDate

      const startOffset = Math.floor((fromDate - minDate) / (1000 * 60 * 60 * 24))
      const duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1

      return {
        ...loc,
        fromDate,
        toDate,
        startOffset,
        duration,
        startPercent: (startOffset / totalDays) * 100,
        widthPercent: (duration / totalDays) * 100
      }
    })

    return {
      locations: processedLocations,
      minDate,
      maxDate,
      totalDays
    }
  }, [locations])

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (locations.length === 0) {
    return (
      <div className="timeline-view">
        <div className="empty-timeline">
          <p>No locations to display in timeline</p>
        </div>
      </div>
    )
  }

  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <h3>Travel Timeline</h3>
        <div className="timeline-stats">
          <span className="stat">
            <strong>From:</strong> {formatDate(timelineData.minDate)}
          </span>
          <span className="stat">
            <strong>To:</strong> {formatDate(timelineData.maxDate)}
          </span>
          <span className="stat">
            <strong>Total:</strong> {timelineData.totalDays} days
          </span>
        </div>
      </div>

      <div className="gantt-chart">
        <div className="gantt-header">
          <div className="gantt-location-column">Location</div>
          <div className="gantt-timeline-column">
            <div className="timeline-dates">
              {Array.from({ length: Math.min(timelineData.totalDays, 30) }, (_, i) => {
                const date = new Date(timelineData.minDate)
                date.setDate(date.getDate() + Math.floor(i * timelineData.totalDays / Math.min(timelineData.totalDays, 30)))
                return (
                  <div key={i} className="timeline-date-marker">
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="gantt-body">
          {timelineData.locations.map((location) => (
            <div key={location.id} className="gantt-row">
              <div className="gantt-location-column">
                <div className="location-info">
                  <div>
                    <strong>{location.name}</strong>
                    {location.country && <div className="location-country">{location.country}</div>}
                  </div>
                  <span className={`type-indicator ${location.type}`}>
                    {location.type === 'actual' ? '●' : '○'}
                  </span>
                </div>
                <div className="location-dates">
                  {formatDate(location.fromDate)}
                  {location.duration > 1 && ` - ${formatDate(location.toDate)}`}
                </div>
              </div>
              <div className="gantt-timeline-column">
                <div className="timeline-grid">
                  <div
                    className={`timeline-bar ${location.type}`}
                    style={{
                      left: `${location.startPercent}%`,
                      width: `${location.widthPercent}%`
                    }}
                    title={`${location.name}: ${location.duration} day${location.duration > 1 ? 's' : ''}`}
                  >
                    <span className="bar-label">
                      {location.duration}d
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimelineView
