import secrets
import hashlib
import time
from typing import Dict, Tuple

class IdentityEngine:
    """
    Manages satellite cryptographic identities, nonces, and challenge-response handshakes.
    """
    def __init__(self):
        self.active_challenges: Dict[str, Tuple[str, float]] = {}  # sat_id -> (challenge_nonce, timestamp)
        self.known_fingerprints: Dict[str, str] = {}               # sat_id -> public_key_fingerprint
        self.observed_identities: Dict[str, list] = {}             # sat_id -> list of observed spatial locations

    def register_satellite_identity(self, sat_id: str, fingerprint: str):
        self.known_fingerprints[sat_id] = fingerprint

    def generate_challenge(self, sat_id: str) -> str:
        nonce = secrets.token_hex(16)
        self.active_challenges[sat_id] = (nonce, time.time())
        return nonce

    def verify_response(self, sat_id: str, response_signature: str, secret_key: str) -> bool:
        if sat_id not in self.active_challenges:
            return False
            
        nonce, created_at = self.active_challenges[sat_id]
        # Challenge expires after 30 seconds
        if time.time() - created_at > 30.0:
            del self.active_challenges[sat_id]
            return False
            
        expected_sig = hashlib.sha256(f"{nonce}:{secret_key}".encode()).hexdigest()
        is_valid = (response_signature == expected_sig)
        del self.active_challenges[sat_id]
        return is_valid

    def check_clone_conflict(self, sat_id: str, observed_lat: float, observed_lng: float, true_lat: float, true_lng: float) -> bool:
        """Detect if identity is simultaneously observed at impossible geographic/orbital distance."""
        dist = ((observed_lat - true_lat) ** 2 + (observed_lng - true_lng) ** 2) ** 0.5
        # If observed position is > 25 degrees away from ephemeris state, identity clone detected
        return dist > 25.0
