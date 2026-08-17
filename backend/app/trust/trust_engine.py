import datetime
from typing import Dict, Any, List
from app.config import settings
from app.trust.identity import IdentityEngine
from app.trust.reputation import ReputationEngine
from app.trust.trust_graph import TrustGraph
from app.constellation.satellite import Satellite

class DynamicTrustEngine:
    """
    Central Cybersecurity Engine of OrbitTrace Nexus.
    Continuously computes multi-factor trust scores and manages state transitions.
    
    Formula:
      Trust = 25% Auth + 20% Integrity + 20% Behavior + 15% Reliability + 10% Telemetry + 10% Reputation - Penalties
    """
    def __init__(self):
        self.identity_engine = IdentityEngine()
        self.reputation_engine = ReputationEngine()
        self.trust_graph = TrustGraph()
        
        # Multi-factor weights
        self.w_auth = 0.25
        self.w_integ = 0.20
        self.w_behav = 0.20
        self.w_rel = 0.15
        self.w_telem = 0.10
        self.w_rep = 0.10
        
        self.active_penalties: Dict[str, float] = {}
        self.last_factor_breakdown: Dict[str, dict] = {}

    def evaluate_satellite_trust(self, sat: Satellite, constellation_ids: list) -> dict:
        sat_id = sat.id
        telem = sat.current_telemetry
        
        # 1. Authentication Factor (0 - 100)
        # Penalize repeated auth failures
        auth_factor = max(0.0, 100.0 - (sat.auth_failures_count * 30.0))
        
        # 2. Packet Integrity Factor (0 - 100)
        # Penalize detected tampered/corrupted packets
        integ_factor = max(0.0, 100.0 - (sat.tampered_packets_count * 25.0) - (telem.get("packet_loss_rate", 0) * 0.4))
        
        # 3. Behaviour Consistency Factor (0 - 100)
        # Inversely proportional to behavioural deviation Z-score
        dev = sat.behaviour_deviation
        behav_factor = max(0.0, 100.0 - dev)
        
        # 4. Communication Reliability Factor (0 - 100)
        # Evaluates latency stability and peer acknowledgment consensus
        lat = telem.get("latency", 30.0)
        lat_score = 100.0 if lat < 35.0 else max(10.0, 100.0 - (lat - 35.0) * 1.5)
        loss = telem.get("packet_loss_rate", 0.0)
        loss_score = max(0.0, 100.0 - loss * 2.0)
        peer_score = self.trust_graph.get_neighbor_average_trust(sat_id, constellation_ids)
        rel_factor = (lat_score * 0.4 + loss_score * 0.3 + peer_score * 0.3)
        
        # 5. Telemetry Stability Factor (0 - 100)
        # Evaluates physical plausibility (temp, battery, cpu)
        temp = telem.get("temperature", 24.0)
        cpu = telem.get("cpu_utilization", 30.0)
        temp_score = 100.0 if 15.0 <= temp <= 32.0 else max(0.0, 100.0 - abs(temp - 24.0) * 5.0)
        cpu_score = 100.0 if cpu < 75.0 else max(10.0, 100.0 - (cpu - 75.0) * 3.0)
        telem_factor = (temp_score * 0.6 + cpu_score * 0.4)
        
        # 6. Historical Reputation Factor (0 - 100)
        rep_factor = self.reputation_engine.get_reputation(sat_id)
        
        # Active transient penalties
        penalty = self.active_penalties.get(sat_id, 0.0)
        
        # Raw Composite Score
        raw_composite = (
            self.w_auth * auth_factor +
            self.w_integ * integ_factor +
            self.w_behav * behav_factor +
            self.w_rel * rel_factor +
            self.w_telem * telem_factor +
            self.w_rep * rep_factor
        ) - penalty
        
        composite_score = max(0.0, min(100.0, raw_composite))
        
        # Decay transient penalties slowly
        if penalty > 0:
            self.active_penalties[sat_id] = max(0.0, penalty - 1.5)
            
        # Update historical reputation EMA
        self.reputation_engine.update_reputation(sat_id, composite_score)
        
        # Update satellite trust score
        sat.trust_score = composite_score
        
        # Determine security state transitions
        if not sat.is_isolated and sat.security_state != "RECOVERING":
            if composite_score >= settings.TRUST_THRESHOLD_SUSPICIOUS:
                new_state = "TRUSTED"
            elif composite_score >= settings.TRUST_THRESHOLD_HIGH_RISK:
                new_state = "SUSPICIOUS"
            elif composite_score >= settings.TRUST_THRESHOLD_UNTRUSTED:
                new_state = "HIGH_RISK"
            elif composite_score >= settings.TRUST_THRESHOLD_ISOLATED:
                new_state = "UNTRUSTED"
            else:
                new_state = "ISOLATED"
            sat.set_security_state(new_state)
            
        breakdown = {
            "satellite_id": sat_id,
            "composite_score": round(composite_score, 2),
            "auth_factor": round(auth_factor, 2),
            "integrity_factor": round(integ_factor, 2),
            "behaviour_factor": round(behav_factor, 2),
            "reliability_factor": round(rel_factor, 2),
            "telemetry_factor": round(telem_factor, 2),
            "reputation_factor": round(rep_factor, 2),
            "penalties": round(penalty, 2),
            "security_state": sat.security_state,
            "behaviour_deviation": round(dev, 2)
        }
        
        self.last_factor_breakdown[sat_id] = breakdown
        return breakdown

    def apply_instant_penalty(self, sat_id: str, penalty_amount: float, reason: str = ""):
        current = self.active_penalties.get(sat_id, 0.0)
        self.active_penalties[sat_id] = min(80.0, current + penalty_amount)

    def reset_penalties(self, sat_id: str):
        self.active_penalties[sat_id] = 0.0
        self.reputation_engine.reset_reputation(sat_id, 95.0)

    def get_breakdown(self, sat_id: str) -> dict:
        return self.last_factor_breakdown.get(sat_id, {})
