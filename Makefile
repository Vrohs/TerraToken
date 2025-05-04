# TerraToken Demo Makefile
# Simple commands to streamline demonstration

.PHONY: setup deploy backend frontend demo test clean

# Set up the environment
setup:
	@echo "=== Setting up TerraToken demo environment ==="
	npm install
	cd backend && npm install
	cd frontend/project && npm install
	npx hardhat compile

# Deploy contracts to local Hardhat node
deploy:
	@echo "=== Starting local Hardhat node ==="
	@echo "Starting Hardhat node in background..."
	@npx hardhat node > /dev/null 2>&1 & echo $$! > .hardhat-pid
	@echo "Waiting for node to start..."
	@sleep 5
	@echo "=== Deploying contracts ==="
	npx hardhat run scripts/deploy.js --network localhost
	@echo "Contracts deployed! Node is running in the background."
	@echo "To stop the node later, run: make stop-node"

# Stop the Hardhat node
stop-node:
	@if [ -f .hardhat-pid ]; then \
		echo "Stopping Hardhat node..."; \
		kill -9 `cat .hardhat-pid` || true; \
		rm .hardhat-pid; \
		echo "Node stopped."; \
	else \
		echo "No Hardhat node running."; \
	fi

# Start the backend
backend:
	@echo "=== Starting TerraToken backend ==="
	cd backend && npm start

# Generate demo data
seed-data:
	@echo "=== Generating demo data ==="
	cd backend && node src/test-backend.js --seed-demo-data

# Start the frontend
frontend:
	@echo "=== Starting TerraToken frontend ==="
	cd frontend/project && npm run dev

# Run full demo (setup, deploy, start backend and frontend)
demo: setup deploy seed-data
	@echo "=== TerraToken Demo Ready ==="
	@echo "In one terminal, run: make backend"
	@echo "In another terminal, run: make frontend"

# Run tests
test:
	@echo "=== Running TerraToken tests ==="
	npx hardhat test

# Clean up artifacts and dependencies
clean:
	@echo "=== Cleaning up ==="
	rm -rf node_modules
	rm -rf backend/node_modules
	rm -rf frontend/project/node_modules
	rm -rf artifacts
	rm -rf cache
	@echo "Cleanup complete!"

# Help command
help:
	@echo "TerraToken Demo Commands:"
	@echo "  make setup      - Install all dependencies"
	@echo "  make deploy     - Deploy contracts to local Hardhat node"
	@echo "  make stop-node  - Stop the Hardhat node"
	@echo "  make backend    - Start the backend server"
	@echo "  make frontend   - Start the frontend development server"
	@echo "  make seed-data  - Generate demo data"
	@echo "  make demo       - Set up and deploy everything for demo"
	@echo "  make test       - Run smart contract tests"
	@echo "  make clean      - Remove dependencies and artifacts"
