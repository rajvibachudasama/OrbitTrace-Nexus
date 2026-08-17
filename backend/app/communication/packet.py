import hmac
import hashlib
import time
import uuid
from typing import Dict, Any, Optional

class Packet:
    """
    Encapsulates constellation communication frames with cryptographic integrity checks.
    """
    def __init__(self, source_id: str, destination_id: str, packet_type: str, payload: Dict[str, Any], secret_key: str):
        self.packet_id = str(uuid.uuid4())[:8]
        self.timestamp = time.time()
        self.source_id = source_id
        self.destination_id = destination_id
        self.packet_type = packet_type  # TELEMETRY, COMMAND, MISSION_DATA, ROUTING_UPDATE, AUTH_CHALLENGE
        self.payload = payload
        self.sequence_number = int(self.timestamp * 1000) % 1000000
        self.ttl = 8
        self.hops = []
        
        # Calculate cryptographic HMAC checksum
        self.checksum = self._calculate_hmac(secret_key)
        self.is_tampered = False

    def _calculate_hmac(self, key: str) -> str:
        data_str = f"{self.source_id}:{self.destination_id}:{self.packet_type}:{self.sequence_number}:{str(sorted(self.payload.items()))}"
        return hmac.new(key.encode(), data_str.encode(), hashlib.sha256).hexdigest()[:16]

    def verify_integrity(self, key: str) -> bool:
        if self.is_tampered:
            return False
        expected = self._calculate_hmac(key)
        return hmac.compare_digest(self.checksum, expected)

    def tamper(self):
        """Simulate MITM tampering attack."""
        self.is_tampered = True
        self.payload["tampered_injection"] = "0xDEADBEEF"
        self.checksum = "corrupted_checksum_bad"

    def to_dict(self) -> dict:
        return {
            "packet_id": self.packet_id,
            "timestamp": self.timestamp,
            "source_id": self.source_id,
            "destination_id": self.destination_id,
            "packet_type": self.packet_type,
            "sequence_number": self.sequence_number,
            "ttl": self.ttl,
            "hops": self.hops,
            "checksum": self.checksum,
            "is_tampered": self.is_tampered
        }
