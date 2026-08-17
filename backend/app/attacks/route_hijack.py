import time

class RouteHijackAttack:
    """
    Attack 5: Route Hijacking Attack.
    A malicious satellite broadcasts false 0-cost routing advertisements to intercept,
    blackhole, or eavesdrop on constellation mission communications.
    """
    def __init__(self, attack_id: str, target_sat_id: str = "SAT-05", intensity: float = 1.0):
        self.attack_id = attack_id
        self.attack_type = "ROUTE_HIJACK"
        self.target_sat_id = target_sat_id
        self.intensity = intensity
        self.started_at = time.time()
        self.is_active = True
        self.stage = "BROADCASTING_SPOOFED_ROUTING_TABLES"

    def step(self, constellation, link_manager, trust_engine, anomaly_detector):
        target = constellation.get_satellite(self.target_sat_id)
        if not target:
            return
            
        elapsed = time.time() - self.started_at
        
        # Corrupt peer trust scores for this satellite as neighbors detect bogus routing tables
        for sat in constellation.get_all_satellites():
            if sat.id != self.target_sat_id:
                trust_engine.trust_graph.update_peer_trust(sat.id, self.target_sat_id, ack_success=False, latency_ms=120.0)
                
        trust_engine.apply_instant_penalty(self.target_sat_id, 15.0 * self.intensity, "Bogus zero-cost routing advertisement detected")
        
        if elapsed < 6.0:
            self.stage = "SPOOFED_ZERO_COST_ADVERTISEMENT"
        elif elapsed < 14.0:
            self.stage = "ROUTING_ANOMALY_CORRELATED"
        else:
            self.stage = "MALICIOUS_ROUTE_BLACKHOLED"

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
