import time
from typing import List

class CoordinatedMultiSatAttack:
    """
    Attack 6: Coordinated Multi-Satellite Attack.
    Simultaneously compromises multiple spacecraft (e.g., SAT-02, SAT-04, SAT-05)
    to test constellation segmentation resistance and multi-node correlation.
    """
    def __init__(self, attack_id: str, target_sat_ids: List[str] = None, intensity: float = 1.0):
        self.attack_id = attack_id
        self.attack_type = "COORDINATED_ATTACK"
        self.target_sat_ids = target_sat_ids or ["SAT-02", "SAT-04", "SAT-05"]
        self.intensity = intensity
        self.started_at = time.time()
        self.is_active = True
        self.stage = "MULTI_VECTOR_INITIALIZATION"

    def step(self, constellation, link_manager, trust_engine, anomaly_detector):
        elapsed = time.time() - self.started_at
        
        for sid in self.target_sat_ids:
            sat = constellation.get_satellite(sid)
            if not sat:
                continue
            sat.auth_failures_count = min(4, sat.auth_failures_count + 1)
            sat.telemetry_gen.loss_spike_offset = 12.0 * self.intensity
            trust_engine.apply_instant_penalty(sid, 18.0 * self.intensity, "Synchronized multi-node anomaly trigger")
            
        if elapsed < 8.0:
            self.stage = "SYNCHRONIZED_TELEMETRY_DISRUPTION"
        elif elapsed < 16.0:
            self.stage = "MULTI_PLANE_ISL_SATURATION"
        else:
            self.stage = "CONSTELLATION_CORRELATION_DEFENSE_ACTIVE"

    def stop(self, constellation, link_manager, trust_engine):
        self.is_active = False
        for sid in self.target_sat_ids:
            sat = constellation.get_satellite(sid)
            if sat:
                sat.telemetry_gen.loss_spike_offset = 0.0

    def get_status(self) -> dict:
        return {
            "attack_id": self.attack_id,
            "attack_type": self.attack_type,
            "target_satellite_ids": self.target_sat_ids,
            "stage": self.stage,
            "is_active": self.is_active,
            "elapsed_seconds": round(time.time() - self.started_at, 1)
        }
