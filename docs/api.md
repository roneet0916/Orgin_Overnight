# API Reference — FRA AI Decision Support System

Base URL: `http://localhost:8000/api`

## Health Check
- `GET /health`: Returns service health status and disclaimer banner.

## Claims Endpoints
- `GET /claims`: List claims with pagination, search, sorting, and state/district/status/risk filters.
- `GET /claims/{claim_id}`: Retrieve detailed claim info including AI summary explanation.
- `POST /analyze/{claim_id}`: Re-run AI Anomaly Engine on claim and update stored anomaly records.

## Dashboard Statistics
- `GET /dashboard/stats`: Returns overall aggregate claim counts, delayed claims, and top alerts.
- `GET /dashboard/states`: Returns state-wise claim status breakdown.
- `GET /dashboard/districts`: Returns district-wise metrics.

## AI Anomalies
- `GET /anomalies`: List detected anomalies filtered by severity (HIGH, MEDIUM, LOW).
- `GET /anomalies/{claim_id}`: Get anomalies specific to a claim.

## GIS & Maps
- `GET /maps/districts`: Returns GeoJSON FeatureCollection enriched with live database district metrics.
- `GET /states`: List supported reference states.
- `GET /districts/{state_name}`: List districts for a state.

## Export & Reports
- `GET /reports/claims`: Download full claims dataset as CSV file.
- `GET /reports/anomalies`: Download AI audit anomalies dataset as CSV file.
