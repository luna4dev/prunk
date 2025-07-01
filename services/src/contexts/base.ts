export interface IPrunkBaseContext {
  action: string;
  REGION: string;
  LOG_LEVEL: 'info' | 'debug' | 'warn' | 'error';

  callStack: string[];

  startCallStack(action: string): void;
  endCallStack(): void;

  destroy(): void;
}

export class PrunkBaseContext implements IPrunkBaseContext {
  action: string;
  REGION: string;
  LOG_LEVEL: 'info' | 'debug' | 'warn' | 'error';
  SERVICE_DOMAIN: string;

  callStack: string[];

  constructor(action: string, environment: any) {
    if (!environment.REGION) {
      throw new Error('REGION is required');
    }
    if (!environment.SERVICE_DOMAIN) {
      throw new Error('SERVICE_DOMAIN is required');
    }

    this.action = action;
    this.REGION = environment.REGION;
    this.LOG_LEVEL = environment.LOG_LEVEL || 'info';
    this.SERVICE_DOMAIN = environment.SERVICE_DOMAIN;
    this.callStack = [];
  }

  startCallStack(callStack: string): void {
    this.callStack.push(callStack);
  }

  endCallStack(): void {
    this.callStack.pop();
  }

  destroy(): void {
    // do nothing
    return;
  }
}
