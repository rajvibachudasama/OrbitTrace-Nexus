import uuid
from typing import Dict, List, Optional
from app.attacks.rogue_satellite import RogueSatelliteAttack
from app.attacks.identity_clone import IdentityCloneAttack
from app.attacks.trust_manipulation import TrustManipulationAttack
from app.attacks.telemetry_drift import TelemetryDriftAttack
from app.attacks.route_hijack import RouteHijackAttack
from app.attacks.coordinated_attack import CoordinatedMultiSatAttack
from app.attacks.isl_flood import ISLFloodAttack

class AttackManager:
    """
    Module 4: Distributed Attack Simulation Laboratory Manager.
    Orchestrates launching, advancing, and stopping cyber attack simulations.
    """
    def __init__(self):
        self.active_attacks: Dict[str, Any] = {}
        self.attack_history: List[dict] = []

    def launch_attack(self, attack_type: str, target_sat_ids: List[str], intensity: float = 1.0, parameters: dict = None) -> dict:
        attack_id = f"ATK-{str(uuid.uuid4())[:8].upper()}"
        primary_target = target_sat_ids[0] if target_sat_ids else "SAT-03"
        
        if attack_type == "ROGUE_SATELLITE":
            atk = RogueSatelliteAttack(attack_id, intensity)
        elif attack_type == "IDENTITY_CLONE":
            atk = IdentityCloneAttack(attack_id, primary_target, intensity)
        elif attack_type == "TRUST_MANIPULATION":
            atk = TrustManipulationAttack(attack_id, primary_target, intensity)
        elif attack_type == "TELEMETRY_DRIFT":
            atk = TelemetryDriftAttack(attack_id, primary_target, intensity)
        elif attack_type == "ROUTE_HIJACK":
            atk = RouteHijackAttack(attack_id, primary_target, intensity)
        elif attack_type == "COORDINATED_ATTACK":
            atk = CoordinatedMultiSatAttack(attack_id, target_sat_ids, intensity)
        elif attack_type == "ISL_FLOOD":
            atk = ISLFloodAttack(attack_id, primary_target, intensity)
        else:
            raise ValueError(f"Unknown attack type: {attack_type}")
            
        self.active_attacks[attack_id] = atk
        
        record = {
            "attack_id": attack_id,
            "attack_type": attack_type,
            "target_satellite_ids": target_sat_ids,
            "intensity": intensity,
            "status": "ACTIVE"
        }
        self.attack_history.insert(0, record)
        return record

    def step(self, constellation, link_manager, trust_engine, anomaly_detector):
        stopped_ids = []
        for atk_id, atk in self.active_attacks.items():
            if atk.is_active:
                atk.step(constellation, link_manager, trust_engine, anomaly_detector)
            else:
                stopped_ids.append(atk_id)
                
        for sid in stopped_ids:
            del self.active_attacks[sid]

    def stop_attack(self, attack_id: str, constellation, link_manager, trust_engine):
        if attack_id in self.active_attacks:
            atk = self.active_attacks[attack_id]
            atk.stop(constellation, link_manager, trust_engine)
            del self.active_attacks[attack_id]
            for h in self.attack_history:
                if h["attack_id"] == attack_id:
                    h["status"] = "STOPPED"

    def stop_all_attacks(self, constellation, link_manager, trust_engine):
        for atk in list(self.active_attacks.values()):
            atk.stop(constellation, link_manager, trust_engine)
        self.active_attacks.clear()
        for h in self.attack_history:
            if h["status"] == "ACTIVE":
                h["status"] = "STOPPED"

    def get_active_attacks_status(self) -> List[dict]:
        return [atk.get_status() for atk in self.active_attacks.values()]
