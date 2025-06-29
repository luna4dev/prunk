import { z } from "zod";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { handleErrorResponse, serializeResponse } from "@/libs";
import { logDebug, logError } from "@/libs/log";
import { sendEmailAuth } from "@/libs/auth";
import { EmailSigninContext } from "@/contexts/common";
import { generateEmailAuthToken } from "@/controllers/auth";

const inputSchema = z.object({
  email: z.string().email().min(1),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const context = new EmailSigninContext("request-auth-email", process.env);
  try {
    // parse body
    const body = JSON.parse(event.body || '{}');
    const { email } = inputSchema.parse(body);

    logDebug("generating email auth token", { email }, context);
    const token = await generateEmailAuthToken(email, context);

    // send email
    logDebug("sending email", { email, token }, context);
    const result = await sendEmailAuth(email, token, context);
    logDebug("sent email", result, context);

    return serializeResponse({ status: "success" }, 201);
  } catch (error) {
    logError("request-auth-email error", error, context);
    return handleErrorResponse(error);
  } finally {
    context.destroy();
  }
};