import { DateTime } from 'luxon';

// Map of major cities to their timezones (fallback if API fails)
const cityTimezones = {
  'Mumbai': 'Asia/Kolkata',
  'Delhi': 'Asia/Kolkata',
  'Bangalore': 'Asia/Kolkata',
  'Bengaluru': 'Asia/Kolkata',
  'Chennai': 'Asia/Kolkata',
  'Kolkata': 'Asia/Kolkata',
  'Hyderabad': 'Asia/Kolkata',
  'Pune': 'Asia/Kolkata',
  'Ahmedabad': 'Asia/Kolkata',
  'Jaipur': 'Asia/Kolkata',
  'Surat': 'Asia/Kolkata',
  'Lucknow': 'Asia/Kolkata',
  'New York': 'America/New_York',
  'Los Angeles': 'America/Los_Angeles',
  'Chicago': 'America/Chicago',
  'London': 'Europe/London',
  'Paris': 'Europe/Paris',
  'Tokyo': 'Asia/Tokyo',
  'Singapore': 'Asia/Singapore',
  'Dubai': 'Asia/Dubai',
  'Sydney': 'Australia/Sydney',
  'Beijing': 'Asia/Shanghai',
  'Hong Kong': 'Asia/Hong_Kong',
  'Toronto': 'America/Toronto',
  'San Francisco': 'America/Los_Angeles',
  'Berlin': 'Europe/Berlin',
  'Amsterdam': 'Europe/Amsterdam',
  'Bangkok': 'Asia/Bangkok',
  'Kuala Lumpur': 'Asia/Kuala_Lumpur',
  'Jakarta': 'Asia/Jakarta',
  'Manila': 'Asia/Manila',
  'Seoul': 'Asia/Seoul'
};

// Simplified timezone detection based on coordinates
// This is a rough approximation - in production, you'd use a geocoding API
function getTimezoneFromCoordinates(lat, lng) {
  // Simple longitude-based timezone approximation
  // Each 15 degrees of longitude ≈ 1 hour time difference from UTC
  const hoursFromUTC = Math.round(lng / 15);

  // Special cases for regions
  if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) {
    return 'Asia/Kolkata'; // India
  } else if (lat >= 22 && lat <= 54 && lng >= 73 && lng <= 135) {
    return 'Asia/Shanghai'; // China
  } else if (lat >= 24 && lat <= 46 && lng >= -125 && lng <= -66) {
    if (lng >= -125 && lng < -104) return 'America/Los_Angeles'; // Pacific
    if (lng >= -104 && lng < -87) return 'America/Denver'; // Mountain
    if (lng >= -87 && lng < -84) return 'America/Chicago'; // Central
    return 'America/New_York'; // Eastern
  } else if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) {
    return 'Europe/London'; // Europe (simplified)
  } else if (lat >= -44 && lat <= -10 && lng >= 112 && lng <= 154) {
    return 'Australia/Sydney'; // Australia
  } else if (lat >= 24 && lat <= 46 && lng >= 122 && lng <= 146) {
    return 'Asia/Tokyo'; // Japan
  } else if (lat >= 1 && lat <= 1.5 && lng >= 103 && lng <= 104) {
    return 'Asia/Singapore'; // Singapore
  } else if (lat >= 22 && lat <= 26 && lng >= 54 && lng <= 56) {
    return 'Asia/Dubai'; // UAE
  }

  // Fallback to UTC offset approximation
  if (hoursFromUTC >= 0) {
    return `Etc/GMT-${hoursFromUTC}`;
  } else {
    return `Etc/GMT+${Math.abs(hoursFromUTC)}`;
  }
}

/**
 * Get timezone information for a location
 * @param {string} cityName - Name of the city
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {object} - Timezone info with timezone name, current time, and offset
 */
export function getTimezoneInfo(cityName, lat, lng) {
  try {
    // Try to get timezone from city name first
    let timezoneName = cityTimezones[cityName] || getTimezoneFromCoordinates(lat, lng);

    // Get current time in that timezone
    const now = DateTime.now().setZone(timezoneName);

    // Get offset from UTC
    const offset = now.offsetNameShort;
    const offsetHours = now.offset / 60;
    const offsetString = offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`;

    return {
      timezone: timezoneName.replace('_', ' ').split('/').pop(), // Simplified name
      fullTimezone: timezoneName,
      currentTime: now.toFormat('HH:mm:ss'),
      currentDate: now.toFormat('MMM dd, yyyy'),
      offset: offset,
      offsetString: `UTC${offsetString}`,
      isDST: now.isInDST
    };
  } catch (error) {
    console.error('Error getting timezone:', error);
    return {
      timezone: 'Unknown',
      fullTimezone: 'UTC',
      currentTime: DateTime.now().toFormat('HH:mm:ss'),
      currentDate: DateTime.now().toFormat('MMM dd, yyyy'),
      offset: 'UTC',
      offsetString: 'UTC+0',
      isDST: false
    };
  }
}

/**
 * Get time difference from user's local timezone
 * @param {string} timezone - Target timezone
 * @returns {string} - Time difference description
 */
export function getTimeDifference(timezone) {
  try {
    const localTime = DateTime.now();
    const targetTime = DateTime.now().setZone(timezone);

    const diffMinutes = (targetTime.offset - localTime.offset) / 60;
    const diffHours = Math.abs(diffMinutes);

    if (diffMinutes === 0) {
      return 'Same as your timezone';
    }

    const ahead = diffMinutes > 0;
    return `${diffHours}h ${ahead ? 'ahead' : 'behind'} your time`;
  } catch (error) {
    return 'N/A';
  }
}
