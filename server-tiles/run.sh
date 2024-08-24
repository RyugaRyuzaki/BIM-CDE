docker run -d \
  --name postgres_container \
  --restart unless-stopped \
  --env-file .env \
  -p 5432:5432 \
  postgres:alpine