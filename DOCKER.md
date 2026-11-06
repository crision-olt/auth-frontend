# auth-frontend Dockerfile

## Environment Variables

Build-time environment variables (set during `docker build` or in docker-compose):
- `VITE_AUTH_API_URL` - URL to auth-service API (e.g., `http://auth-service:3001`)

Runtime variables are passed via `.env` file or docker-compose environment section.

## Building and Running

```bash
# Build the image
docker build -t auth-frontend:latest .

# Run the container
docker run -d \
  -e VITE_AUTH_API_URL='http://localhost:3001' \
  -p 5173:5173 \
  auth-frontend:latest
```

## Development

For local development, create a `.env.local` file:
```
VITE_AUTH_API_URL=http://localhost:3001
```

Then run:
```bash
npm run dev
```
