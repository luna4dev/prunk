# Target name variable
TARGET := data-service

.PHONY: build build-prod test clean lint fmt dev

build:
	GOOS=darwin GOARCH=arm64 go build -o bin/$(TARGET)-darwin ./main.go

build-prod:
	GOOS=linux GOARCH=amd64 go build -o bin/$(TARGET)-linux ./main.go

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
