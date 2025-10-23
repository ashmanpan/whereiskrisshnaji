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
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
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

    // GET /locations - Get all locations
    if (method === "GET" && path === "/locations") {
      const command = new ScanCommand({
        TableName: TABLE_NAME
      });
      const response = await docClient.send(command);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.Items || [])
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
