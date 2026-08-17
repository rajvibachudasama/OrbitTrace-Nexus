import math
from typing import Dict, Tuple

class TrustGraph:
    """
    Maintains pairwise peer-to-peer trust matrix between satellites.
    A satellite evaluates its neighbors based on relayed packets and acknowledgment success.
    """
    def __init__(self):
        # (observer_id, target_id) -> pairwise trust score (0 - 100)
        self.peer_trust: Dict[Tuple[str, str], float] = {}

    def update_peer_trust(self, observer_id: str, target_id: str, ack_success: bool, latency_ms: float):
        key = (observer_id, target_id)
        current = self.peer_trust.get(key, 95.0)
        
        if ack_success:
            perf = 100.0 if latency_ms < 25.0 else max(70.0, 100.0 - (latency_ms - 25.0))
            updated = current * 0.9 + perf * 0.1
        else:
            updated = current - 15.0 # Dropped or corrupted packet penalty
            
        self.peer_trust[key] = max(0.0, min(100.0, updated))

    def get_pairwise_trust(self, observer_id: str, target_id: str) -> float:
        return self.peer_trust.get((observer_id, target_id), 95.0)

    def get_neighbor_average_trust(self, target_id: str, constellation_ids: list) -> float:
        scores = [self.peer_trust.get((obs, target_id), 95.0) for obs in constellation_ids if obs != target_id]
        return sum(scores) / max(1, len(scores))
