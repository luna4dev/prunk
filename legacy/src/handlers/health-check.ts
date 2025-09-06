import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

import { handleErrorResponse, serializeResponse } from '@/libs';
import { logError } from '@/libs/log';
import { PrunkBaseContext } from '@/contexts';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const context = new PrunkBaseContext('health-check', process.env);
  try {
    // Simple health check response
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'prunk-api',
      version: process.env['VERSION'] || '1.0.0'
    };

    // return response
    return serializeResponse(healthStatus);
  } catch (error) {
    logError('health-check error', error, context);
    return handleErrorResponse(error);
  } finally {
    context.destroy();
  }
};
