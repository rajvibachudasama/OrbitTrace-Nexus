from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.schemas import SatelliteSummary, LinkState, SatelliteActionRequest
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/constellation", tags=["Constellation"])

# Injected by main.py
constellation_manager = None
link_manager = None
response_engine = None
trust_engine = None

def init_managers(cm, lm, re, te):
    global constellation_manager, link_manager, response_engine, trust_engine
    constellation_manager = cm
    link_manager = lm
    response_engine = re
    trust_engine = te

@router.get("/summary")
def get_constellation_summary():
    return constellation_manager.get_fleet_summary()

@router.get("/satellites")
def get_all_satellites():
    return [s.get_full_state() for s in constellation_manager.get_all_satellites()]

@router.get("/satellites/{satellite_id}")
def get_satellite(satellite_id: str):
    sat = constellation_manager.get_satellite(satellite_id)
    if not sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
    return sat.get_full_state()

@router.get("/ground-stations")
def get_ground_stations():
    return constellation_manager.ground_stations

@router.get("/links")
def get_all_links():
    return link_manager.get_all_links_state()

@router.get("/topology")
def get_topology():
    return {
        "satellites": [s.get_full_state() for s in constellation_manager.get_all_satellites()],
        "ground_stations": constellation_manager.ground_stations,
        "links": link_manager.get_all_links_state(),
        "routes": link_manager.router.get_all_routes_to_ground(constellation_manager.satellites)
    }

@router.post("/satellites/{satellite_id}/action")
def execute_satellite_action(satellite_id: str, request: SatelliteActionRequest, current_user = Depends(get_current_user)):
    sat = constellation_manager.get_satellite(satellite_id)
    if not sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
        
    action = request.action.upper()
    if action == "ISOLATE":
        evt = response_engine.manual_isolate(sat, link_manager, f"Manual isolation by {current_user.username}")
        return {"status": "SUCCESS", "message": f"{satellite_id} isolated successfully", "event": evt}
        
    elif action == "RECOVER":
        rec = response_engine.manual_recover(sat, link_manager, trust_engine)
        return {"status": "SUCCESS", "message": f"{satellite_id} Level 5 recovery initiated", "recovery": rec}
        
    elif action == "SET_RESPONSE_LEVEL":
        lvl = request.parameters.get("level", 0) if request.parameters else 0
        sat.set_response_level(int(lvl))
        return {"status": "SUCCESS", "message": f"{satellite_id} response level set to {lvl}"}
        
    elif action == "REKEY":
        sat.rekey_identity()
        return {"status": "SUCCESS", "message": f"{satellite_id} cryptographic keys regenerated"}
        
    elif action == "RESET":
        sat.trust_score = 95.0
        sat.set_security_state("TRUSTED")
        sat.set_response_level(0)
        sat.telemetry_gen.reset_perturbations()
        link_manager.restore_node_links(satellite_id)
        trust_engine.reset_penalties(satellite_id)
        return {"status": "SUCCESS", "message": f"{satellite_id} reset to nominal"}
        
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {action}")

@router.post("/reset-fleet")
def reset_fleet(current_user = Depends(require_role(["ADMIN", "OPERATOR"]))):
    constellation_manager.reset_all()
    for l in link_manager.links.values():
        l.restore()
    return {"status": "SUCCESS", "message": "Fleet reset to nominal state"}
