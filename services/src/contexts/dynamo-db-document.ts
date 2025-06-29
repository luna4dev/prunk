import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { IPrunkBaseContext, PrunkBaseContext } from "./base";

export interface IDynamoDBDocumentContext extends IPrunkBaseContext {
  dynamoDBClient: DynamoDBClient;
  dynamoDBDocumentClient: DynamoDBDocumentClient;
}

export class DynamoDBDocumentContext extends PrunkBaseContext implements IDynamoDBDocumentContext, IPrunkBaseContext {
  dynamoDBClient: DynamoDBClient;
  dynamoDBDocumentClient: DynamoDBDocumentClient;

  constructor(action: string, environment: any) {
    super(action, environment);
    this.dynamoDBClient = new DynamoDBClient({ region: this.REGION });
    this.dynamoDBDocumentClient = DynamoDBDocumentClient.from(this.dynamoDBClient);
  }

  override destroy(): void {
    this.dynamoDBDocumentClient.destroy();
    this.dynamoDBClient.destroy();
    super.destroy();
  }
}