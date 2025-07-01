import { IDynamoDBDocumentContext } from "@/contexts";
import { PrunkError } from "@/libs/error";
import { logDebug, logError } from "@/libs/log";
import { UserModel } from "@/models";
import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { hash, randomBytes } from "crypto";

/**
 * Generate an email authentication token.
 * @param email - The email of the user
 * @param emailAuthDebounceTime - The debounce time of the email authentication
 * @param context - The context containing the DynamoDB document client
 * @returns The token
 */
export async function generateEmailAuthToken(email: string, emailAuthDebounceTime: number, context: IDynamoDBDocumentContext) {
  context.startCallStack("generateEmailAuthToken");
  logDebug("start generateEmailAuthToken", null, context);
  const { dynamoDBDocumentClient } = context;
  try {
    // scan table with sort key email
    const command = new QueryCommand({
      TableName: "PrunkUsers",
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
      Limit: 1,
    });

    const result = await dynamoDBDocumentClient.send(command);
    if (!result.Items || result.Items.length === 0) {
      throw new PrunkError("User not found", 404);
    }
    const user = result.Items[0];
    const { userId, emailAuth } = user as UserModel;

    logDebug("email auth status", emailAuth, context);

    // check if the email auth is
    if (emailAuth) {
      const { sentAt } = emailAuth;

      // check if it is within the debounce time
      const isWithinDebounceTime = sentAt + emailAuthDebounceTime > Date.now();
      if (isWithinDebounceTime) {
        throw new PrunkError("Too many requests", 429);
      }
    }

    // generate a new token
    const token = randomBytes(32).toString("hex");
    const tokenHash = hash("sha256", token, "hex");
    const sentAt = Date.now();

    // update the user with the new token
    const updateCommand = new UpdateCommand({
      TableName: "PrunkUsers",
      Key: { userId },
      UpdateExpression: "SET emailAuth = :emailAuth",
      ExpressionAttributeValues: {
        ":emailAuth": {
          token: tokenHash,
          sentAt,
          completed: false,
        },
      },
    });
    const updateResult = await dynamoDBDocumentClient.send(updateCommand);
    logDebug("updated email auth", { updateResult }, context);

    return token;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError("generateEmailAuthToken error", error, context);
    throw new PrunkError("Failed to generate email authentication token", 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Verify an email authentication token.
 * @param email - The email of the user
 * @param token - The token to verify
 * @param emailTokenExpirationTime - The expiration time of the email token
 * @param context - The context containing the DynamoDB document client
 * @returns The user if found, otherwise null
 */
export async function verifyEmailAuth(email: string, token: string, emailTokenExpirationTime: number, context: IDynamoDBDocumentContext) {
  context.startCallStack("verifyEmailAuth");
  logDebug("start verifyEmailAuth", null, context);
  const { dynamoDBDocumentClient } = context;
  try {
    // get the user by email
    const queryCommand = new QueryCommand({
      TableName: "PrunkUsers",
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    });
    const queryResult = await dynamoDBDocumentClient.send(queryCommand);
    if (!queryResult.Items || queryResult.Items.length === 0) {
      throw new PrunkError("User not found", 404);
    }
    const user = queryResult.Items[0];
    const { userId, emailAuth } = user as UserModel;

    // check if the email auth is valid
    if (!emailAuth) {
      throw new PrunkError("Email authentication not found", 404);
    }

    const { token: tokenHash, sentAt, completed } = emailAuth;

    // check if the email auth is completed
    if (completed) {
      throw new PrunkError("Email authentication already completed", 400);
    }

    // check if the token is valid
    const isTokenValid = tokenHash === hash("sha256", token, "hex");
    if (!isTokenValid) {
      throw new PrunkError("Invalid token", 400);
    }

    // check if the token is expired
    const isTokenExpired = sentAt + emailTokenExpirationTime < Date.now();
    if (isTokenExpired) {
      throw new PrunkError("Token expired", 400);
    }

    // update the user with the new token
    const updateCommand = new UpdateCommand({
      TableName: "PrunkUsers",
      Key: { userId },
      UpdateExpression: "SET emailAuth = :emailAuth",
      ExpressionAttributeValues: {
        ":emailAuth": {
          token: tokenHash,
          sentAt,
          completed: true,
        },
      },
    });
    const updateResult = await dynamoDBDocumentClient.send(updateCommand);
    logDebug("updated email auth", { updateResult }, context);

    return { userId, email };
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError("verifyEmailAuth error", error, context);
    throw new PrunkError("Failed to verify email authentication", 500);
  } finally {
    context.endCallStack();
  }
}