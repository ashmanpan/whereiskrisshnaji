// Location Service - Handles all DynamoDB operations via API Gateway
import { API_ENDPOINT } from '../config/api.js';

class LocationService {
  // Get all locations
  async getAllLocations() {
    try {
      const response = await fetch(`${API_ENDPOINT}/locations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const locations = await response.json();

      // Cache in localStorage as backup
      localStorage.setItem('travelLocations', JSON.stringify(locations));

      return locations;
    } catch (error) {
      console.error("Error fetching locations from API:", error);
      // Fallback to localStorage if API fails
      const savedLocations = localStorage.getItem('travelLocations');
      if (savedLocations) {
        return JSON.parse(savedLocations);
      }
      return [];
    }
  }

  // Add new location
  async addLocation(location) {
    try {
      const response = await fetch(`${API_ENDPOINT}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(location)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const item = await response.json();

      // Update localStorage cache
      const allLocations = await this.getAllLocations();
      localStorage.setItem('travelLocations', JSON.stringify(allLocations));

      return item;
    } catch (error) {
      console.error("Error adding location:", error);
      throw error;
    }
  }

  // Update location
  async updateLocation(id, updates) {
    try {
      const response = await fetch(`${API_ENDPOINT}/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedLocation = await response.json();

      // Update localStorage cache
      const allLocations = await this.getAllLocations();
      localStorage.setItem('travelLocations', JSON.stringify(allLocations));

      return updatedLocation;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  }

  // Delete location
  async deleteLocation(id) {
    try {
      const response = await fetch(`${API_ENDPOINT}/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update localStorage cache
      const allLocations = await this.getAllLocations();
      localStorage.setItem('travelLocations', JSON.stringify(allLocations));

      return true;
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  }

  // Sync localStorage to DynamoDB (for migration)
  async syncFromLocalStorage() {
    try {
      const savedLocations = localStorage.getItem('travelLocations');
      if (!savedLocations) {
        console.log("No localStorage data to sync");
        return { success: false, message: "No localStorage data to sync" };
      }

      const locations = JSON.parse(savedLocations);
      console.log(`Syncing ${locations.length} locations to DynamoDB...`);

      let synced = 0;
      let failed = 0;

      for (const location of locations) {
        try {
          await this.addLocation(location);
          synced++;
        } catch (error) {
          console.error(`Failed to sync location ${location.name}:`, error);
          failed++;
        }
      }

      console.log(`✓ Sync complete! ${synced} synced, ${failed} failed`);
      return { success: true, synced, failed, total: locations.length };
    } catch (error) {
      console.error("Error syncing to DynamoDB:", error);
      throw error;
    }
  }
}

export default new LocationService();
