import { IPrunkBaseContext } from "../contexts";

const messageFormatter = (message: string, data: any, context: IPrunkBaseContext) => {
  const { action, callStack } = context;
  const callStackStr = "[" + action + (callStack.length > 0 ? " > " + callStack.join(" > ") : "") + "]";
  return `${callStackStr} ${message}` + (data ? `\n${JSON.stringify(data, null, 2)}` : "");
}

export function logDebug(message: string, data: any, context: IPrunkBaseContext) {
  const { LOG_LEVEL } = context;
  if (LOG_LEVEL === "debug") {
    console.debug(messageFormatter(message, data, context));
  }
}

export function logInfo(message: string, data: any, context: IPrunkBaseContext) {
  const { LOG_LEVEL } = context;
  if (LOG_LEVEL === "info" || LOG_LEVEL === "debug") {
    console.log(messageFormatter(message, data, context));
  }
}

export function logWarn(message: string, data: any, context: IPrunkBaseContext) {
  const { LOG_LEVEL } = context;
  if (LOG_LEVEL === "info" || LOG_LEVEL === "debug" || LOG_LEVEL === "warn") {
    console.warn(messageFormatter(message, data, context));
  }
}

export function logError(message: string, data: any, context: IPrunkBaseContext) {
  console.error(messageFormatter(message, data, context));
}