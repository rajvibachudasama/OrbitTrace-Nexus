import time

class TelemetryDriftAttack:
    """
    Attack 4: Telemetry Drift Attack.
    Subtly ramps up sensor values (e.g. Temperature from 21°C -> 42°C, CPU 32% -> 91%)
    to evade hard threshold alarms while testing behavioural Z-score deviation detectors.
    """
    def __init__(self, attack_id: str, target_sat_id: str = "SAT-02", intensity: float = 1.0):
        self.attack_id = attack_id
        self.attack_type = "TELEMETRY_DRIFT"
        self.target_sat_id = target_sat_id
        self.intensity = intensity
        self.started_at = time.time()
        self.is_active = True
        self.stage = "SUBTLE_GRADIENT_DRIFT"

    def step(self, constellation, link_manager, trust_engine, anomaly_detector):
        target = constellation.get_satellite(self.target_sat_id)
        if not target:
            return
            
        elapsed = time.time() - self.started_at
        
        # Gradually ramp temperature offset from 0 to +18°C
        drift_factor = min(1.0, elapsed / 20.0) * self.intensity
        target.telemetry_gen.drift_temp_offset = drift_factor * 18.0
        target.telemetry_gen.drift_cpu_offset = drift_factor * 45.0
        
        if elapsed < 8.0:
            self.stage = "SUBTLE_GRADIENT_DRIFT_STAGE_1"
        elif elapsed < 16.0:
            self.stage = "BEHAVIOURAL_DRIFT_THRESHOLD_CROSSED"
            trust_engine.apply_instant_penalty(self.target_sat_id, 12.0, "Thermal drift Z-score exceeded 3-sigma")
        else:
            self.stage = "CRITICAL_ANOMALY_CONFIRMED"
            trust_engine.apply_instant_penalty(self.target_sat_id, 25.0, "Anomalous thermal and CPU gradient pattern")

    def stop(self, constellation, link_manager, trust_engine):
        self.is_active = False
        target = constellation.get_satellite(self.target_sat_id)
        if target:
            target.telemetry_gen.drift_temp_offset = 0.0
            target.telemetry_gen.drift_cpu_offset = 0.0

    def get_status(self) -> dict:
        return {
            "attack_id": self.attack_id,
            "attack_type": self.attack_type,
            "target_satellite_id": self.target_sat_id,
            "stage": self.stage,
            "is_active": self.is_active,
            "elapsed_seconds": round(time.time() - self.started_at, 1)
        }
