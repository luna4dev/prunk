package models

// ProjectUserPermission represents the permission of a user in a project.
type ProjectUserPermission string

const (
	ProjectUserPermissionFullAccess ProjectUserPermission = "FULL_ACCESS"
)

// ProjectUser represents a user's membership in a project.
type ProjectUser struct {
	ProjectID   string                  `json:"projectId"`   // The unique identifier of the project. Partition key
	UserID      string                  `json:"userId"`      // The unique identifier of the user. GSI partition key of userId-index
	IsOwner     bool                    `json:"isOwner"`     // Whether the user is the owner of the project
	Permissions []ProjectUserPermission `json:"permissions"` // The permissions of the user in the project
	CreatedAt   int64                   `json:"createdAt"`   // The timestamp (milliseconds) of when the project was created
	UpdatedAt   int64                   `json:"updatedAt"`   // The timestamp (milliseconds) of when the project was last updated
}
