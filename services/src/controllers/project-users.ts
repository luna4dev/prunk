import { IDynamoDBDocumentContext } from '@/contexts/dynamo-db-document';
import { PrunkError } from '@/libs/error';
import { logDebug, logError, logWarn } from '@/libs/log';
import { projectUserModelSchema, ProjectUserPermission } from '@/models/project-users';
import {
  GetCommand,
  QueryCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

/**
 * Get all project-user relationships for a specific user.
 * @param userId - The userId of the user
 * @returns Array of project-user relationships
 */
export async function getProjectUsersByUserId(
  userId: string,
  pageSize: number = 10,
  lastEvaluatedKey: string | undefined,
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('getProjectUsersByUserId');
  logDebug(
    'start getProjectUsersByUserId',
    { userId, pageSize, lastEvaluatedKey },
    context
  );
  const { dynamoDBDocumentClient } = context;
  try {
    const queryParams: any = {
      TableName: 'PrunkProjectUsers',
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: pageSize,
    };

    // Add ExclusiveStartKey if lastEvaluatedKey is provided
    if (lastEvaluatedKey) {
      try {
        const parsedKey = JSON.parse(lastEvaluatedKey);
        queryParams.ExclusiveStartKey = parsedKey;
      } catch (error) {
        logError(
          'Invalid lastEvaluatedKey format',
          { lastEvaluatedKey },
          context
        );
        throw new PrunkError('Invalid pagination key', 400);
      }
    }

    const command = new QueryCommand(queryParams);
    const result = await dynamoDBDocumentClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      logWarn('no project-user relationships found', { userId }, context);
      return {
        items: [],
        lastEvaluatedKey: null,
      };
    }

    const projectUsers = result.Items.map(item => {
      const parsed = projectUserModelSchema.safeParse(item);
      if (!parsed.success) {
        logError('Project-user data malformed', parsed.error.errors, context);
        throw new PrunkError('Project-user data malformed', 500);
      }
      return parsed.data;
    });

    logDebug(
      'found project-user relationships',
      { count: projectUsers.length, hasMore: !!result.LastEvaluatedKey },
      context
    );
    return {
      items: projectUsers,
      lastEvaluatedKey: result.LastEvaluatedKey
        ? JSON.stringify(result.LastEvaluatedKey)
        : null,
    };
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('getProjectUsersByUserId error', error, context);
    throw new PrunkError('Failed to get project-user relationships', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Get all project-user relationships for a specific project.
 * @param projectId - The projectId of the project
 * @returns Array of project-user relationships
 */
export async function getProjectUsersByProjectId(
  projectId: string,
  pageSize: number,
  lastEvaluatedKey: string,
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('getProjectUsersByProjectId');
  logDebug(
    'start getProjectUsersByProjectId',
    { projectId, pageSize, lastEvaluatedKey },
    context
  );
  const { dynamoDBDocumentClient } = context;
  try {
    const queryParams: any = {
      TableName: 'PrunkProjectUsers',
      KeyConditionExpression: 'projectId = :projectId',
      ExpressionAttributeValues: {
        ':projectId': projectId,
      },
      Limit: pageSize,
    };

    // Add ExclusiveStartKey if lastEvaluatedKey is provided
    if (lastEvaluatedKey) {
      try {
        const parsedKey = JSON.parse(lastEvaluatedKey);
        queryParams.ExclusiveStartKey = parsedKey;
      } catch (error) {
        logError(
          'Invalid lastEvaluatedKey format',
          { lastEvaluatedKey },
          context
        );
        throw new PrunkError('Invalid pagination key', 400);
      }
    }

    const command = new QueryCommand(queryParams);
    const result = await dynamoDBDocumentClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      logWarn('no project-user relationships found', { projectId }, context);
      return {
        items: [],
        lastEvaluatedKey: null,
      };
    }

    const projectUsers = result.Items.map(item => {
      const parsed = projectUserModelSchema.safeParse(item);
      if (!parsed.success) {
        logError('Project-user data malformed', parsed.error.errors, context);
        throw new PrunkError('Project-user data malformed', 500);
      }
      return parsed.data;
    });

    logDebug(
      'found project-user relationships',
      { count: projectUsers.length, hasMore: !!result.LastEvaluatedKey },
      context
    );
    return {
      items: projectUsers,
      lastEvaluatedKey: result.LastEvaluatedKey
        ? JSON.stringify(result.LastEvaluatedKey)
        : null,
    };
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('getProjectUsersByProjectId error', error, context);
    throw new PrunkError('Failed to get project-user relationships', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Create a new project-user relationship.
 * @param projectUserData - The project-user data to create
 * @returns The created project-user relationship
 */
export async function createProjectUser(
  projectUserData: {
    projectId: string;
    userId: string;
    isOwner: boolean;
    permissions: ProjectUserPermission[];
  },
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('createProjectUser');
  logDebug('start createProjectUser', projectUserData, context);
  const { dynamoDBDocumentClient } = context;
  try {
    const now = Date.now();
    const projectUser = {
      ...projectUserData,
      createdAt: now,
      updatedAt: now,
    };

    // Validate the project-user data
    const parsed = projectUserModelSchema.safeParse(projectUser);
    if (!parsed.success) {
      logError('Invalid project-user data', parsed.error.errors, context);
      throw new PrunkError('Invalid project-user data', 400);
    }

    const command = new PutCommand({
      TableName: 'PrunkProjectUsers',
      Item: parsed.data,
      ConditionExpression:
        'attribute_not_exists(projectId) AND attribute_not_exists(userId)',
    });

    await dynamoDBDocumentClient.send(command);
    logDebug(
      'project-user relationship created successfully',
      parsed.data,
      context
    );
    return parsed.data;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('createProjectUser error', error, context);
    throw new PrunkError('Failed to create project-user relationship', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Update an existing project-user relationship.
 * @param projectId - The projectId of the project
 * @param userId - The userId of the user
 * @param updateData - The data to update
 * @returns The updated project-user relationship
 */
export async function updateProjectUser(
  projectId: string,
  userId: string,
  updateData: {
    isOwner?: boolean;
    permissions?: 'FULL_ACCESS'[];
  },
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('updateProjectUser');
  logDebug(
    'start updateProjectUser',
    { projectId, userId, updateData },
    context
  );
  const { dynamoDBDocumentClient } = context;
  try {
    // First, get the existing project-user relationship to validate it exists
    const existingProjectUser = await getProjectUser(
      projectId,
      userId,
      context
    );
    if (!existingProjectUser) {
      logWarn(
        'project-user relationship not found for update',
        { projectId, userId },
        context
      );
      throw new PrunkError('Project-user relationship not found', 404);
    }

    const now = Date.now();
    const updatedProjectUser = {
      ...existingProjectUser,
      ...updateData,
      updatedAt: now,
    };

    // Validate the updated project-user data
    const parsed = projectUserModelSchema.safeParse(updatedProjectUser);
    if (!parsed.success) {
      logError(
        'Invalid project-user update data',
        parsed.error.errors,
        context
      );
      throw new PrunkError('Invalid project-user update data', 400);
    }

    const command = new PutCommand({
      TableName: 'PrunkProjectUsers',
      Item: parsed.data,
    });

    await dynamoDBDocumentClient.send(command);
    logDebug(
      'project-user relationship updated successfully',
      parsed.data,
      context
    );
    return parsed.data;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('updateProjectUser error', error, context);
    throw new PrunkError('Failed to update project-user relationship', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Delete a project-user relationship.
 * @param projectId - The projectId of the project
 * @param userId - The userId of the user
 * @returns True if deleted successfully
 */
export async function deleteProjectUser(
  projectId: string,
  userId: string,
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('deleteProjectUser');
  logDebug('start deleteProjectUser', { projectId, userId }, context);
  const { dynamoDBDocumentClient } = context;
  try {
    // First, check if the project-user relationship exists
    const existingProjectUser = await getProjectUser(
      projectId,
      userId,
      context
    );
    if (!existingProjectUser) {
      logWarn(
        'project-user relationship not found for deletion',
        { projectId, userId },
        context
      );
      throw new PrunkError('Project-user relationship not found', 404);
    }

    const command = new DeleteCommand({
      TableName: 'PrunkProjectUsers',
      Key: {
        projectId,
        userId,
      },
    });

    await dynamoDBDocumentClient.send(command);
    logDebug(
      'project-user relationship deleted successfully',
      { projectId, userId },
      context
    );
    return true;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('deleteProjectUser error', error, context);
    throw new PrunkError('Failed to delete project-user relationship', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Get a specific project-user relationship by projectId and userId.
 * @param projectId - The projectId of the project
 * @param userId - The userId of the user
 * @returns The project-user relationship if found, otherwise null
 */
export async function getProjectUser(
  projectId: string,
  userId: string,
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('getProjectUser');
  logDebug('start getProjectUser', { projectId, userId }, context);
  const { dynamoDBDocumentClient } = context;
  try {
    const command = new GetCommand({
      TableName: 'PrunkProjectUsers',
      Key: {
        projectId,
        userId,
      },
    });
    const result = await dynamoDBDocumentClient.send(command);
    if (!result.Item) {
      logWarn(
        'no project-user relationship found',
        { projectId, userId },
        context
      );
      return null;
    }
    logDebug('found project-user relationship', result.Item, context);

    const parsed = projectUserModelSchema.safeParse(result.Item);
    if (!parsed.success) {
      logError('Project-user data malformed', parsed.error.errors, context);
      throw new PrunkError('Project-user data malformed', 500);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('getProjectUser error', error, context);
    throw new PrunkError('Failed to get project-user relationship', 500);
  } finally {
    context.endCallStack();
  }
}
