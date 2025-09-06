import { z } from 'zod';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

import { handleErrorResponse, PrunkError, serializeResponse } from '@/libs';
import { logError } from '@/libs/log';
import { DynamoDBDocumentContext } from '@/contexts';
import { getProjectUser } from '@/controllers/project-users';
import { getProject } from '@/controllers/projects';

const pathParametersSchema = z.object({
  project_id: z.string().min(1).describe('The ID of the project to get'),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const context = new DynamoDBDocumentContext('get-project', process.env);
  try {
    // parse path parameters
    const {
      pathParameters = {},
      requestContext: { authorizer: { lambda } = {} } = {},
    } = event as any;
    const { userId, email } = lambda || {};
    const pathParams = pathParameters || {};
    const { project_id: projectId } = pathParametersSchema.parse(pathParams);

    if (!userId || !email) {
      throw new PrunkError('Unauthorized', 401);
    }

    // check if user has access to this project
    const projectUser = await getProjectUser(projectId, userId, context);
    if (!projectUser) {
      throw new PrunkError('Project not found or access denied', 404);
    }

    // get project details
    const project = await getProject(projectId, context);
    if (!project) {
      throw new PrunkError('Project not found', 404);
    }

    // return response
    return serializeResponse(project);
  } catch (error) {
    logError('get-project error', error, context);
    return handleErrorResponse(error);
  } finally {
    context.destroy();
  }
};
