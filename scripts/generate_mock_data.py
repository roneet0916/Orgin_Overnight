import os
import json
import random
import csv
from datetime import datetime, timedelta
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import backend modules
import sys
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.config import DATABASE_URL
from backend.models.claim import Base, StateModel, DistrictModel, ClaimModel, AnomalyModel
from backend.ai.anomaly_detector import AnomalyDetector

def generate_data(num_claims: int = 1000):
    print(f"Initializing database at {DATABASE_URL}...")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Load reference states and districts
    states_file = BASE_DIR / "data" / "states.json"
    with open(states_file, "r", encoding="utf-8") as f:
        states_data = json.load(f)

    # Populate States and Districts tables
    print("Seeding States and Districts...")
    for s_data in states_data:
        state_obj = StateModel(name=s_data["name"], code=s_data["code"])
        db.add(state_obj)
        db.flush()

        for d_data in s_data["districts"]:
            dist_obj = DistrictModel(
                state_id=state_obj.id,
                name=d_data["name"],
                latitude=d_data["lat"],
                longitude=d_data["lng"]
            )
            db.add(dist_obj)

    db.commit()

    # Sample names and villages for mock data generator
    first_names = ["Ramesh", "Suresh", "Sunita", "Anita", "Vijay", "Manoj", "Pooja", "Devi", "Rajesh", "Kamla", "Somnath", "Gautam", "Radha", "Babu", "Lakshmi", "Birsa", "Sidhu", "Kanhu", "Phulo", "Jano"]
    last_names = ["Kumar", "Singh", "Maravi", "Tudu", "Munda", "Uraon", "Gond", "Bhilla", "Bhoi", "Patel", "Naik", "Soren", "Hembram", "Pradhan", "Rathwa"]
    villages = ["Panchvati", "Kalyanpur", "Devgaon", "Rampur", "Sunderpur", "Chhota Nagpur", "Amrapali", "Bhadrapur", "Chandapur", "Durgapur", "Sitapur", "Example Village"]

    claim_types = ["Individual", "Community"]
    statuses = ["Approved", "Pending", "Rejected"]
    status_weights = [0.65, 0.25, 0.10]  # Realistic breakdown

    claims_list = []

    # 1. Mandatory Hackathon Demo Claims (FRA-1001 & FRA-1025)
    demo_claim_1 = {
        "claim_id": "FRA-1001",
        "applicant_name": "Ramesh Kumar",
        "state": "Madhya Pradesh",
        "district": "Dhar",
        "village": "Example Village",
        "claim_type": "Individual",
        "claimed_area": 8.5,
        "recorded_area": 8.2,
        "submission_date": (datetime.now() - timedelta(days=120)).strftime("%Y-%m-%d"),
        "status": "Approved",
        "days_pending": 0,
        "latitude": 22.5976 + random.uniform(-0.05, 0.05),
        "longitude": 75.3023 + random.uniform(-0.05, 0.05)
    }
    claims_list.append(demo_claim_1)

    demo_claim_2 = {
        "claim_id": "FRA-1025",
        "applicant_name": "Example Applicant",
        "state": "Madhya Pradesh",
        "district": "Dhar",
        "village": "Example Village",
        "claim_type": "Individual",
        "claimed_area": 12.4,
        "recorded_area": 7.8,
        "submission_date": (datetime.now() - timedelta(days=245)).strftime("%Y-%m-%d"),
        "status": "Pending",
        "days_pending": 245,
        "latitude": 22.5976 + random.uniform(-0.05, 0.05),
        "longitude": 75.3023 + random.uniform(-0.05, 0.05)
    }
    claims_list.append(demo_claim_2)

    # Generate remaining claims to reach num_claims
    print(f"Generating {num_claims - 2} synthetic claims with realistic distributions...")
    start_id = 1002
    for i in range(num_claims - 2):
        cid = f"FRA-{start_id}"
        if cid == "FRA-1025":  # Skip already added demo claim ID
            start_id += 1
            cid = f"FRA-{start_id}"
        start_id += 1

        state_item = random.choice(states_data)
        state_name = state_item["name"]
        dist_item = random.choice(state_item["districts"])
        district_name = dist_item["name"]

        status = random.choices(statuses, weights=status_weights)[0]
        days_pending = 0
        if status == "Pending":
            # 80% normal pending (< 150 days), 20% delayed (>= 180 days)
            days_pending = random.randint(15, 149) if random.random() > 0.20 else random.randint(180, 360)

        submission_dt = datetime.now() - timedelta(days=days_pending + random.randint(10, 30))
        submission_date_str = submission_dt.strftime("%Y-%m-%d")

        # Land area generation
        base_area = round(random.uniform(1.0, 15.0), 2)
        # Inject land record mismatch into ~12% of records
        if random.random() < 0.12:
            diff_factor = random.choice([0.4, 0.5, 1.6, 2.2])
            recorded_area = round(base_area * diff_factor, 2)
        else:
            recorded_area = round(base_area + random.uniform(-0.3, 0.3), 2)

        applicant = f"{random.choice(first_names)} {random.choice(last_names)}"
        village = random.choice(villages)
        ctype = random.choice(claim_types)

        lat = dist_item["lat"] + random.uniform(-0.1, 0.1)
        lng = dist_item["lng"] + random.uniform(-0.1, 0.1)

        claims_list.append({
            "claim_id": cid,
            "applicant_name": applicant,
            "state": state_name,
            "district": district_name,
            "village": village,
            "claim_type": ctype,
            "claimed_area": base_area,
            "recorded_area": recorded_area,
            "submission_date": submission_date_str,
            "status": status,
            "days_pending": days_pending,
            "latitude": lat,
            "longitude": lng
        })

    # Save to database
    print("Writing claims to SQLite...")
    claim_objects = []
    for c in claims_list:
        c_obj = ClaimModel(**c)
        db.add(c_obj)
        claim_objects.append(c_obj)

    db.commit()

    # Run AI Anomaly Engine across all claims and save anomalies
    print("Running AI Anomaly Engine on generated database...")
    detector = AnomalyDetector()
    all_cids = [c["claim_id"] for c in claims_list]

    anomalies_count = 0
    for c in claims_list:
        anoms = detector.analyze_claim(c, district_avg_days=65.0, all_claim_ids=all_cids)
        for a in anoms:
            anom_obj = AnomalyModel(
                claim_id=c["claim_id"],
                anomaly_type=a["anomaly_type"],
                severity=a["severity"],
                risk_score=a["risk_score"],
                reason=a["reason"]
            )
            db.add(anom_obj)
            anomalies_count += 1

    db.commit()
    print(f"Successfully generated {len(claims_list)} claims and detected {anomalies_count} anomalies!")

    # Export to CSV & JSON
    data_dir = BASE_DIR / "data"
    csv_file = data_dir / "claims.csv"
    json_file = data_dir / "sample_claims.json"

    print(f"Exporting data to {csv_file}...")
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=claims_list[0].keys())
        writer.writeheader()
        writer.writerows(claims_list)

    print(f"Exporting sample data to {json_file}...")
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(claims_list[:50], f, indent=2)

    db.close()

if __name__ == "__main__":
    generate_data(1000)
