  What changed:
  - All absolute paths → relative paths (e.g. ./africanshops_msvs_1_marketplace/src:/app/src)
  - Replaced the external backend network with its own frontend-network — the frontends don't need Docker network access to the backend because API calls go from the browser to localhost:8000, not container-to-container
  - Full comments with all common commands

  To pick up your code changes now, restart the marketplace container from the new location:

  cd /home/ferazi/SiliconValley/1.Africanshops/africanshops-microsbased-frontend

  # first time — bring up with new compose file
  docker compose -f docker-compose.frontend.dev.yml up marketplace

  # or if containers are already running from old location, stop them first:
  docker stop africanshops_marketplace_dev
  docker compose -f docker-compose.frontend.dev.yml up --build marketplace

   Run all apps together:
   docker compose -f docker-compose.frontend.dev.yml up --build
   docker compose -f docker-compose.frontend.dev.yml up

  Run each app independently:
  docker compose -f docker-compose.frontend.dev.yml up control-dashboard
  docker compose -f docker-compose.frontend.dev.yml up marketplace
  docker compose -f docker-compose.frontend.dev.yml up shop-dashboard