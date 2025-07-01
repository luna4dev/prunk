import { JWTDynamoDBDocumentContext } from '@/contexts';
import { PrunkError } from '@/libs';
import { validateJWT } from '@/libs/jwt';
import { logDebug, logError } from '@/libs/log';
import {
  PrunkAuthorizerContext,
  PrunkAuthorizerRejectContext,
} from '@/models/authorizations';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getUser } from '@/controllers/users';

export interface TokenAuthorizerResult {
  principalId: string; // The principal user identification associated with the token sent by the client.
  policyDocument: {
    Version: string;
    Statement: {
      Action: string;
      Effect: string;
      Resource: string;
    }[];
  };
  context: PrunkAuthorizerContext | PrunkAuthorizerRejectContext;
}

const defaultAccessPolicy = (event: any) => ({
  Version: '2012-10-17',
  Statement: [
    {
      Action: 'execute-api:Invoke',
      Effect: 'Allow',
      Resource: event.routeArn,
    },
  ],
});

const defaultRejectPolicy = (event: any) => ({
  Version: '2012-10-17',
  Statement: [
    {
      Action: 'execute-api:Invoke',
      Effect: 'Deny',
      Resource: event.routeArn,
    },
  ],
});

/**
 * Authorizer for the token
 * @param event - The event object containing the authorization token
 * @returns The result of the authorizer
 */
export const authorizer = async (
  event: APIGatewayProxyEvent
): Promise<TokenAuthorizerResult> => {
  const context = new JWTDynamoDBDocumentContext(
    'token-authorizer',
    process.env
  );
  try {
    const token =
      event.headers['Authorization'] || (event.headers['authorization'] as any);
    if (!token || token.length === 0) {
      logDebug('Missing token', event.headers, context);
      throw new PrunkError('Missing token', 401);
    }

    const [_, tokenContent] = token.split(' ');

    // validate the token
    const decodedToken = validateJWT(tokenContent, context);
    const { userId } = decodedToken;
    if (!userId) {
      logDebug('Invalid token', decodedToken, context);
      throw new PrunkError('Invalid token', 401);
    }

    // get user from the database
    const user = await getUser(userId, context);
    if (!user) {
      logDebug('User not found from the database', { userId }, context);
      throw new PrunkError('Invalid token', 401);
    }

    const { email, status } = user;
    if (status !== 'ACTIVE') {
      logDebug('User is not Active', { userId }, context);
      throw new PrunkError('Unauthorized', 403);
    }

    return {
      principalId: userId,
      policyDocument: defaultAccessPolicy(event),
      context: {
        userId,
        email,
      },
    };
  } catch (error) {
    logError('token-authorizer error', error, context);

    if (error instanceof PrunkError) {
      const { statusCode, message } = error;
      return {
        principalId: '',
        policyDocument: defaultRejectPolicy(event),
        context: {
          statusCode,
          message,
        },
      };
    }

    return {
      principalId: '',
      policyDocument: defaultRejectPolicy(event),
      context: {
        statusCode: 500,
        message: 'Internal server error',
      },
    };
  } finally {
    context.destroy();
  }
};
