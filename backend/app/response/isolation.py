import datetime
from typing import Dict, Any

class IsolationManager:
    """
    Executes quarantine and isolation protocols on suspicious or compromised spacecraft.
    """
    def __init__(self):
        self.isolation_events = []

    def isolate_satellite(self, sat, link_manager, reason: str = "") -> dict:
        sat_id = sat.id
        sat.set_security_state("ISOLATED", reason)
        sat.set_response_level(4)
        
        # Sever all ISL links
        link_manager.sever_node_links(sat_id)
        
        event = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "satellite_id": sat_id,
            "action": "NODE_ISOLATION_APPLIED",
            "reason": reason or "Trust score below critical threshold or high-risk threat correlation",
            "links_severed": True,
            "mission_state": sat.mission_state
        }
        self.isolation_events.append(event)
        return event

    def unquarantine_satellite(self, sat, link_manager) -> dict:
        sat_id = sat.id
        sat.set_security_state("RECOVERING")
        sat.set_response_level(5)
        
        # Restore ISL links
        link_manager.restore_node_links(sat_id)
        
        event = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "satellite_id": sat_id,
            "action": "QUARANTINE_LIFTED_RECOVERY_STARTED",
            "status": "RECOVERING"
        }
        self.isolation_events.append(event)
        return event
