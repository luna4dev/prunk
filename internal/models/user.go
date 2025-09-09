package models

// UserStatus represents the status of a user.
type UserStatus string

const (
	UserStatusActive    UserStatus = "ACTIVE"
	UserStatusSuspended UserStatus = "SUSPENDED"
)

// User represents a user in the system.
type User struct {
	ID          string                 `json:"id"`          // The unique identifier of the user. Partition key
	Email       string                 `json:"email"`       // The email of the user, GSI partition key of email-index
	Status      UserStatus             `json:"status"`      // The status of the user
	Preferences map[string]interface{} `json:"preferences"` // The preferences of the user (nullable)
	CreatedAt   int64                  `json:"createdAt"`   // The timestamp (milliseconds) of when the user was created
	UpdatedAt   int64                  `json:"updatedAt"`   // The timestamp (milliseconds) of when the user was last updated
	LastLoginAt *int64                 `json:"lastLoginAt"` // The timestamp (milliseconds) of when the user was last logged in (nullable)
}
