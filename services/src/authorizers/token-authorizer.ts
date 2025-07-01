// Authorizer for the token
// This authorizer function is lambda function that is used to authorize the token
// 1) get Header: Authorization: Bearer <token>
// 2) retreive userId from the token, validate the token
// 3) save as context

type tokenAuthorizerResult = {
    "isAuthorized": boolean,
    "context": {
        "stringKey": "value",
        "numberKey": 1,
        "booleanKey": true,
        "arrayKey": ["value1", "value2"],
        "mapKey": {"value1": "value2"}
    }
}