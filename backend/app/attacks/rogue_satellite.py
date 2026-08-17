import time
import datetime

class RogueSatelliteAttack:
    """
    Attack 1: Rogue Satellite Injection.
    Simulates an unauthorized spacecraft (SAT-ROGUE-99) broadcasting spoofed constellation beacons
    and attempting to join the ISL mesh.
    """
    def __init__(self, attack_id: str, intensity: float = 1.0):
        self.attack_id = attack_id
        self.attack_type = "ROGUE_SATELLITE"
        self.intensity = intensity
        self.rogue_id = "SAT-ROGUE-99"
        self.started_at = time.time()
        self.is_active = True
        self.stage = "BEACON_BROADCAST"

    def step(self, constellation, link_manager, trust_engine, anomaly_detector):
        elapsed = time.time() - self.started_at
        
        if elapsed < 5.0:
            self.stage = "BEACON_BROADCAST_SPOOFED_EPHEMERIS"
        elif elapsed < 12.0:
            self.stage = "CHALLENGE_RESPONSE_REJECTED"
            # Target SAT-01 receives invalid handshake
            sat1 = constellation.get_satellite("SAT-01")
            if sat1:
                sat1.auth_failures_count += 1
                trust_engine.apply_instant_penalty("SAT-01", 10.0, "Rogue satellite authentication probe received")
        else:
            self.stage = "ROGUE_NODE_QUARANTINED"
            
    def stop(self, constellation, link_manager, trust_engine):
        self.is_active = False

    def get_status(self) -> dict:
        return {
            "attack_id": self.attack_id,
            "attack_type": self.attack_type,
            "rogue_satellite": self.rogue_id,
            "stage": self.stage,
            "is_active": self.is_active,
            "elapsed_seconds": round(time.time() - self.started_at, 1)
        }
