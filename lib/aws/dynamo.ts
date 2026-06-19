import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
export const docClient = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "EduflowLMS";

// Helper functions for Single-Table Design
export const putItem = async (item: Record<string, any>) => {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  });
  return docClient.send(command);
};

export const getItem = async (pk: string, sk: string) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  });
  const response = await docClient.send(command);
  return response.Item;
};

export const queryItems = async (pk: string, skPrefix?: string) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: skPrefix ? "PK = :pk AND begins_with(SK, :skPrefix)" : "PK = :pk",
    ExpressionAttributeValues: skPrefix ? { ":pk": pk, ":skPrefix": skPrefix } : { ":pk": pk },
  });
  const response = await docClient.send(command);
  return response.Items;
};
