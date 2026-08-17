import datetime
from typing import Dict, List, Optional
from app.constellation.satellite import Satellite

class ConstellationManager:
    """
    Manages the fleet of satellites, ground stations, and constellation-wide lifecycle.
    """
    def __init__(self):
        self.satellites: Dict[str, Satellite] = {}
        self.ground_stations = [
            {"id": "GS-ALPHA", "name": "Kourou Ground Station", "latitude": 5.23, "longitude": -52.77, "elevation_m": 15},
            {"id": "GS-BETA", "name": "Svalbard Satellite Station", "latitude": 78.23, "longitude": 15.65, "elevation_m": 450},
            {"id": "GS-GAMMA", "name": "Canberra Deep Space Center", "latitude": -35.31, "longitude": 149.13, "elevation_m": 580}
        ]
        self._initialize_fleet()

    def _initialize_fleet(self):
        fleet_defs = [
            ("SAT-01", "Aegis-1", 1, 0.0),
            ("SAT-02", "Vanguard-2", 1, 90.0),
            ("SAT-03", "Hyperion-3", 1, 180.0),
            ("SAT-04", "Sentinel-4", 1, 270.0),
            ("SAT-05", "Zephyr-5", 2, 45.0),
            ("SAT-06", "Apex-6", 2, 135.0),
            ("SAT-07", "Polaris-7", 2, 225.0),
            ("SAT-08", "Orion-8", 2, 315.0)
        ]
        
        for sat_id, name, plane, anomaly in fleet_defs:
            sat = Satellite(sat_id, name, plane, anomaly)
            self.satellites[sat_id] = sat
            
        # Initial mission distribution
        self.satellites["SAT-01"].mission_state = "GROUND_UPLINK"
        self.satellites["SAT-02"].mission_state = "TELEMETRY_RELAY"
        self.satellites["SAT-03"].mission_state = "EARTH_IMAGING"
        self.satellites["SAT-04"].mission_state = "INTER_SATELLITE_ROUTING"
        self.satellites["SAT-05"].mission_state = "SECURE_BURST"
        self.satellites["SAT-06"].mission_state = "EARTH_IMAGING"
        self.satellites["SAT-07"].mission_state = "TELEMETRY_RELAY"
        self.satellites["SAT-08"].mission_state = "INTER_SATELLITE_ROUTING"

    def tick(self, dt: float = 1.0):
        for sat in self.satellites.values():
            sat.tick(dt)

    def get_satellite(self, sat_id: str) -> Optional[Satellite]:
        return self.satellites.get(sat_id)

    def get_all_satellites(self) -> List[Satellite]:
        return list(self.satellites.values())

    def get_fleet_summary(self) -> dict:
        total = len(self.satellites)
        trusted = sum(1 for s in self.satellites.values() if s.security_state == "TRUSTED")
        suspicious = sum(1 for s in self.satellites.values() if s.security_state == "SUSPICIOUS")
        high_risk = sum(1 for s in self.satellites.values() if s.security_state == "HIGH_RISK")
        untrusted = sum(1 for s in self.satellites.values() if s.security_state == "UNTRUSTED")
        isolated = sum(1 for s in self.satellites.values() if s.is_isolated or s.security_state == "ISOLATED")
        recovering = sum(1 for s in self.satellites.values() if s.security_state == "RECOVERING")
        
        avg_trust = sum(s.trust_score for s in self.satellites.values()) / max(1, total)
        
        return {
            "total_satellites": total,
            "trusted_count": trusted,
            "suspicious_count": suspicious,
            "high_risk_count": high_risk,
            "untrusted_count": untrusted,
            "isolated_count": isolated,
            "recovering_count": recovering,
            "average_trust_score": round(avg_trust, 2),
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

    def reset_all(self):
        """Reset fleet to clean nominal state."""
        self._initialize_fleet()
        for sat in self.satellites.values():
            sat.trust_score = 95.0
            sat.security_state = "TRUSTED"
            sat.is_isolated = False
            sat.response_level = 0
            sat.telemetry_gen.reset_perturbations()
