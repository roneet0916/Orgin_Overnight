from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class StateModel(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)

    districts = relationship("DistrictModel", back_populates="state_rel")

class DistrictModel(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    state_rel = relationship("StateModel", back_populates="districts")

class ClaimModel(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, unique=True, nullable=False, index=True)
    applicant_name = Column(String, nullable=False)
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)
    village = Column(String, nullable=False)
    claim_type = Column(String, nullable=False)  # Individual / Community
    claimed_area = Column(Float, nullable=False)
    recorded_area = Column(Float, nullable=False)
    submission_date = Column(String, nullable=False)
    status = Column(String, nullable=False, index=True)  # Approved / Pending / Rejected
    days_pending = Column(Integer, nullable=False, default=0)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    anomalies = relationship("AnomalyModel", back_populates="claim_rel", cascade="all, delete-orphan")

class AnomalyModel(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.claim_id"), nullable=False, index=True)
    anomaly_type = Column(String, nullable=False)
    severity = Column(String, nullable=False, index=True)  # HIGH / MEDIUM / LOW
    risk_score = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow)

    claim_rel = relationship("ClaimModel", back_populates="anomalies")
