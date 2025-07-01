/**
 * PrunkAuthorizerContext is the context for the prunk authorizer
 * When Prunk service API call is inbound,
 * the authorizer will be called to validate the token before accessing the service
 * Context is generated when the token is validated
 * Context is used to access the service
 */
export interface PrunkAuthorizerContext {
  userId: string;
  email: string;
}

/**
 * PrunkAuthorizerRejectContext is the context for the prunk authorizer
 * When authorizer rejects the requests, this context will be returned
 */
export interface PrunkAuthorizerRejectContext {
  statusCode: number;
  message: string;
}
