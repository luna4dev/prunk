.PHONY: run docs

run:
	source .env && go run .

docs:
	./scripts/deploy-api-docs.sh