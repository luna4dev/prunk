import { EmailSigninContext } from "@/contexts";
import { PrunkError } from "@/libs/error";
import { logDebug, logError } from "@/libs/log";
import { UserModel } from "@/models";
import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { hash, randomBytes } from "crypto";

/**
 * Get a user by email.
 * @param email - The email of the user
 * @returns The user if found, otherwise null
 */
export async function generateEmailAuthToken(email: string, context: EmailSigninContext) {
  context.startCallStack("generateEmailAuthToken");
  logDebug("start generateEmailAuthToken", null, context);
  const { dynamoDBDocumentClient, EMAIL_AUTH_DEBOUNCE_TIME } = context;
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
      const isWithinDebounceTime = sentAt + EMAIL_AUTH_DEBOUNCE_TIME > Date.now();
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