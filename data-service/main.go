package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Service   string    `json:"service"`
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Service:   "data-service",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding health response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

func main() {
	// Load .env file if it exists (for development)
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found, using system environment variables")
	}

	// Define server configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	port = ":" + port

	// Set up routes
	http.HandleFunc("/health", healthCheckHandler)

	// Add a simple root endpoint
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Data Service is running!\n")
	})

	// Start the server
	log.Printf("Starting data service on port %s", port)
	log.Printf("Health check available at: http://localhost%s/health", port)

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
