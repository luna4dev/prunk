import { IPrunkBaseContext } from "./base";

export interface IJWTContext extends IPrunkBaseContext {
  JWT_SECRET: string;
  JWT_ISSUER?: string;
  JWT_AUDIENCE?: string;
}