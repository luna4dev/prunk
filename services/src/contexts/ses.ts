import { SESClient } from "@aws-sdk/client-ses";
import { IPrunkBaseContext, PrunkBaseContext } from "./base";

export interface ISESContext extends IPrunkBaseContext {
  sesClient: SESClient;
}

export class SESContext extends PrunkBaseContext implements ISESContext, IPrunkBaseContext {
  sesClient: SESClient;

  constructor(action: string, environment: any) {
    super(action, environment);
    this.sesClient = new SESClient({ region: this.REGION });
  }

  override destroy(): void {
    this.sesClient.destroy();
    super.destroy();
  }
}