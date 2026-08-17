import time

class ISLFloodAttack:
    """
    Attack 7: Communication Flood Attack (ISL DoS).
    A compromised satellite floods an optical cross-link with 10,000 pps,
    saturating buffer queues and spiking latency to degrade ISL performance.
    """
    def __init__(self, attack_id: str, target_sat_id: str = "SAT-01", intensity: float = 1.0):
        self.attack_id = attack_id
        self.attack_type = "ISL_FLOOD"
        self.target_sat_id = target_sat_id
        self.intensity = intensity
        self.started_at = time.time()
        self.is_active = True
        self.stage = "PACKET_FLOOD_BURST_INITIATED"

    def step(self, constellation, link_manager, trust_engine, anomaly_detector):
        target = constellation.get_satellite(self.target_sat_id)
        if not target:
            return
            
        elapsed = time.time() - self.started_at
        
        # Inject flood packet rate and link load
        target.telemetry_gen.flood_packet_offset = 800.0 * self.intensity
        target.telemetry_gen.latency_spike_offset = 65.0 * self.intensity
        
        # Flood links connected to target
        for link in link_manager.links.values():
            if link.source_id == self.target_sat_id or link.target_id == self.target_sat_id:
                link.flood_load_mbps = 1200.0 * self.intensity
                
        trust_engine.apply_instant_penalty(self.target_sat_id, 14.0 * self.intensity, "Excessive ISL traffic flood detected")
        
        if elapsed < 6.0:
            self.stage = "BUFFER_QUEUE_SATURATION"
        elif elapsed < 14.0:
            self.stage = "LINK_BANDWIDTH_EXHAUSTED"
        else:
            self.stage = "AUTO_RATE_LIMITING_APPLIED"

    def stop(self, constellation, link_manager, trust_engine):
        self.is_active = False
        target = constellation.get_satellite(self.target_sat_id)
        if target:
            target.telemetry_gen.flood_packet_offset = 0.0
            target.telemetry_gen.latency_spike_offset = 0.0
            
        for link in link_manager.links.values():
            if link.source_id == self.target_sat_id or link.target_id == self.target_sat_id:
                link.flood_load_mbps = 0.0

    def get_status(self) -> dict:
        return {
            "attack_id": self.attack_id,
            "attack_type": self.attack_type,
            "target_satellite_id": self.target_sat_id,
            "stage": self.stage,
            "is_active": self.is_active,
            "elapsed_seconds": round(time.time() - self.started_at, 1)
        }
