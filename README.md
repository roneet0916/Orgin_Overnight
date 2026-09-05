# FRA Monitoring & AI Decision Support WebGIS

> **Forest Rights Act (FRA) Monitoring Dashboard** — Madhya Pradesh district statistics and land claim visualization with AI decision support.

---

## Disclaimer

**Demo system using simulated data. Not an official Government of India system.**  
All district metrics, land boundaries, and claim records are synthetically generated for development and demonstration.

---

## Project Overview

This project is an interactive **WebGIS dashboard** for monitoring Forest Rights Act (FRA) claims across Madhya Pradesh districts. It combines:

- A **Leaflet.js** map with OpenStreetMap tiles
- District-level statistics from a **FastAPI** backend
- **AI summary** generation per district
- **Demo land claim polygons** (mock data, ready to swap for real survey data)
- Optional **GeoJSON district boundaries** with API-driven styling

---

## Folder Structure

```
Origin_forest_FRA/
├── README.md
├── requirements.txt
├── run_backend.py
├── start_all.bat
│
├── backend/
│   ├── app.py                    # FastAPI application (existing + FRA routes)
│   ├── config.py
│   ├── requirements.txt
│   ├── data/
│   │   ├── districts.json        # MP district mock statistics
│   │   └── land_patches.json     # Demo land claim polygons
│   ├── models/
│   │   └── fra_schemas.py        # Pydantic models for FRA API
│   ├── routes/
│   │   └── fra_api.py            # /api/districts, /summary, etc.
│   └── services/
│       └── fra_data_service.py   # Data loading & AI summary logic
│
├── frontend/                     # Vanilla JS dashboard (primary UI)
│   ├── index.html
│   ├── css/styles.css
│   ├── js/
│   │   ├── config.js             # API_BASE_URL switch
│   │   ├── district-coords.js    # District lat/lng mapping
│   │   ├── utils.js
│   │   ├── api.js
│   │   ├── district-map.js       # District map + GeoJSON
│   │   ├── land-patches.js       # Land claim polygon layer
│   │   ├── dashboard.js          # Stats cards & table
│   │   └── app.js
│   └── data/
│       ├── mp_districts.geojson  # Demo MP district boundaries
│       └── land_patches.json     # Local fallback for land patches
│
├── data/                         # Legacy/shared data (SQLite, old GeoJSON)
├── tests/
│   └── test_fra_api.py           # FRA API endpoint tests
└── frontend/src/                 # Legacy React app (optional, not primary)
```

---

## Required Software

- **Python 3.11+**
- **pip**
- A static file server for the frontend (Python built-in, VS Code Live Server, etc.)

---

## Installation

```bash
cd Origin_forest_FRA
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

---

## Run the Backend

From the project root:

```bash
venv\Scripts\activate
python run_backend.py
```

Or:

```bash
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

Health check: http://127.0.0.1:8000/health  
API docs: http://127.0.0.1:8000/docs

---

## Run the Frontend

The frontend uses **vanilla HTML/CSS/JS with ES modules** — it must be served over HTTP (not opened as `file://`).

**Option A — Python (recommended):**

```bash
cd frontend
python -m http.server 5500
```

Open: http://127.0.0.1:5500

**Option B — VS Code Live Server:**  
Right-click `frontend/index.html` → “Open with Live Server”.

**Option C — Start both (Windows):**

```bash
start_all.bat
```

---

## Switch API_BASE_URL

Edit `frontend/js/config.js`:

```javascript
const USE_LOCAL_BACKEND = false;  // set true for local FastAPI

const API_BASE_URL = USE_LOCAL_BACKEND
  ? "http://127.0.0.1:8000"
  : "https://vanadhikar-ai.onrender.com";
```

| Mode | URL |
|------|-----|
| Deployed (default) | `https://vanadhikar-ai.onrender.com` |
| Local backend | `http://127.0.0.1:8000` |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| GET | `/api/districts` | All district statistics |
| GET | `/api/anomalies` | Flagged anomalous districts |
| GET | `/api/summary` | State-level summary cards |
| GET | `/api/ai-summary/{district}` | AI/rule-based district summary |
| GET | `/api/land-patches` | Demo land claim polygon data |

Legacy endpoints (`/api/dashboard/*`, `/api/claims`, etc.) remain available from the existing SQLite-backed API.

### District response shape

```json
{
  "count": 8,
  "districts": [{
    "district_name": "Bhopal",
    "state": "Madhya Pradesh",
    "claims_filed": 8,
    "claims_approved": 4,
    "claims_pending": 4,
    "claims_rejected": 0,
    "pending_days_avg": 97.0,
    "land_area_ha": 123.4,
    "high_risk_claims": 0,
    "avg_evidence_score": 85.1,
    "avg_boundary_confidence": 89.9,
    "avg_overlap_percent": 5.2,
    "patches_count": 8,
    "anomaly": false,
    "anomaly_reason": null
  }]
}
```

---

## Add or Replace GeoJSON

1. Place your file at `frontend/data/mp_districts.geojson` (or change `GEOJSON_PATH` in `config.js`).
2. Ensure each feature has a district name in `properties.district`, `properties.district_name`, or similar.
3. The dashboard normalizes names and matches them to API data.
4. Supported aliases: `East Nimar` → Khandwa, `West Nimar` → Khargone, `Nimar` → Khandwa.
5. If GeoJSON fails to load, **circle markers** are used automatically (no crash).

---

## Replace Mock Land Data with Real Data

**Option A — Backend API**

1. Replace `backend/data/land_patches.json` with real claim records.
2. Each patch needs `coordinates` as `[lat, lng]` arrays (Leaflet order).
3. Optional `overlap_coordinates` for red overlap boundary lines.
4. Serve via `GET /api/land-patches`.

**Option B — Frontend fallback**

Replace `frontend/data/land_patches.json` — used when the API is unavailable.

**Required fields per patch:**

`claim_id`, `village`, `district`, `state`, `area_hectares`, `land_type`, `claim_type`, `claimant_count`, `status`, `risk_level`, `evidence_type`, `evidence_score`, `boundary_confidence`, `forest_cover_percent`, `overlap_percent`, `submission_date`, `coordinates`

---

## District Coordinates

Edit `frontend/js/district-coords.js` to add or update marker fallback locations when GeoJSON is unavailable.

---

## Testing

**Backend API tests:**

```bash
python -m pytest tests/test_fra_api.py -o pythonpath=. -v
```

**Frontend utility tests (Node 18+):**

```bash
node --test frontend/js/utils.test.mjs
```

**Manual checks:**

1. Dashboard loads without console errors
2. Bhopal = yellow (50%), Dewas = green (100%), Burhanpur/Raisen = red (anomaly)
3. “View anomalies only” shows Burhanpur and Raisen
4. District popup → “Get AI Summary” returns text
5. Table row click focuses map on district
6. Demo land polygons visible with “DEMO DATA” badge
7. Mobile layout has no horizontal overflow

---

## Known Limitations

- District GeoJSON boundaries are **simplified demo polygons**, not official survey boundaries.
- Land claim polygons are **mock data** labeled as demo.
- Deployed backend on Render may cold-start slowly (~30s).
- The legacy React frontend in `frontend/src/` is retained but not the primary dashboard.
- AI summaries use rule-based text locally; deployed backend may append provider fallback notes.

---

## License

See `LICENSE` in the project root.
