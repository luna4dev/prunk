package models

// ProjectStatus represents the status of a project.
type ProjectStatus string

const (
	ProjectStatusActive    ProjectStatus = "ACTIVE"
	ProjectStatusSuspended ProjectStatus = "SUSPENDED"
)

// Project represents a project in the system.
type Project struct {
	ProjectID   string                 `json:"projectId"`   // The unique identifier of the project. Partition key
	Name        string                 `json:"name"`        // The name of the project
	Description string                 `json:"description"` // The description of the project
	Status      ProjectStatus          `json:"status"`      // The status of the project
	Preferences map[string]interface{} `json:"preferences"` // The preferences of the project
	CreatedAt   int64                  `json:"createdAt"`   // The timestamp (milliseconds) of when the project was created
	UpdatedAt   int64                  `json:"updatedAt"`   // The timestamp (milliseconds) of when the project was last updated
}
