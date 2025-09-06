import { IDynamoDBDocumentContext } from '@/contexts/dynamo-db-document';
import { PrunkError } from '@/libs/error';
import { logDebug, logError, logWarn } from '@/libs/log';
import { projectModelSchema } from '@/models/projects';
import { GetCommand, PutCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

/**
 * Get all projects for a user.
 * @param userId - The userId of the user
 * @returns Array of projects
 */
export async function getProjects(
  projectIds: string[],
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('getProjects');
  logDebug('start getProjects', { projectIds }, context);
  const { dynamoDBDocumentClient } = context;
  try {
    const command = new BatchGetCommand({
      RequestItems: {
        PrunkProjects: {
          Keys: projectIds.map(projectId => ({ projectId })),
        },
      },
    });

    const result = await dynamoDBDocumentClient.send(command);
    if (
      !result.Responses ||
      !result.Responses['PrunkProjects'] ||
      result.Responses['PrunkProjects'].length === 0
    ) {
      logWarn('no projects found', { projectIds }, context);
      return [];
    }

    const projects = result.Responses['PrunkProjects'].map((item: any) => {
      const parsed = projectModelSchema.safeParse(item);
      if (!parsed.success) {
        logError('Project data malformed', parsed.error.errors, context);
        throw new PrunkError('Project data malformed', 500);
      }
      return parsed.data;
    });

    logDebug('found projects', { count: projects.length }, context);
    return projects;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('getProjects error', error, context);
    throw new PrunkError('Failed to get projects', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Get a specific project by projectId.
 * @param projectId - The projectId of the project
 * @returns The project if found, otherwise null
 */
export async function getProject(
  projectId: string,
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('getProject');
  logDebug('start getProject', { projectId }, context);
  const { dynamoDBDocumentClient } = context;
  try {
    const command = new GetCommand({
      TableName: 'PrunkProjects',
      Key: { projectId },
    });
    const result = await dynamoDBDocumentClient.send(command);
    if (!result.Item) {
      logWarn('no project found', { projectId }, context);
      return null;
    }
    logDebug('found project', result.Item, context);

    const parsed = projectModelSchema.safeParse(result.Item);
    if (!parsed.success) {
      logError('Project data malformed', parsed.error.errors, context);
      throw new PrunkError('Project data malformed', 500);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('getProject error', error, context);
    throw new PrunkError('Failed to get project', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Create a new project.
 * @param projectData - The project data to create
 * @returns The created project
 */
export async function createProject(
  projectData: {
    name: string;
    description: string;
    status?: 'ACTIVE' | 'SUSPENDED';
    preferences?: any;
  },
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('createProject');
  logDebug('start createProject', projectData, context);
  const { dynamoDBDocumentClient } = context;
  try {
    const projectId = uuid();
    const now = Date.now();
    const project = {
      projectId,
      ...projectData,
      status: projectData.status || 'ACTIVE',
      preferences: projectData.preferences || {},
      createdAt: now,
      updatedAt: now,
    };

    // Validate the project data
    const parsed = projectModelSchema.safeParse(project);
    if (!parsed.success) {
      logError('Invalid project data', parsed.error.errors, context);
      throw new PrunkError('Invalid project data', 400);
    }

    const command = new PutCommand({
      TableName: 'PrunkProjects',
      Item: parsed.data,
      ConditionExpression: 'attribute_not_exists(projectId)',
    });

    await dynamoDBDocumentClient.send(command);
    logDebug('project created successfully', parsed.data, context);
    return parsed.data;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('createProject error', error, context);
    throw new PrunkError('Failed to create project', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Update an existing project.
 * @param projectId - The projectId of the project to update
 * @param updateData - The data to update
 * @returns The updated project
 */
export async function updateProject(
  projectId: string,
  updateData: {
    name?: string;
    description?: string;
    status?: 'ACTIVE' | 'SUSPENDED';
    preferences?: any;
  },
  context: IDynamoDBDocumentContext
) {
  context.startCallStack('updateProject');
  logDebug('start updateProject', { projectId, updateData }, context);
  const { dynamoDBDocumentClient } = context;
  try {
    // First, get the existing project to validate it exists
    const existingProject = await getProject(projectId, context);
    if (!existingProject) {
      logWarn('project not found for update', { projectId }, context);
      throw new PrunkError('Project not found', 404);
    }

    const now = Date.now();
    const updatedProject = {
      ...existingProject,
      ...updateData,
      updatedAt: now,
    };

    // Validate the updated project data
    const parsed = projectModelSchema.safeParse(updatedProject);
    if (!parsed.success) {
      logError('Invalid project update data', parsed.error.errors, context);
      throw new PrunkError('Invalid project update data', 400);
    }

    const command = new PutCommand({
      TableName: 'PrunkProjects',
      Item: parsed.data,
    });

    await dynamoDBDocumentClient.send(command);
    logDebug('project updated successfully', parsed.data, context);
    return parsed.data;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('updateProject error', error, context);
    throw new PrunkError('Failed to update project', 500);
  } finally {
    context.endCallStack();
  }
}
