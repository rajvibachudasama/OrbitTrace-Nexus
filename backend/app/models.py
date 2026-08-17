import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="OPERATOR")  # ADMIN, OPERATOR, ANALYST
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SatelliteModel(Base):
    __tablename__ = "satellites"
    
    id = Column(String(20), primary_key=True, index=True)  # e.g., SAT-01
    name = Column(String(50), nullable=False)              # e.g., Aegis-1
    orbital_plane = Column(Integer, default=1)
    altitude = Column(Float, default=550.0)                # km
    velocity = Column(Float, default=7.56)                 # km/s
    inclination = Column(Float, default=53.0)              # degrees
    true_anomaly = Column(Float, default=0.0)              # degrees
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    
    # State
    security_state = Column(String(20), default="TRUSTED") # TRUSTED, SUSPICIOUS, HIGH_RISK, UNTRUSTED, ISOLATED, RECOVERING
    mission_state = Column(String(30), default="IDLE")     # IDLE, EARTH_IMAGING, TELEMETRY_RELAY, etc.
    trust_score = Column(Float, default=95.0)
    response_level = Column(Integer, default=0)            # 0 to 5
    is_isolated = Column(Boolean, default=False)
    
    # Hardware & Telemetry
    battery_level = Column(Float, default=92.0)            # %
    cpu_utilization = Column(Float, default=32.0)          # %
    memory_utilization = Column(Float, default=40.0)       # %
    temperature = Column(Float, default=24.5)              # °C
    signal_strength = Column(Float, default=-65.0)         # dBm
    packet_tx_rate = Column(Float, default=120.0)          # pkts/s
    packet_loss_rate = Column(Float, default=0.5)          # %
    latency = Column(Float, default=35.0)                  # ms
    
    # Crypto/Security metadata
    public_key_fingerprint = Column(String(64), nullable=True)
    firmware_hash = Column(String(64), nullable=True)
    last_rekey_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    satellite_id = Column(String(20), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    battery_level = Column(Float)
    cpu_utilization = Column(Float)
    memory_utilization = Column(Float)
    temperature = Column(Float)
    signal_strength = Column(Float)
    packet_loss_rate = Column(Float)
    latency = Column(Float)
    trust_score = Column(Float)
    security_state = Column(String(20))
    behaviour_deviation = Column(Float, default=0.0)

class TrustHistory(Base):
    __tablename__ = "trust_history"
    
    id = Column(Integer, primary_key=True, index=True)
    satellite_id = Column(String(20), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    composite_score = Column(Float)
    auth_factor = Column(Float)
    integrity_factor = Column(Float)
    behaviour_factor = Column(Float)
    reliability_factor = Column(Float)
    telemetry_factor = Column(Float)
    reputation_factor = Column(Float)
    penalties = Column(Float, default=0.0)
    security_state = Column(String(20))

class InterSatelliteLink(Base):
    __tablename__ = "isl_links"
    
    id = Column(String(50), primary_key=True, index=True) # e.g. SAT-01-SAT-02
    source_id = Column(String(20), index=True)
    target_id = Column(String(20), index=True)
    link_type = Column(String(20), default="OPTICAL_LASER") # OPTICAL_LASER, RF_KA_BAND
    status = Column(String(20), default="ONLINE")           # ONLINE, DEGRADED, UNSTABLE, SUSPENDED, ISOLATED
    bandwidth_mbps = Column(Float, default=1000.0)
    latency_ms = Column(Float, default=12.0)
    packet_loss_rate = Column(Float, default=0.2)
    signal_snr_db = Column(Float, default=28.5)
    is_encrypted = Column(Boolean, default=True)
    encryption_algorithm = Column(String(30), default="AES-256-GCM")
    last_ping = Column(DateTime, default=datetime.datetime.utcnow)

class SecurityAlert(Base):
    __tablename__ = "security_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    satellite_id = Column(String(20), index=True)
    alert_type = Column(String(50), nullable=False) # e.g. IDENTITY_CLONE, ROGUE_SAT, TELEMETRY_DRIFT
    severity = Column(String(20), nullable=False)   # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=90.0)        # 0 - 100%
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    is_resolved = Column(Boolean, default=False)
    action_taken = Column(String(100), nullable=True)

class AttackRecord(Base):
    __tablename__ = "attack_records"
    
    id = Column(String(50), primary_key=True)       # Attack UUID
    attack_type = Column(String(50), nullable=False)
    target_satellite_ids = Column(JSON, nullable=False)
    status = Column(String(20), default="ACTIVE")   # ACTIVE, DEFENDED, STOPPED, FAILED
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    stopped_at = Column(DateTime, nullable=True)
    intensity = Column(Float, default=1.0)
    parameters = Column(JSON, nullable=True)
    impact_summary = Column(Text, nullable=True)

class MissionTask(Base):
    __tablename__ = "mission_tasks"
    
    id = Column(String(50), primary_key=True)       # TASK-01
    title = Column(String(100), nullable=False)
    task_type = Column(String(40), nullable=False)  # EARTH_IMAGING, TELEMETRY_RELAY, GROUND_UPLINK, SECURE_BURST
    primary_satellite_id = Column(String(20), nullable=False)
    assigned_satellite_id = Column(String(20), nullable=False)
    target_ground_station = Column(String(30), nullable=True)
    priority = Column(String(20), default="HIGH")   # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(20), default="RUNNING")  # RUNNING, MIGRATED, DEGRADED, COMPLETED
    data_volume_gb = Column(Float, default=15.0)
    migrated_from = Column(String(20), nullable=True)
    reassigned_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    operator = Column(String(50), default="SYSTEM")
    action = Column(String(100), nullable=False)
    target = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    result = Column(String(20), default="SUCCESS")
