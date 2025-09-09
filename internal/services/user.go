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
