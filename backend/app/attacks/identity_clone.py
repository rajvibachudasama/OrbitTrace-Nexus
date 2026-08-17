import time

class IdentityCloneAttack:
    """
    Attack 2: Identity Clone Attack.
    An adversary injects duplicate telemetry packets using target satellite's ID (e.g. SAT-03)
    from an impossible orbital location.
    """
    def __init__(self, attack_id: str, target_sat_id: str = "SAT-03", intensity: float = 1.0):
        self.attack_id = attack_id
        self.attack_type = "IDENTITY_CLONE"
        self.target_sat_id = target_sat_id
        self.intensity = intensity
        self.started_at = time.time()
        self.is_active = True
        self.stage = "INJECTING_CLONE_TELEMETRY"

    def step(self, constellation, link_manager, trust_engine, anomaly_detector):
        target = constellation.get_satellite(self.target_sat_id)
        if not target:
            return
            
        elapsed = time.time() - self.started_at
        
        # Inject clone conflict: high auth failures & packet tampering
        target.auth_failures_count = min(5, target.auth_failures_count + 1)
        target.tampered_packets_count = min(4, target.tampered_packets_count + 1)
        trust_engine.apply_instant_penalty(self.target_sat_id, 25.0 * self.intensity, "Dual identity observation detected at conflicting GPS ephemeris")
        
        if elapsed < 6.0:
            self.stage = "DUPLICATE_NONCES_DETECTED"
        elif elapsed < 12.0:
            self.stage = "CONFLICTING_ORBITAL_EPHEMERIS_DETECTED"
        else:
            self.stage = "TARGET_NODE_ISOLATED"

    def stop(self, constellation, link_manager, trust_engine):
        self.is_active = False

    def get_status(self) -> dict:
        return {
            "attack_id": self.attack_id,
            "attack_type": self.attack_type,
            "target_satellite_id": self.target_sat_id,
            "stage": self.stage,
            "is_active": self.is_active,
            "elapsed_seconds": round(time.time() - self.started_at, 1)
        }
