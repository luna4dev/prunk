import { IPrunkBaseContext } from './base';
import { DynamoDBDocumentContext } from './dynamo-db-document';

export interface IJWTContext extends IPrunkBaseContext {
  JWT_SECRET: string;
  JWT_ISSUER?: string;
  JWT_AUDIENCE?: string;
  JWT_EXPIRATION_TIME: number;
}

export class JWTDynamoDBDocumentContext
  extends DynamoDBDocumentContext
  implements IJWTContext
{
  JWT_SECRET: string;
  JWT_ISSUER?: string;
  JWT_AUDIENCE?: string;
  JWT_EXPIRATION_TIME: number;

  constructor(action: string, environment: any) {
    super(action, environment);
    this.JWT_SECRET = environment.JWT_SECRET || '';
    this.JWT_ISSUER = environment.JWT_ISSUER || '';
    this.JWT_AUDIENCE = environment.JWT_AUDIENCE || '';
    this.JWT_EXPIRATION_TIME = environment.JWT_EXPIRATION_TIME || 3600;
  }
}
