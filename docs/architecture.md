# System Architecture — FRA AI Decision Support System

## Overview
The FRA AI Decision Support System is a full-stack spatial analytics and decision-support web platform designed for monitoring claims under the Forest Rights Act (FRA).

```
                     USER
                       │
                       ▼
             ┌──────────────────┐
             │   React Frontend │
             │   Web Dashboard   │
             └────────┬─────────┘
                      │
                      │ REST API (JSON)
                      ▼
             ┌──────────────────┐
             │  FastAPI Backend │
             │   API Layer      │
             └────────┬─────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
            ▼                   ▼
   ┌────────────────┐   ┌──────────────────┐
   │ SQLite Database│   │ AI Anomaly Engine│
   │                │   │                  │
   │ Claims         │   │ Delayed Claims   │
   │ Districts      │   │ Land Mismatch    │
   │ States         │   │ Missing Data     │
   │ Anomalies      │   │ Risk Score       │
   └───────┬────────┘   └────────┬─────────┘
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
               API Response
                      │
                      ▼
             ┌─────────────────┐
             │ React Dashboard │
             └────────┬────────┘
                      │
         ┌────────────┼─────────────┐
         ▼            ▼             ▼
      🗺️ MAP       📊 STATS      ⚠️ ALERTS
```

## Layer Breakdown

### 1. Frontend Layer
- **Framework**: React 18 + Vite
- **Styling**: Vanilla Tailwind CSS with customized government dark theme
- **GIS Map**: React Leaflet + Leaflet GeoJSON renderer
- **Charts**: Recharts (Bar Charts, Donut Charts, Line Charts)
- **API Client**: Axios

### 2. Backend API Layer
- **Framework**: Python FastAPI
- **Server**: Uvicorn ASGI Server
- **Validation**: Pydantic v2
- **ORM**: SQLAlchemy v2

### 3. Database Layer
- **Storage**: SQLite 3 (`database/fra.db`)
- **Tables**: `states`, `districts`, `claims`, `anomalies`

### 4. AI Anomaly Engine
- **Module**: `backend/ai/anomaly_detector.py`
- **Logic**: Rule-based + statistical baseline anomaly identification
- **Risk Score**: 0 to 100 logical severity calculation
