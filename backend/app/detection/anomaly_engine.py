import datetime
from typing import List, Dict, Any

class AnomalyDetector:
    """
    Detects specific discrete cybersecurity anomaly patterns in constellation operations.
    """
    def __init__(self):
        self.anomaly_log: List[dict] = []

    def check_satellite_anomalies(self, sat, telemetry: dict) -> List[dict]:
        anomalies = []
        
        # 1. Thermal drift alert
        if telemetry.get("temperature", 24.0) > 35.0:
            anomalies.append({
                "type": "THERMAL_ANOMALY",
                "severity": "MEDIUM" if telemetry["temperature"] < 40.0 else "HIGH",
                "metric": "temperature",
                "value": telemetry["temperature"],
                "threshold": 35.0,
                "satellite_id": sat.id
            })
            
        # 2. CPU flood anomaly
        if telemetry.get("cpu_utilization", 30.0) > 85.0:
            anomalies.append({
                "type": "CPU_RESOURCE_EXHAUSTION",
                "severity": "HIGH",
                "metric": "cpu_utilization",
                "value": telemetry["cpu_utilization"],
                "threshold": 85.0,
                "satellite_id": sat.id
            })
            
        # 3. High packet loss anomaly
        if telemetry.get("packet_loss_rate", 0.4) > 15.0:
            anomalies.append({
                "type": "LINK_DEGRADATION_ANOMALY",
                "severity": "HIGH",
                "metric": "packet_loss_rate",
                "value": telemetry["packet_loss_rate"],
                "threshold": 15.0,
                "satellite_id": sat.id
            })
            
        # 4. Authentication failure count
        if sat.auth_failures_count >= 2:
            anomalies.append({
                "type": "AUTHENTICATION_CHALLENGE_FAILED",
                "severity": "CRITICAL",
                "metric": "auth_failures_count",
                "value": sat.auth_failures_count,
                "threshold": 2,
                "satellite_id": sat.id
            })

        # 5. Tampered packet detection
        if sat.tampered_packets_count > 0:
            anomalies.append({
                "type": "PAYLOAD_INTEGRITY_TAMPERING",
                "severity": "CRITICAL",
                "metric": "tampered_packets_count",
                "value": sat.tampered_packets_count,
                "threshold": 1,
                "satellite_id": sat.id
            })
            
        return anomalies
