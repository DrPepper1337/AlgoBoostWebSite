GOLANGCI_LINT_VERSION ?= latest
GOBIN ?= $(shell go env GOBIN)
ifeq ($(GOBIN),)
GOBIN := $(shell go env GOPATH)/bin
endif
GOLANGCI := $(GOBIN)/golangci-lint
GOCACHE ?= $(CURDIR)/.cache/go-build
GOMODCACHE ?= $(CURDIR)/.cache/gomod

.PHONY: lint lint-go lint-js install-golangci

lint: lint-go lint-js

lint-go:
	@mkdir -p $(GOCACHE) $(GOMODCACHE)
	@if [ ! -x "$(GOLANGCI)" ]; then \
	  echo "golangci-lint not found at $(GOLANGCI). Run 'make install-golangci' first."; \
	  exit 1; \
	fi
	@GOCACHE=$(GOCACHE) GOMODCACHE=$(GOMODCACHE) $(GOLANGCI) run ./...

lint-js:
	@cd frontend && npm install --no-fund --no-audit >/dev/null && npm run lint

install-golangci:
	@echo "Installing golangci-lint $(GOLANGCI_LINT_VERSION) to $(GOBIN)..."
	@GOBIN=$(GOBIN) go install github.com/golangci/golangci-lint/cmd/golangci-lint@$(GOLANGCI_LINT_VERSION)
