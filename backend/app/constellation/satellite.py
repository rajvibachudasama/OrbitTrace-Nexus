import hashlib
import secrets
import datetime
from typing import Dict, Any, Optional
from app.constellation.orbital_state import OrbitalState
from app.constellation.telemetry import TelemetryGenerator

class Satellite:
    """
    Complete Digital Twin representation of an individual satellite spacecraft node.
    """
    def __init__(self, satellite_id: str, name: str, orbital_plane: int, anomaly_deg: float):
        self.id = satellite_id
        self.name = name
        self.orbital_plane = orbital_plane
        
        # Subsystems
        self.orbit = OrbitalState(satellite_id, orbital_plane, anomaly_deg)
        self.telemetry_gen = TelemetryGenerator(satellite_id)
        
        # State
        self.security_state = "TRUSTED"  # TRUSTED, SUSPICIOUS, HIGH_RISK, UNTRUSTED, ISOLATED, RECOVERING
        self.mission_state = "IDLE"      # IDLE, EARTH_IMAGING, TELEMETRY_RELAY, GROUND_UPLINK, SECURE_BURST, SAFE_HOLD
        self.trust_score = 95.0
        self.response_level = 0          # 0 to 5
        self.is_isolated = False
        
        # Cryptographic Identity Keystore
        self.public_key_fingerprint = hashlib.sha256(f"PUBKEY_{satellite_id}_{secrets.token_hex(8)}".encode()).hexdigest()[:32]
        self.firmware_hash = hashlib.sha256(f"FW_V2.4.1_{satellite_id}".encode()).hexdigest()[:32]
        self.auth_token_secret = secrets.token_hex(16)
        self.last_rekey_timestamp = datetime.datetime.utcnow()
        self.auth_failures_count = 0
        self.tampered_packets_count = 0
        
        # Baseline Normal Behavioral Profile (Learned mean & std dev)
        self.baseline_profile = {
            "packet_rate": {"mean": self.telemetry_gen.base_packet_rate, "std": 12.0},
            "latency": {"mean": self.telemetry_gen.base_latency, "std": 5.0},
            "cpu": {"mean": self.telemetry_gen.base_cpu, "std": 4.5},
            "temperature": {"mean": self.telemetry_gen.base_temp, "std": 2.5},
            "packet_loss": {"mean": self.telemetry_gen.base_loss, "std": 0.3},
            "commands_per_min": {"mean": 4.0, "std": 1.2}
        }
        
        # Active telemetry cache
        self.current_telemetry: Dict[str, Any] = {}
        self.behaviour_deviation = 0.0
        self.last_updated = datetime.datetime.utcnow()
        
        # Run initial tick
        self.tick(0.0)

    def tick(self, dt: float = 1.0):
        """Simulate one operational step."""
        self.orbit.step(dt)
        orb_state = self.orbit.get_state()
        
        # Generate telemetry
        telem = self.telemetry_gen.generate(
            is_in_eclipse=orb_state["is_in_eclipse"],
            mission_state=self.mission_state,
            is_isolated=self.is_isolated
        )
        
        self.current_telemetry = {**orb_state, **telem}
        self.last_updated = datetime.datetime.utcnow()

    def set_security_state(self, new_state: str, reason: str = ""):
        self.security_state = new_state
        if new_state == "ISOLATED":
            self.is_isolated = True
            self.mission_state = "SAFE_HOLD"
        elif new_state in ["TRUSTED", "RECOVERING"]:
            self.is_isolated = False
            if self.mission_state == "SAFE_HOLD":
                self.mission_state = "IDLE"

    def set_response_level(self, level: int):
        self.response_level = max(0, min(5, level))
        if self.response_level >= 4:
            self.set_security_state("ISOLATED", f"Response level {self.response_level} applied")

    def rekey_identity(self):
        """Execute Level 5 cryptographic re-keying."""
        self.public_key_fingerprint = hashlib.sha256(f"PUBKEY_{self.id}_{secrets.token_hex(8)}".encode()).hexdigest()[:32]
        self.auth_token_secret = secrets.token_hex(16)
        self.last_rekey_timestamp = datetime.datetime.utcnow()
        self.auth_failures_count = 0
        self.tampered_packets_count = 0
        self.telemetry_gen.reset_perturbations()

    def get_full_state(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "orbital_plane": self.orbital_plane,
            "security_state": self.security_state,
            "mission_state": self.mission_state,
            "trust_score": round(self.trust_score, 2),
            "response_level": self.response_level,
            "is_isolated": self.is_isolated,
            "public_key_fingerprint": self.public_key_fingerprint,
            "firmware_hash": self.firmware_hash,
            "auth_failures_count": self.auth_failures_count,
            "tampered_packets_count": self.tampered_packets_count,
            "behaviour_deviation": round(self.behaviour_deviation, 2),
            "telemetry": self.current_telemetry,
            "updated_at": self.last_updated.isoformat()
        }
