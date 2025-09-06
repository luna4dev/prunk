import { z } from 'zod';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

import { handleErrorResponse, PrunkError, serializeResponse } from '@/libs';
import { logError } from '@/libs/log';
import { DynamoDBDocumentContext } from '@/contexts';
import { createProject } from '@/controllers/projects';
import { createProjectUser } from '@/controllers/project-users';
import { ProjectUserPermission } from '@/models/project-users';

const requestBodySchema = z.object({
  name: z.string().min(1).describe('The name of the project'),
  description: z.string().describe('The description of the project'),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional().default('ACTIVE').describe('The status of the project'),
  preferences: z.any().optional().describe('The preferences of the project'),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const context = new DynamoDBDocumentContext('create-project', process.env);
  try {
    // parse request body and user info
    const {
      body,
      requestContext: { authorizer: { lambda } = {} } = {},
    } = event as any;
    const { userId, email } = lambda || {};
    
    if (!userId || !email) {
      throw new PrunkError('Unauthorized', 401);
    }

    // parse and validate request body
    let requestBody;
    try {
      requestBody = JSON.parse(body || '{}');
    } catch (error) {
      throw new PrunkError('Invalid JSON in request body', 400);
    }

    const projectData = requestBodySchema.parse(requestBody);

    // create project first
    const project = await createProject(projectData, context);

    // create project-user relationship (user becomes owner)
    const projectUserData = {
      projectId: project.projectId,
      userId: userId,
      isOwner: true,
      permissions: ['FULL_ACCESS'] as ProjectUserPermission[],
    };

    await createProjectUser(projectUserData, context);

    // return response
    return serializeResponse(project);
  } catch (error) {
    logError('create-project error', error, context);
    return handleErrorResponse(error);
  } finally {
    context.destroy();
  }
};
