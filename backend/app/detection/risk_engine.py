from typing import Dict, Any

class RiskEngine:
    """
    Computes real-time systemic cybersecurity risk index (0 - 100) for the constellation.
    """
    def __init__(self):
        pass

    def calculate_constellation_risk(self, satellites: dict, links: dict, active_threats: list) -> dict:
        total_sats = len(satellites)
        if total_sats == 0:
            return {"overall_risk_score": 0.0, "risk_level": "LOW", "resilience_score": 100.0}
            
        unhealthy_sats = sum(1 for s in satellites.values() if s.trust_score < 70.0)
        isolated_sats = sum(1 for s in satellites.values() if s.is_isolated)
        avg_trust = sum(s.trust_score for s in satellites.values()) / total_sats
        
        # Link health
        total_links = len(links)
        offline_links = sum(1 for l in links.values() if l.status in ["ISOLATED", "DEGRADED", "UNSTABLE"])
        link_degradation_ratio = (offline_links / max(1, total_links))
        
        # Threat severity weight
        threat_weight = 0.0
        for t in active_threats:
            sev = t.get("severity", "LOW")
            if sev == "CRITICAL":
                threat_weight += 25.0
            elif sev == "HIGH":
                threat_weight += 15.0
            elif sev == "MEDIUM":
                threat_weight += 8.0
            else:
                threat_weight += 3.0
                
        raw_risk = (
            (100.0 - avg_trust) * 0.35 +
            (unhealthy_sats / total_sats * 100.0) * 0.25 +
            (link_degradation_ratio * 100.0) * 0.15 +
            min(40.0, threat_weight) * 0.25
        )
        
        overall_risk = max(0.0, min(100.0, raw_risk))
        resilience_score = max(0.0, min(100.0, 100.0 - overall_risk * 0.8))
        
        if overall_risk >= 75.0:
            level = "CRITICAL"
        elif overall_risk >= 50.0:
            level = "HIGH"
        elif overall_risk >= 25.0:
            level = "MEDIUM"
        else:
            level = "LOW"
            
        return {
            "overall_risk_score": round(overall_risk, 1),
            "risk_level": level,
            "resilience_score": round(resilience_score, 1),
            "unhealthy_satellite_count": unhealthy_sats,
            "isolated_satellite_count": isolated_sats,
            "active_threat_count": len(active_threats)
        }
