import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime.datetime

# Satellite Schemas
class SatelliteTelemetry(BaseModel):
    battery_level: float
    cpu_utilization: float
    memory_utilization: float
    temperature: float
    altitude: float
    velocity: float
    signal_strength: float
    packet_tx_rate: float
    packet_loss_rate: float
    latency: float
    latitude: float
    longitude: float
    true_anomaly: float

class SatelliteState(BaseModel):
    id: str
    name: str
    orbital_plane: int
    security_state: str  # TRUSTED, SUSPICIOUS, HIGH_RISK, UNTRUSTED, ISOLATED, RECOVERING
    mission_state: str   # IDLE, EARTH_IMAGING, TELEMETRY_RELAY, etc.
    trust_score: float
    response_level: int
    is_isolated: bool
    telemetry: SatelliteTelemetry
    updated_at: datetime.datetime

class SatelliteSummary(BaseModel):
    id: str
    name: str
    orbital_plane: int
    security_state: str
    mission_state: str
    trust_score: float
    response_level: int
    is_isolated: bool
    battery: float
    cpu: float
    temperature: float
    signal: float
    packet_loss: float
    latency: float

# Trust Schemas
class TrustFactorBreakdown(BaseModel):
    satellite_id: str
    composite_score: float
    auth_factor: float
    integrity_factor: float
    behaviour_factor: float
    reliability_factor: float
    telemetry_factor: float
    reputation_factor: float
    penalties: float
    security_state: str
    behaviour_deviation: float

# ISL Schemas
class LinkState(BaseModel):
    id: str
    source_id: str
    target_id: str
    link_type: str
    status: str
    bandwidth_mbps: float
    latency_ms: float
    packet_loss_rate: float
    signal_snr_db: float
    is_encrypted: bool

# Attack Schemas
class AttackLaunchRequest(BaseModel):
    attack_type: str  # ROGUE_SATELLITE, IDENTITY_CLONE, TRUST_MANIPULATION, TELEMETRY_DRIFT, ROUTE_HIJACK, COORDINATED_ATTACK, ISL_FLOOD
    target_satellite_ids: List[str]
    intensity: Optional[float] = 1.0
    duration_seconds: Optional[int] = 60
    parameters: Optional[Dict[str, Any]] = None

class AttackResponse(BaseModel):
    attack_id: str
    attack_type: str
    target_satellite_ids: List[str]
    status: str
    started_at: datetime.datetime
    message: str

# Alert Schemas
class SecurityAlertSchema(BaseModel):
    id: int
    timestamp: datetime.datetime
    satellite_id: str
    alert_type: str
    severity: str
    confidence: float
    message: str
    details: Optional[Dict[str, Any]] = None
    is_resolved: bool
    action_taken: Optional[str] = None

# Mission Schemas
class MissionTaskSchema(BaseModel):
    id: str
    title: str
    task_type: str
    primary_satellite_id: str
    assigned_satellite_id: str
    target_ground_station: Optional[str] = None
    priority: str
    status: str
    data_volume_gb: float
    migrated_from: Optional[str] = None
    reassigned_at: Optional[datetime.datetime] = None

class MissionContinuityReport(BaseModel):
    mission_availability: float
    total_tasks: int
    running_tasks: int
    migrated_tasks: int
    isolated_satellites: List[str]
    average_trust_score: float
    network_health_index: float
    tasks: List[MissionTaskSchema]
    generated_at: datetime.datetime

# Command & Action Schemas
class SatelliteActionRequest(BaseModel):
    action: str  # ISOLATE, RECOVER, SET_RESPONSE_LEVEL, REKEY, REBOOT, MIGRATE_TASKS
    parameters: Optional[Dict[str, Any]] = None
