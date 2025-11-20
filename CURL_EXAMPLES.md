# cURL Examples for Commute Tracker API

## POST /api/commute

### Example 1: Office location (WiFi starts with RTL)
```bash
curl -X POST http://localhost:3000/api/commute \
  -H "Content-Type: application/json" \
  -d '{"user":"john.doe@example.com","wifi":"RTL-Office-WiFi"}'
```

### Example 2: Office location (WiFi starts with DPG)
```bash
curl -X POST http://localhost:3000/api/commute \
  -H "Content-Type: application/json" \
  -d '{"user":"jane.smith@example.com","wifi":"DPG-Conference-Room"}'
```

### Example 3: Home location (WiFi doesn't start with RTL or DPG)
```bash
curl -X POST http://localhost:3000/api/commute \
  -H "Content-Type: application/json" \
  -d '{"user":"user@example.com","wifi":"MyHomeNetwork"}'
```

### Example 4: Minimal payload (only user)
```bash
curl -X POST http://localhost:3000/api/commute \
  -H "Content-Type: application/json" \
  -d '{"user":"user@example.com"}'
```

### Expected Response
```json
{
  "ok": true,
  "id": "507f1f77bcf86cd799439011"
}
```

## GET /api/commute

### Get all commute entries (one per day)
```bash
curl http://localhost:3000/api/commute
```

### Expected Response
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "date": "01-09-2025",
      "workLocation": "office",
      "user": "test@rtl.nl"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "date": "02-09-2025",
      "workLocation": "home",
      "user": "test@rtl.nl"
    }
  ]
}
```

## Notes

- The POST API accepts JSON with `user` and `wifi` fields
- The POST API automatically sets the date to today in `dd-mm-yyyy` format
- Work location is determined by WiFi SSID prefix:
  - `RTL*` or `DPG*` → `workLocation: "office"`
  - Otherwise → `workLocation: "home"`
- The `user` field (email address) is saved to the database
- WiFi information is used for location detection but not saved to the database

