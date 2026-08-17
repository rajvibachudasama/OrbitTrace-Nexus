from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.schemas import AttackLaunchRequest, AttackResponse
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/attacks", tags=["Attack Simulation Lab"])

attack_manager = None
constellation_manager = None
link_manager = None
trust_engine = None

def init_attack_routes(am, cm, lm, te):
    global attack_manager, constellation_manager, link_manager, trust_engine
    attack_manager = am
    constellation_manager = cm
    link_manager = lm
    trust_engine = te

@router.get("/scenarios")
def get_attack_scenarios():
    return [
        {
            "id": "ROGUE_SATELLITE",
            "name": "Rogue Satellite Injection",
            "description": "Unauthorized spacecraft attempts to join the constellation by broadcasting spoofed beacons and ephemeris.",
            "target_type": "SINGLE",
            "default_targets": ["SAT-01"],
            "difficulty": "MEDIUM"
        },
        {
            "id": "IDENTITY_CLONE",
            "name": "Identity Clone Attack",
            "description": "Adversary injects spoofed telemetry claiming target satellite identity from a conflicting orbital location.",
            "target_type": "SINGLE",
            "default_targets": ["SAT-03"],
            "difficulty": "HIGH"
        },
        {
            "id": "TRUST_MANIPULATION",
            "name": "Trust Manipulation / Sleeper Attack",
            "description": "Satellite behaves normally initially and gradually drops relay packets and corrupts payload hashes.",
            "target_type": "SINGLE",
            "default_targets": ["SAT-04"],
            "difficulty": "HIGH"
        },
        {
            "id": "TELEMETRY_DRIFT",
            "name": "Telemetry Sensor Drift Attack",
            "description": "Subtly drifts thermal and power sensors over time to evade static alarms and test Z-score deviation detectors.",
            "target_type": "SINGLE",
            "default_targets": ["SAT-02"],
            "difficulty": "MEDIUM"
        },
        {
            "id": "ROUTE_HIJACK",
            "name": "Route Hijacking Attack",
            "description": "Compromised node advertises false 0-cost routing paths to hijack or blackhole constellation traffic.",
            "target_type": "SINGLE",
            "default_targets": ["SAT-05"],
            "difficulty": "HIGH"
        },
        {
            "id": "COORDINATED_ATTACK",
            "name": "Coordinated Multi-Satellite Attack",
            "description": "Simultaneously attacks multiple spacecraft across orbital planes to attempt constellation segmentation.",
            "target_type": "MULTIPLE",
            "default_targets": ["SAT-02", "SAT-04", "SAT-05"],
            "difficulty": "CRITICAL"
        },
        {
            "id": "ISL_FLOOD",
            "name": "Communication Flood (ISL DoS)",
            "description": "Floods target optical laser cross-link with 10,000 pps, saturating buffer queues and spiking latency.",
            "target_type": "SINGLE",
            "default_targets": ["SAT-01"],
            "difficulty": "MEDIUM"
        }
    ]

@router.post("/launch")
def launch_attack(request: AttackLaunchRequest, current_user = Depends(require_role(["ADMIN", "OPERATOR"]))):
    try:
        record = attack_manager.launch_attack(
            attack_type=request.attack_type,
            target_sat_ids=request.target_satellite_ids,
            intensity=request.intensity or 1.0,
            parameters=request.parameters
        )
        return {
            "status": "SUCCESS",
            "message": f"Attack {request.attack_type} launched successfully",
            "attack": record
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/active")
def get_active_attacks():
    return attack_manager.get_active_attacks_status()

@router.post("/{attack_id}/stop")
def stop_attack(attack_id: str, current_user = Depends(require_role(["ADMIN", "OPERATOR"]))):
    attack_manager.stop_attack(attack_id, constellation_manager, link_manager, trust_engine)
    return {"status": "SUCCESS", "message": f"Attack {attack_id} stopped"}

@router.post("/stop-all")
def stop_all_attacks(current_user = Depends(require_role(["ADMIN", "OPERATOR"]))):
    attack_manager.stop_all_attacks(constellation_manager, link_manager, trust_engine)
    return {"status": "SUCCESS", "message": "All attacks stopped"}
