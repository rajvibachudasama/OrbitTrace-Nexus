import time
from typing import Dict, List

class ReputationEngine:
    """
    Maintains long-term historical reputation with time-weighted exponential decay (EMA).
    """
    def __init__(self, decay_alpha: float = 0.15):
        self.decay_alpha = decay_alpha  # Weight of new observations vs historical memory
        self.reputation_scores: Dict[str, float] = {}
        self.violation_history: Dict[str, List[dict]] = {}

    def get_reputation(self, sat_id: str) -> float:
        return self.reputation_scores.get(sat_id, 95.0)

    def update_reputation(self, sat_id: str, current_performance: float):
        current_rep = self.get_reputation(sat_id)
        # Asymmetric update: Dropping reputation is fast, rebuilding reputation is slow
        if current_performance < current_rep:
            alpha = 0.35  # Drop quickly when behaving poorly
        else:
            alpha = 0.05  # Rebuild slowly
            
        updated = (1.0 - alpha) * current_rep + alpha * current_performance
        self.reputation_scores[sat_id] = max(0.0, min(100.0, updated))

    def record_violation(self, sat_id: str, violation_type: str, severity_penalty: float):
        if sat_id not in self.violation_history:
            self.violation_history[sat_id] = []
        self.violation_history[sat_id].append({
            "type": violation_type,
            "penalty": severity_penalty,
            "timestamp": time.time()
        })
        current_rep = self.get_reputation(sat_id)
        self.reputation_scores[sat_id] = max(0.0, current_rep - severity_penalty)

    def reset_reputation(self, sat_id: str, score: float = 95.0):
        self.reputation_scores[sat_id] = score
        if sat_id in self.violation_history:
            self.violation_history[sat_id] = []
