import { Table } from "sst/node/table";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  ScanCommand,
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

export async function getAll(event: any) {
  const showDeleted = event.queryStringParameters?.showDeleted === "true";
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const results = await db.send(
    new ScanCommand({
      TableName: Table.webhooks.tableName,
      FilterExpression: showDeleted ? undefined : "attribute_not_exists(deletedAt)",
    })
  );

  const webhooks = results.Items;

  return webhooks;
}

export async function getOne(event: any) {
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const results = await db.send(
    new GetCommand({
      TableName: Table.webhooks.tableName,
      Key: { id: event.pathParameters.id },
      
    })
  );

  const webhook = results.Item;

  return webhook;
}

export async function create(event: any) {
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const webhook = JSON.parse(event.body);
  const item = {
    id: webhook.id,
    url: webhook.url,
    serverId: webhook.serverId,
    createdBy: webhook.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: Table.webhooks.tableName,
      Item: item,
    })
  );

  return webhook;
}

export async function update(event: any) {
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const webhook = JSON.parse(event.body);
  const item = {
    id: webhook.id,
    url: webhook.url,
    serverId: webhook.serverId,
    createdBy: webhook.createdBy,
    updatedAt: new Date().toISOString(),
  };

  await db.send(
    new UpdateCommand({
      TableName: Table.webhooks.tableName,
      Key: { id: item.id },
      UpdateExpression: `SET url = :url, serverId = :serverId, createdBy = :createdBy, updatedAt = :updatedAt`,
      ExpressionAttributeValues: {
        ":url": item.url,
        ":serverId": item.serverId,
        ":createdBy": item.createdBy,
        ":updatedAt": item.updatedAt,
      },
    })
  );

  return webhook;
}

export async function deleteOne(event: any) {
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  await db.send(
    new UpdateCommand({
      TableName: Table.webhooks.tableName,
      Key: { id: event.pathParameters.id },
      UpdateExpression: `SET deletedAt = :deletedAt`,
      ExpressionAttributeValues: {
        ":deletedAt": new Date().toISOString(),
      },
    })
  );

  return { result: "Webhook deleted"};
}