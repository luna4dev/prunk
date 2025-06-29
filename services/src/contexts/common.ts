import { SESClient } from "@aws-sdk/client-ses";
import { DynamoDBDocumentContext } from "./dynamo-db-document";
import { ISESContext } from "./ses";

export class EmailSigninContext extends DynamoDBDocumentContext implements ISESContext {
  sesClient: SESClient;
  EMAIL_AUTH_DEBOUNCE_TIME: number;
  EMAIL_AUTH_TOKEN_EXPIRATION_TIME: number;
  EMAIL_AUTH_SENDER: string;
  EMAIL_AUTH_PATH: string;

  constructor(action: string, environment: any) {
    if (!environment.EMAIL_AUTH_SENDER) {
      throw new Error("EMAIL_AUTH_SENDER is required");
    }
    if (!environment.EMAIL_AUTH_PATH) {
      throw new Error("EMAIL_AUTH_PATH is required");
    }

    super(action, environment);

    this.sesClient = new SESClient({ region: this.REGION });
    this.EMAIL_AUTH_DEBOUNCE_TIME = environment.EMAIL_AUTH_DEBOUNCE_TIME || 1000 * 60 * 3; // 3 minutes
    this.EMAIL_AUTH_TOKEN_EXPIRATION_TIME = environment.EMAIL_AUTH_TOKEN_EXPIRATION_TIME || 1000 * 60 * 30; // 10 minutes
    this.EMAIL_AUTH_SENDER = environment.EMAIL_AUTH_SENDER;
    this.EMAIL_AUTH_PATH = environment.EMAIL_AUTH_PATH;
  }

  override destroy(): void {
    this.sesClient.destroy();
    super.destroy();
  }
}