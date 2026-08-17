import time

class TrustManipulationAttack:
    """
    Attack 3: Trust Manipulation / Sleeper Attack.
    A compromised satellite behaves normally initially, then gradually drops relay packets
    and corrupts telemetry data over time to test dynamic trust decay.
    """
    def __init__(self, attack_id: str, target_sat_id: str = "SAT-04", intensity: float = 1.0):
        self.attack_id = attack_id
        self.attack_type = "TRUST_MANIPULATION"
        self.target_sat_id = target_sat_id
        self.intensity = intensity
        self.started_at = time.time()
        self.is_active = True
        self.stage = "NOMINAL_SLEEPER_PHASE"

    def step(self, constellation, link_manager, trust_engine, anomaly_detector):
        target = constellation.get_satellite(self.target_sat_id)
        if not target:
            return
            
        elapsed = time.time() - self.started_at
        
        if elapsed < 8.0:
            self.stage = "NOMINAL_SLEEPER_PHASE"
            target.telemetry_gen.loss_spike_offset = 1.2
        elif elapsed < 18.0:
            self.stage = "SUBTLE_PACKET_DROPPING"
            target.telemetry_gen.loss_spike_offset = 8.5 * self.intensity
            target.tampered_packets_count = 1
            trust_engine.apply_instant_penalty(self.target_sat_id, 8.0, "Intermittent packet relay corruption")
        else:
            self.stage = "AGGRESSIVE_TRUST_DEGRADATION"
            target.telemetry_gen.loss_spike_offset = 24.0 * self.intensity
            target.tampered_packets_count = 3
            trust_engine.apply_instant_penalty(self.target_sat_id, 20.0, "Persistent packet drop threshold breach")

    def stop(self, constellation, link_manager, trust_engine):
        self.is_active = False
        target = constellation.get_satellite(self.target_sat_id)
        if target:
            target.telemetry_gen.loss_spike_offset = 0.0

    def get_status(self) -> dict:
        return {
            "attack_id": self.attack_id,
            "attack_type": self.attack_type,
            "target_satellite_id": self.target_sat_id,
            "stage": self.stage,
            "is_active": self.is_active,
            "elapsed_seconds": round(time.time() - self.started_at, 1)
        }
