// Lambda function for locations CRUD operations
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "whereiskrishnaji-locations";

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Admin-Request",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  };

  // App authentication secret (set via Lambda environment variable)
  const APP_SECRET = process.env.APP_SECRET || "krishnaji-app-secret-2025";

  // Helper to verify app authentication
  const verifyAppAuth = (event) => {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    return authHeader === `Bearer ${APP_SECRET}`;
  };

  // Extract method and path from either HTTP API v2.0 or REST API format
  const method = event.requestContext?.http?.method || event.httpMethod;
  const rawPath = event.requestContext?.http?.path || event.path || "";

  // Remove /prod prefix if present
  const path = rawPath.replace(/^\/prod/, "") || "/";

  console.log("Parsed method:", method, "path:", path);

  // Handle OPTIONS request for CORS
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {

    // GET /status - Get privacy/PTO status for app
    if (method === "GET" && path === "/status") {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "#source = :source",
        ExpressionAttributeNames: { "#source": "source" },
        ExpressionAttributeValues: { ":source": "app" }
      });
      const response = await docClient.send(command);

      // Get most recent app location
      const appLocations = response.Items || [];
      const latestAppLocation = appLocations.sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )[0];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          privacyEnabled: latestAppLocation?.privacyEnabled || false,
          ptoMode: latestAppLocation?.ptoMode || false,
          lastUpdate: latestAppLocation?.updatedAt || null,
          lastLocation: latestAppLocation ? {
            name: latestAppLocation.name,
            coordinates: latestAppLocation.coordinates
          } : null
        })
      };
    }

    // GET /locations - Get all locations
    if (method === "GET" && path === "/locations") {
      // Check if request is from admin
      const isAdmin = event.headers?.['x-admin-request'] === 'true';

      const command = new ScanCommand({
        TableName: TABLE_NAME
      });
      const response = await docClient.send(command);

      let locations = response.Items || [];

      // If not admin, filter out private and PTO locations
      if (!isAdmin) {
        // Check if PTO mode is active (from any app-sourced location)
        const appLocations = locations.filter(loc => loc.source === 'app');
        const ptoActive = appLocations.some(loc => loc.ptoMode === true);

        if (ptoActive) {
          // Hide all app-sourced locations when PTO is active
          locations = locations.filter(loc => loc.source !== 'app');
        } else {
          // Filter out individual private locations
          locations = locations.filter(loc => !loc.privacyEnabled);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(locations)
      };
    }

    // POST /app-location - Mobile app location update (authenticated)
    if (method === "POST" && path === "/app-location") {
      // Verify app authentication
      if (!verifyAppAuth(event)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "Unauthorized" })
        };
      }

      const body = JSON.parse(event.body);
      const today = new Date().toISOString().split('T')[0];

      const item = {
        id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: body.locationName || "Current Location",
        country: body.country || "",
        type: "actual",
        source: "app",
        date: today,
        fromDate: today,
        toDate: today,
        coordinates: {
          lat: body.latitude,
          lng: body.longitude
        },
        accuracy: body.accuracy || null,
        batteryLevel: body.batteryLevel || null,
        privacyEnabled: body.privacyEnabled || false,
        ptoMode: body.ptoMode || false,
        notes: "Auto-updated from mobile app",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      });
      await docClient.send(command);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(item)
      };
    }

    // PUT /privacy - Update privacy settings (authenticated)
    if (method === "PUT" && path === "/privacy") {
      // Verify app authentication
      if (!verifyAppAuth(event)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "Unauthorized" })
        };
      }

      const body = JSON.parse(event.body);

      // Get all app-sourced locations
      const scanCommand = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "#source = :source",
        ExpressionAttributeNames: { "#source": "source" },
        ExpressionAttributeValues: { ":source": "app" }
      });
      const scanResult = await docClient.send(scanCommand);

      // Update privacy settings on all app locations
      for (const item of scanResult.Items || []) {
        const updateCommand = new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: item.id },
          UpdateExpression: "SET privacyEnabled = :privacy, ptoMode = :pto, updatedAt = :now",
          ExpressionAttributeValues: {
            ":privacy": body.privacyEnabled !== undefined ? body.privacyEnabled : item.privacyEnabled,
            ":pto": body.ptoMode !== undefined ? body.ptoMode : item.ptoMode,
            ":now": new Date().toISOString()
          }
        });
        await docClient.send(updateCommand);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "Privacy settings updated",
          privacyEnabled: body.privacyEnabled,
          ptoMode: body.ptoMode
        })
      };
    }

    // POST /locations - Add new location
    if (method === "POST" && path === "/locations") {
      const body = JSON.parse(event.body);

      // Transform latitude/longitude to coordinates object if needed
      const item = {
        ...body,
        id: body.id || `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        coordinates: body.coordinates || {
          lat: body.latitude || body.lat || 0,
          lng: body.longitude || body.lng || 0
        },
        source: "manual",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Remove separate lat/lng fields if they exist
      delete item.latitude;
      delete item.longitude;
      delete item.lat;
      delete item.lng;

      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      });
      await docClient.send(command);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(item)
      };
    }

    // PUT /locations/{id} - Update location
    if (method === "PUT" && path.startsWith("/locations/")) {
      const id = path.split("/")[2];
      const body = JSON.parse(event.body);

      const updateExpression = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      Object.keys(body).forEach((key, index) => {
        if (key !== "id") {
          const attrName = `#attr${index}`;
          const attrValue = `:val${index}`;
          updateExpression.push(`${attrName} = ${attrValue}`);
          expressionAttributeNames[attrName] = key;
          expressionAttributeValues[attrValue] = body[key];
        }
      });

      // Add updatedAt
      updateExpression.push(`#updatedAt = :updatedAt`);
      expressionAttributeNames["#updatedAt"] = "updatedAt";
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW"
      });

      const response = await docClient.send(command);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.Attributes)
      };
    }

    // DELETE /locations/{id} - Delete location
    if (method === "DELETE" && path.startsWith("/locations/")) {
      const id = path.split("/")[2];
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id }
      });
      await docClient.send(command);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Location deleted successfully" })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Not found" })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
