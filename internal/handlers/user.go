package handlers

import (
	"net/http"
	"time"

	"github.com/luna4dev/prunk/internal/models"

	"github.com/gin-gonic/gin"
)

func GetUser(c *gin.Context) {
	mockUser := models.User{
		UserID: "user_123456789",
		Email:  "john@example.com",
		Status: models.UserStatusActive,
		Preferences: map[string]interface{}{
			"theme":         "dark",
			"notifications": true,
		},
		CreatedAt:   time.Now().Add(-30 * 24 * time.Hour).UnixMilli(),
		UpdatedAt:   time.Now().UnixMilli(),
		LastLoginAt: func() *int64 { t := time.Now().Add(-1 * time.Hour).UnixMilli(); return &t }(),
	}

	c.JSON(http.StatusOK, mockUser)
}
