From /home/ferazi/SiliconValley/1.Africanshops/africanshops-microsbased-frontend/, using docker-compose.frontend.dev.yml:


Shop-dashboard first (merchant app â port 5175):
cd /home/ferazi/SiliconValley/1.Africanshops/africanshops-microsbased-frontend
docker compose -f docker-compose.frontend.dev.yml up shop-dashboard
Then open http://localhost:5175. Since we only touched src/ files (bind-mounted, no package.json/yarn.lock changes), plain up is enough â no --build needed.

Then marketplace (user app â port 5174), in a second terminal (or stop shop-dashboard first with Ctrl+C):
docker compose -f docker-compose.frontend.dev.yml up marketplace
Then open http://localhost:5174.

To run both at once instead:
docker compose -f docker-compose.frontend.dev.yml up shop-dashboard marketplace

To check the merchant property flow specifically: log in as a merchant on shop-dashboard, then nav to Managed Properties â /property/managed-listings â you should see the list, be able to create a new property, and the Save/Remove buttons on an existing property should now both work.

A couple of things worth knowing before you look:
- docker compose ... up (no -d) runs in the foreground and streams logs â use Ctrl+C to stop, or add -d to detach.
- If either container was already running from before these fixes, restart it so Vite HMR picks up the file changes cleanly: docker compose -f docker-compose.frontend.dev.yml restart shop-dashboard (or marketplace).
