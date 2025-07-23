# Target name variable
TARGET := data-service

.PHONY: build build-mac build-linux test clean lint fmt dev

# For Local Use Only
build-mac:
	GOOS=darwin GOARCH=arm64 go build -o bin/$(TARGET)-mac ./main.go

# Default Remote Server Configuration
build-linux:
	GOOS=linux GOARCH=amd64 go build -o bin/$(TARGET) ./main.go

build: build-mac build-linux

test:
	go test ./...

clean:
	rm -rf bin/

lint:
	golangci-lint run

fmt:
	go fmt ./...

dev: build
	./bin/$(TARGET)-darwin
