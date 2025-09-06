import { APIGatewayProxyResult } from 'aws-lambda';

export function serializeResponse(
  result: any,
  customStatus: number = 200
): APIGatewayProxyResult {
  return {
    statusCode: customStatus,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(result),
  };
}

export function handleErrorResponse(
  error: any,
  customMessage?: string
): APIGatewayProxyResult {
  const { message, statusCode } = error || {};
  return {
    statusCode: statusCode || 500,
    body: JSON.stringify({
      message: customMessage || message || 'Internal server error',
    }),
  };
}
