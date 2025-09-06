package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Service   string    `json:"service"`
}

func healthCheckHandler(c *gin.Context) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Service:   "prunk",
	}
	c.JSON(http.StatusOK, response)
}

func rootHandler(c *gin.Context) {
	c.String(http.StatusOK, "Data Service is running!")
}

func main() {
	// Load .env file if it exists (for development)
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found, using system environment variables")
	}

	// Define server configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "8010"
	}

	// Initialize Gin router
	r := gin.Default()

	// Set up routes
	r.GET("/health", healthCheckHandler)
	r.GET("/", rootHandler)

	// Start the server
	log.Printf("Starting data service on port %s", port)
	log.Printf("Health check available at: http://localhost:%s/health", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
