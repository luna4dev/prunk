import { z } from "zod";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { handleErrorResponse, serializeResponse } from "@/libs";
import { logError } from "@/libs/log";
import { DynamoDBDocumentContext } from "@/contexts";

const queryStringSchema = z.object({
  page_size: z.number().min(1).max(100).default(10),
  last_evaluated_key: z.string().optional(),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const context = new DynamoDBDocumentContext("get-projects", process.env);
  try {
    // parse query string
    const queryString = event.queryStringParameters || {};
    const { page_size: pageSize, last_evaluated_key: lastEvaluatedKey } = queryStringSchema.parse(queryString);

    return serializeResponse({ pageSize, lastEvaluatedKey }, 200);
  } catch (error) {
    logError("request-auth-email error", error, context);
    return handleErrorResponse(error);
  } finally {
    context.destroy();
  }
};