import { IDynamoDBDocumentContext } from "@/contexts/dynamo-db-document";
import { PrunkError } from "@/libs/error";
import { logDebug, logError, logWarn } from "@/libs/log";
import { userModelSchema } from "@/models/users";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Get a user by userId.
 * @param userId - The userId of the user
 * @returns The user if found, otherwise null
 */
export async function getUser(userId: string, context: IDynamoDBDocumentContext) {
  context.startCallStack("getUser");
  logDebug("start getUser", null, context);
  const { dynamoDBDocumentClient } = context;
  try {
    const command = new GetCommand({
      TableName: "PrunkUsers",
      Key: { userId },
    });
    const result = await dynamoDBDocumentClient.send(command);
    if (!result.Item) {
      logWarn("no user found", null, context);
      return null;
    }
    logDebug("found user", result.Item, context);

    const parsed = userModelSchema.safeParse(result.Item);
    if (!parsed.success) {
      logError("User data malformed", parsed.error.errors, context);
      throw new PrunkError("User data malformed", 500);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError("getUser error", error, context);
    throw new PrunkError("Failed to get user", 500);
  } finally {
    context.endCallStack();
  }
}


/**
 * Get a user by email.
 * @param email - The email of the user
 * @returns The user if found, otherwise null
 */
export async function getUserByEmail(email: string, context: IDynamoDBDocumentContext) {
  context.startCallStack("getUserByEmail");
  logDebug("start getUserByEmail", null, context);
  const { dynamoDBDocumentClient } = context;
  try {
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
      logWarn("no user found", null, context);
      return null;
    }
    const user = result.Items[0];
    if (!user) {
      logWarn("no user found", null, context);
      return null;
    }

    const parsed = userModelSchema.safeParse(user);
    if (!parsed.success) {
      logError("User data malformed", parsed.error.errors, context);
      throw new PrunkError("User data malformed", 500);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError("getUserByEmail error", error, context);
    throw new PrunkError("Failed to get user by email", 500);
  } finally {
    context.endCallStack();
  }
}
