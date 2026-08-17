import datetime
from typing import List, Dict, Any, Optional

class ThreatCorrelationEngine:
    """
    Module 6: Threat Correlation & Risk Engine.
    Correlates individual events across satellites, links, and behavioral engines
    into unified, high-confidence security incidents.
    """
    def __init__(self):
        self.active_threats: List[dict] = []
        self.alert_counter = 1000

    def correlate(self, anomalies: List[dict], satellites: dict, links: dict, active_attacks: list) -> List[dict]:
        new_threats = []
        
        # Group anomalies by satellite
        sat_anomalies: Dict[str, List[dict]] = {}
        for a in anomalies:
            sid = a["satellite_id"]
            if sid not in sat_anomalies:
                sat_anomalies[sid] = []
            sat_anomalies[sid].append(a)
            
        # 1. Correlate Multi-Signal Satellite Takeover / Trust Manipulation
        for sid, a_list in sat_anomalies.items():
            sat = satellites.get(sid)
            if not sat:
                continue
                
            types = {a["type"] for a in a_list}
            
            # Pattern 1: Auth Failure + Tampered Packets -> High-confidence Takeover
            if "AUTHENTICATION_CHALLENGE_FAILED" in types and "PAYLOAD_INTEGRITY_TAMPERING" in types:
                self.alert_counter += 1
                threat = {
                    "id": self.alert_counter,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "satellite_id": sid,
                    "alert_type": "SPACECRAFT_TAKEOVER_ATTEMPT",
                    "severity": "CRITICAL",
                    "confidence": 98.0,
                    "message": f"Correlated Attack: Authentication failure combined with payload tampering on {sid}.",
                    "details": {
                        "contributing_anomalies": list(types),
                        "affected_satellites": [sid],
                        "potential_blast_radius": 2,
                        "mission_impact": "HIGH"
                    },
                    "is_resolved": False,
                    "action_taken": "INITIATE_ISOLATION"
                }
                new_threats.append(threat)

            # Pattern 2: Thermal Drift + CPU Spike -> Telemetry Drift / Payload exploit
            elif "THERMAL_ANOMALY" in types and "CPU_RESOURCE_EXHAUSTION" in types:
                self.alert_counter += 1
                threat = {
                    "id": self.alert_counter,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "satellite_id": sid,
                    "alert_type": "TELEMETRY_DRIFT_EXPLOIT",
                    "severity": "HIGH",
                    "confidence": 88.0,
                    "message": f"Behavioral Drift: Abnormal thermal rise and CPU exhaustion detected on {sid}.",
                    "details": {
                        "contributing_anomalies": list(types),
                        "affected_satellites": [sid],
                        "potential_blast_radius": 1,
                        "mission_impact": "MEDIUM"
                    },
                    "is_resolved": False,
                    "action_taken": "RESTRICT_COMMANDS"
                }
                new_threats.append(threat)
                
            # Pattern 3: Single critical anomaly
            elif any(a["severity"] == "CRITICAL" for a in a_list):
                self.alert_counter += 1
                threat = {
                    "id": self.alert_counter,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "satellite_id": sid,
                    "alert_type": a_list[0]["type"],
                    "severity": "HIGH",
                    "confidence": 82.0,
                    "message": f"Security Alert: Critical behavioral anomaly detected on {sid}.",
                    "details": {
                        "contributing_anomalies": list(types),
                        "affected_satellites": [sid],
                        "potential_blast_radius": 1,
                        "mission_impact": "LOW"
                    },
                    "is_resolved": False,
                    "action_taken": "OBSERVE_TELEMETRY"
                }
                new_threats.append(threat)

        # 2. Correlate Coordinated Constellation-Wide Attack
        compromised_sats = [s_id for s_id, s in satellites.items() if s.trust_score < 60.0 or s.security_state in ["HIGH_RISK", "UNTRUSTED", "ISOLATED"]]
        if len(compromised_sats) >= 2:
            self.alert_counter += 1
            threat = {
                "id": self.alert_counter,
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "satellite_id": "CONSTELLATION_WIDE",
                "alert_type": "COORDINATED_DISTRIBUTED_ATTACK",
                "severity": "CRITICAL",
                "confidence": 95.0,
                "message": f"Coordinated Multi-Satellite Attack detected across nodes: {', '.join(compromised_sats)}.",
                "details": {
                    "affected_satellites": compromised_sats,
                    "potential_blast_radius": len(satellites),
                    "mission_impact": "CRITICAL"
                },
                "is_resolved": False,
                "action_taken": "SEVER_INTER_PLANE_ISL"
            }
            new_threats.append(threat)
            
        # Maintain active threat list (limit to 50 most recent)
        for nt in new_threats:
            # Avoid duplicate unhandled threats for same sat and type
            exists = any(t["satellite_id"] == nt["satellite_id"] and t["alert_type"] == nt["alert_type"] and not t["is_resolved"] for t in self.active_threats)
            if not exists:
                self.active_threats.insert(0, nt)
                
        self.active_threats = self.active_threats[:50]
        return new_threats

    def resolve_threat(self, threat_id: int):
        for t in self.active_threats:
            if t["id"] == threat_id:
                t["is_resolved"] = True

    def get_all_active_threats(self) -> List[dict]:
        return [t for t in self.active_threats if not t["is_resolved"]]
