package services

import (
	"context"

	"github.com/luna4dev/prunk/internal/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type UserService struct {
	dynamoDBService *DynamoDBService
}

func NewUserService() (*UserService, error) {
	dbService, err := NewDynamoDBService("Luna4Users")
	if err != nil {
		return nil, err
	}

	return &UserService{
		dynamoDBService: dbService,
	}, nil
}

func (u *UserService) GetUser(ctx context.Context, id string) (*models.User, error) {
	input := &dynamodb.QueryInput{
		TableName:              aws.String(u.dynamoDBService.tableName),
		KeyConditionExpression: aws.String("id = :id"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":id": &types.AttributeValueMemberS{Value: id},
		},
	}

	result, err := u.dynamoDBService.client.Query(ctx, input)
	if err != nil {
		return nil, err
	}

	if len(result.Items) == 0 {
		return nil, nil
	}

	var user models.User
	err = attributevalue.UnmarshalMap(result.Items[0], &user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

type SearchUsersResponse struct {
	Users    []models.User `json:"users"`
	NextKey  *string       `json:"next_key"`
	HasMore  bool          `json:"has_more"`
	PageSize int           `json:"page_size"`
}

func (u *UserService) SearchUsers(ctx context.Context, keyword string, pageSize int, pageKey *string) (*SearchUsersResponse, error) {
	input := &dynamodb.ScanInput{
		TableName:        aws.String(u.dynamoDBService.tableName),
		FilterExpression: aws.String("contains(email, :keyword)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":keyword": &types.AttributeValueMemberS{Value: keyword},
		},
		Limit: aws.Int32(int32(pageSize)),
	}

	if pageKey != nil {
		exclusiveStartKey := map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: *pageKey},
		}
		input.ExclusiveStartKey = exclusiveStartKey
	}

	result, err := u.dynamoDBService.client.Scan(ctx, input)
	if err != nil {
		return nil, err
	}

	var users []models.User
	for _, item := range result.Items {
		var user models.User
		err = attributevalue.UnmarshalMap(item, &user)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	response := &SearchUsersResponse{
		Users:    users,
		PageSize: pageSize,
		HasMore:  result.LastEvaluatedKey != nil,
	}

	if result.LastEvaluatedKey != nil {
		if idValue, exists := result.LastEvaluatedKey["id"]; exists {
			if s, ok := idValue.(*types.AttributeValueMemberS); ok {
				response.NextKey = &s.Value
			}
		}
	}

	return response, nil
}
