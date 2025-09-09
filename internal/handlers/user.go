package handlers

import (
	"log"
	"net/http"
	"strconv"

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

type UserSearchResult struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
}

type UserSearchResponse struct {
	Users      []UserSearchResult `json:"users"`
	Pagination struct {
		PageSize    int     `json:"page_size"`
		NextPageKey *string `json:"next_page_key"`
		HasMore     bool    `json:"has_more"`
	} `json:"pagination"`
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

func SearchUsers(c *gin.Context) {
	_, err := middleware.RequireUserIDFromGin(c)
	if err != nil {
		log.Printf("SearchUsers: No user found in context")
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error:   "Unauthorized",
			Message: "Invalid or missing token",
		})
		return
	}

	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Bad Request",
			Message: "keyword parameter is required",
		})
		return
	}

	pageSize := 10
	if pageSizeStr := c.Query("page_size"); pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 50 {
			pageSize = ps
		}
	}

	var pageKey *string
	if pageKeyStr := c.Query("page_key"); pageKeyStr != "" {
		pageKey = &pageKeyStr
	}

	userService, err := services.NewUserService()
	if err != nil {
		log.Printf("SearchUsers: Failed to initialize user service: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Internal Server Error",
			Message: "Failed to initialize user service",
		})
		return
	}

	searchResult, err := userService.SearchUsers(c, keyword, pageSize, pageKey)
	if err != nil {
		log.Printf("SearchUsers: Failed to search users with keyword %s: %v", keyword, err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Internal Server Error",
			Message: "Failed to search users",
		})
		return
	}

	var users []UserSearchResult
	for _, user := range searchResult.Users {
		users = append(users, UserSearchResult{
			UserID: user.ID,
			Email:  user.Email,
		})
	}

	response := UserSearchResponse{
		Users: users,
		Pagination: struct {
			PageSize    int     `json:"page_size"`
			NextPageKey *string `json:"next_page_key"`
			HasMore     bool    `json:"has_more"`
		}{
			PageSize:    searchResult.PageSize,
			NextPageKey: searchResult.NextKey,
			HasMore:     searchResult.HasMore,
		},
	}

	c.JSON(http.StatusOK, response)
}
