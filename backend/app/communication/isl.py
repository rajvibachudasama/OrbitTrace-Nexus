import random
import datetime

class ISLLink:
    """
    Simulates a directional Inter-Satellite Link (Optical Laser or Ka-band RF).
    """
    def __init__(self, source_id: str, target_id: str, link_type: str = "OPTICAL_LASER"):
        self.id = f"{source_id}-{target_id}"
        self.source_id = source_id
        self.target_id = target_id
        self.link_type = link_type  # OPTICAL_LASER, RF_KA_BAND
        
        # Physical Characteristics
        self.nominal_bandwidth = 1000.0 if link_type == "OPTICAL_LASER" else 300.0 # Mbps
        self.nominal_latency = 12.0 if link_type == "OPTICAL_LASER" else 28.0      # ms
        self.nominal_loss = 0.15                                                   # %
        self.nominal_snr = 30.0                                                    # dB
        
        # Real-time state
        self.bandwidth_mbps = self.nominal_bandwidth
        self.latency_ms = self.nominal_latency
        self.packet_loss_rate = self.nominal_loss
        self.signal_snr_db = self.nominal_snr
        self.status = "ONLINE"  # ONLINE, DEGRADED, UNSTABLE, SUSPENDED, ISOLATED
        self.is_encrypted = True
        self.encryption_algorithm = "AES-256-GCM"
        
        # Cyber attack offsets
        self.flood_load_mbps = 0.0
        self.artificial_loss = 0.0
        self.is_severed = False

    def update_link_quality(self, source_isolated: bool, target_isolated: bool, dt: float = 1.0):
        if self.is_severed or source_isolated or target_isolated:
            self.status = "ISOLATED"
            self.bandwidth_mbps = 0.0
            self.packet_loss_rate = 100.0
            self.latency_ms = 999.0
            return

        # Natural fluctuation
        jitter = random.uniform(-0.8, 0.8)
        snr_var = random.uniform(-0.5, 0.5)
        
        effective_load = self.flood_load_mbps
        if effective_load > 800.0:
            self.status = "DEGRADED" if effective_load < 1500.0 else "UNSTABLE"
            self.latency_ms = self.nominal_latency + (effective_load / 50.0) + jitter
            self.packet_loss_rate = min(85.0, self.nominal_loss + (effective_load / 100.0) + self.artificial_loss)
            self.bandwidth_mbps = max(50.0, self.nominal_bandwidth - (effective_load * 0.4))
        else:
            self.status = "ONLINE"
            self.latency_ms = max(5.0, self.nominal_latency + jitter)
            self.packet_loss_rate = max(0.01, self.nominal_loss + self.artificial_loss + random.uniform(-0.05, 0.05))
            self.bandwidth_mbps = self.nominal_bandwidth + random.uniform(-20.0, 20.0)
            
        self.signal_snr_db = max(10.0, self.nominal_snr + snr_var)

    def sever(self):
        self.is_severed = True
        self.status = "ISOLATED"

    def restore(self):
        self.is_severed = False
        self.status = "ONLINE"
        self.flood_load_mbps = 0.0
        self.artificial_loss = 0.0

    def get_state(self) -> dict:
        return {
            "id": self.id,
            "source_id": self.source_id,
            "target_id": self.target_id,
            "link_type": self.link_type,
            "status": self.status,
            "bandwidth_mbps": round(self.bandwidth_mbps, 1),
            "latency_ms": round(self.latency_ms, 2),
            "packet_loss_rate": round(self.packet_loss_rate, 2),
            "signal_snr_db": round(self.signal_snr_db, 1),
            "is_encrypted": self.is_encrypted,
            "is_severed": self.is_severed
        }
