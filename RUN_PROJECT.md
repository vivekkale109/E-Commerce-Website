# Run Project (Local)

## One-time setup
```bash
npm install
```

## Start database (MariaDB)
```bash
sudo systemctl start mariadb
```

## Seed database (first time only)
```bash
sudo -E npm run seed
```

## Run server
```bash
sudo -E npm run dev
```

## Open in browser
```text
http://localhost:3002
```
