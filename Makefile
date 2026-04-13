APP_DIR := markdown-viewer

.PHONY: install dev build preview test lint format type-check clean

install:
	cd $(APP_DIR) && bun install

dev:
	cd $(APP_DIR) && bun dev

build:
	cd $(APP_DIR) && bun run build

preview:
	cd $(APP_DIR) && bun run preview

lint:
	cd $(APP_DIR) && bun lint

format:
	cd $(APP_DIR) && bun run format

type-check:
	cd $(APP_DIR) && bun run type-check

clean:
	rm -rf $(APP_DIR)/dist $(APP_DIR)/public/api
