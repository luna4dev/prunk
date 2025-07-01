import { z } from "zod";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { handleErrorResponse, PrunkError, serializeResponse } from "@/libs";
import { logDebug, logError } from "@/libs/log";
import { verifyEmailAuth } from "@/controllers/auth";
import { DynamoDBDocumentContext, IJWTContext } from "@/contexts";
import { SESClient } from "@aws-sdk/client-ses";
import { createJWT } from "@/libs/jwt";

export class VerifyEmailAuthContext extends DynamoDBDocumentContext implements IJWTContext {
  sesClient: SESClient;
  EMAIL_AUTH_TOKEN_EXPIRATION_TIME: number;

  JWT_EXPIRATION_TIME: number;
  JWT_SECRET: string;
  JWT_ISSUER?: string;
  JWT_AUDIENCE?: string;

  constructor(action: string, environment: any) {
    if (!environment.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }

    super(action, environment);

    this.sesClient = new SESClient({ region: this.REGION });
    this.EMAIL_AUTH_TOKEN_EXPIRATION_TIME = parseInt(environment.EMAIL_AUTH_TOKEN_EXPIRATION_TIME) || 1000 * 60 * 30; // 10 minutes

    this.JWT_EXPIRATION_TIME = parseInt(environment.JWT_EXPIRATION_TIME) || 1000 * 60 * 60 * 24 * 30; // 30 days
    this.JWT_SECRET = environment.JWT_SECRET;
    this.JWT_ISSUER = environment.JWT_ISSUER;
    this.JWT_AUDIENCE = environment.JWT_AUDIENCE;
  }

  override destroy(): void {
    this.sesClient.destroy();
    super.destroy();
  }
}
const queryStringSchema = z.object({
  email: z.string().transform(value => {
    // decode email from url encoded
    return decodeURIComponent(value);
  }).pipe(z.string().email()),
  token: z.string(),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const context = new VerifyEmailAuthContext("verify-email-auth", process.env);
  const { EMAIL_AUTH_TOKEN_EXPIRATION_TIME, JWT_EXPIRATION_TIME } = context;
  try {
    // parse query string
    const queryString = event.queryStringParameters || {};
    const { email, token } = queryStringSchema.parse(queryString);

    // verify email auth
    logDebug("verifying email auth", { email, token }, context);
    const { userId } = await verifyEmailAuth(email, token, EMAIL_AUTH_TOKEN_EXPIRATION_TIME, context);

    // create JWT
    const jwtToken = createJWT({ userId }, context, { expiresIn: JWT_EXPIRATION_TIME });


    // return
    return serializeResponse({ token: jwtToken }, 200);
  } catch (error) {
    logError("verify-email-auth error", error, context);

    // check error has statusCode, if it is not 500, return 'Malformed email verification'
    if (error instanceof PrunkError && error.statusCode !== 500) {
      return handleErrorResponse(new PrunkError("Malformed email verification", 400));
    }

    return handleErrorResponse(error);
  } finally {
    context.destroy();
  }
};