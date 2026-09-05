-- SQLite Database Schema for FRA AI Decision Support System

DROP TABLE IF EXISTS anomalies;
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS states;

CREATE TABLE states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE
);

CREATE TABLE districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

CREATE TABLE claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id TEXT NOT NULL UNIQUE,
    applicant_name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    village TEXT NOT NULL,
    claim_type TEXT NOT NULL, -- Individual / Community
    claimed_area REAL NOT NULL, -- in hectares
    recorded_area REAL NOT NULL, -- in hectares
    submission_date TEXT NOT NULL, -- YYYY-MM-DD
    status TEXT NOT NULL, -- Approved / Pending / Rejected
    days_pending INTEGER NOT NULL DEFAULT 0,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anomalies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id TEXT NOT NULL,
    anomaly_type TEXT NOT NULL,
    severity TEXT NOT NULL, -- HIGH / MEDIUM / LOW
    risk_score INTEGER NOT NULL, -- 0 to 100
    reason TEXT NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
);

CREATE INDEX idx_claims_state ON claims(state);
CREATE INDEX idx_claims_district ON claims(district);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_claim_id ON claims(claim_id);
CREATE INDEX idx_anomalies_claim_id ON anomalies(claim_id);
CREATE INDEX idx_anomalies_severity ON anomalies(severity);
