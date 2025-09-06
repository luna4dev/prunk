package models

// PrunkAuthorizerContext is the context for the prunk authorizer.
type PrunkAuthorizerContext struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
}

// PrunkAuthorizerRejectContext is returned when the authorizer rejects a request.
type PrunkAuthorizerRejectContext struct {
	StatusCode int    `json:"statusCode"`
	Message    string `json:"message"`
}
