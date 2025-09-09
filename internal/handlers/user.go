package handlers

import (
	"log"
	"net/http"

	"github.com/luna4dev/airlock-client/middleware"
	"github.com/luna4dev/prunk/internal/services"

	"github.com/gin-gonic/gin"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

type UserResponse struct {
	UserID      string                 `json:"userId"`
	Email       string                 `json:"email"`
	Status      string                 `json:"status"`
	Preferences map[string]interface{} `json:"preferences"`
	CreatedAt   int64                  `json:"createdAt"`
	UpdatedAt   int64                  `json:"updatedAt"`
	LastLoginAt *int64                 `json:"lastLoginAt"`
}

func GetUser(c *gin.Context) {
	userId, err := middleware.RequireUserIDFromGin(c)
	if err != nil {
		log.Printf("GetUser: No user found in context")
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error:   "Unauthorized",
			Message: "Invalid or missing token",
		})
		return
	}

	userService, err := services.NewUserService()
	if err != nil {
		log.Printf("GetUser: Failed to initialize user service: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Internal Server Error",
			Message: "Failed to initialize user service",
		})
		return
	}

	userData, err := userService.GetUser(c, userId)
	if err != nil {
		log.Printf("GetUser: Failed to retrieve user data for userID %s: %v", userId, err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Internal Server Error",
			Message: "Failed to retrieve user data",
		})
		return
	}

	if userData == nil {
		log.Printf("GetUser: User not found for userID %s", userId)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Internal Server Error",
			Message: "User not found",
		})
		return
	}

	response := UserResponse{
		UserID:      userData.ID,
		Email:       userData.Email,
		Status:      string(userData.Status),
		Preferences: userData.Preferences,
		CreatedAt:   userData.CreatedAt,
		UpdatedAt:   userData.UpdatedAt,
		LastLoginAt: userData.LastLoginAt,
	}

	c.JSON(http.StatusOK, response)
}
