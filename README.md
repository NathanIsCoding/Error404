# Error404

## Run with Docker

Fresh start / hard reset - run this any time things seem broken:

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

Then open http://localhost:4000

> `-v` deletes volumes (clears any stale MongoDB lock files), `--remove-orphans` removes leftover containers from old setups.

## Run locally (development)

```bash
# In /server
npm install
npm run dev

# In /client
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

## Database Population

The database is automatically populated with sample data on startup. A hardcoded admin account is always created with the following credentials:

| Field    | Value       |
|----------|-------------|
| Username | `adminuser` |
| Password | `pass123`   |

To manually re-run the population scripts:

```bash
# In /server
node scripts/populate-db.js
```

## Testing

```bash
npm test   # in either /client or /server
```

Figma Link: https://www.figma.com/design/gp5XfhU1UvCCuYPDm965kN/Web-UI?node-id=0-1&p=f&t=WdMoPw9Y1dr6hqgZ-0

Time zone: UTC−07:00
