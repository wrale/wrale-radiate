# Detect the environment
IS_PODMAN := $(shell command -v podman 2> /dev/null)
IS_DOCKER := $(shell command -v docker 2> /dev/null)

# Set the compose command based on availability
ifeq ($(IS_PODMAN),)
ifeq ($(IS_DOCKER),)
$(error Neither Docker nor Podman found in PATH)
else
COMPOSE_CMD := docker compose
endif
else
COMPOSE_CMD := podman compose
endif

.PHONY: help
help: ## Show this help
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: up
up: ## Start all services
	$(COMPOSE_CMD) up --build

.PHONY: down
down: ## Stop and remove all containers
	$(COMPOSE_CMD) down

.PHONY: clean
clean: ## Stop and remove all containers, volumes, and images
	$(COMPOSE_CMD) down -v --rmi all

.PHONY: logs
logs: ## View logs from all containers
	$(COMPOSE_CMD) logs -f

.PHONY: ps
ps: ## List running containers
	$(COMPOSE_CMD) ps

.PHONY: shell-webapp
shell-webapp: ## Open a shell in the webapp container
	$(COMPOSE_CMD) exec webapp sh

.PHONY: shell-display
shell-display: ## Open a shell in the display container
	$(COMPOSE_CMD) exec display-client sh

.PHONY: webapp-logs
webapp-logs: ## View webapp logs
	$(COMPOSE_CMD) logs -f webapp

.PHONY: display-logs
display-logs: ## View display client logs
	$(COMPOSE_CMD) logs -f display-client

.PHONY: restart
restart: ## Restart all services
	$(COMPOSE_CMD) restart

.PHONY: rebuild
rebuild: ## Rebuild and restart all services
	$(COMPOSE_CMD) down
	$(COMPOSE_CMD) build --no-cache
	$(COMPOSE_CMD) up

.PHONY: cycle
cycle: ## Clean, pull latest changes, initialize, and start services
	make clean
	git pull
	make init
	make up

# Initialization target that checks requirements
.PHONY: init
init: ## Initialize the project and check requirements
	@echo "Checking system requirements..."
	@if [ "$(IS_PODMAN)" ]; then \
		echo "✅ Podman found"; \
		echo "ℹ️  Using podman-compose"; \
	else \
		if [ "$(IS_DOCKER)" ]; then \
			echo "✅ Docker found"; \
			echo "ℹ️  Using docker compose"; \
		else \
			echo "❌ Neither Docker nor Podman found"; \
			exit 1; \
		fi \
	fi
	@echo "✨ Ready to start - use 'make up' to launch services"

.PHONY: open
open: ## Open management and display interfaces in browser
	@echo "Opening management interface..."
	@open http://localhost:3000 || xdg-open http://localhost:3000 || echo "Could not open browser"
	@echo "Opening display simulator..."
	@open http://localhost:3001 || xdg-open http://localhost:3001 || echo "Could not open browser"

# Default target
.DEFAULT_GOAL := help
