import { z } from 'zod';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

import { handleErrorResponse, PrunkError, serializeResponse } from '@/libs';
import { logError } from '@/libs/log';
import { DynamoDBDocumentContext } from '@/contexts';
import { getProjectUsersByUserId } from '@/controllers/project-users';
import { getProjects } from '@/controllers/projects';

const queryStringSchema = z.object({
  page_size: z.number().min(1).max(100).default(10),
  last_evaluated_key: z.string().optional(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const context = new DynamoDBDocumentContext('get-projects', process.env);
  try {
    // parse query string
    const {
      queryStringParameters = {},
      requestContext: { authorizer: { lambda } = {} } = {},
    } = event as any;
    const { userId, email } = lambda || {};
    const queryString = queryStringParameters || {};
    const { page_size: pageSize, last_evaluated_key: lastEvaluatedKey } =
      queryStringSchema.parse(queryString);

    if (!userId || !email) {
      throw new PrunkError('Unauthorized', 401);
    }

    // get project users
    const projectUsers = await getProjectUsersByUserId(
      userId,
      pageSize,
      lastEvaluatedKey,
      context
    );
    const {
      items: projectUsersItems,
      lastEvaluatedKey: projectUsersLastEvaluatedKey,
    } = projectUsers;

    if (projectUsersItems.length === 0) {
      return serializeResponse({
        records: [],
        lastEvaluatedKey: projectUsersLastEvaluatedKey,
      });
    }

    // get projects
    const projects = await getProjects(
      projectUsersItems.map(projectUser => projectUser.projectId),
      context
    );

    // return response
    return serializeResponse({
      records: projects,
      lastEvaluatedKey: projectUsersLastEvaluatedKey,
    });
  } catch (error) {
    logError('request-auth-email error', error, context);
    return handleErrorResponse(error);
  } finally {
    context.destroy();
  }
};
