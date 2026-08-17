from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts & Threat Feed"])

correlation_engine = None
response_engine = None

def init_alerts_routes(ce, re):
    global correlation_engine, response_engine
    correlation_engine = ce
    response_engine = re

@router.get("/active")
def get_active_threats():
    return correlation_engine.get_all_active_threats()

@router.post("/{threat_id}/resolve")
def resolve_threat(threat_id: int, current_user = Depends(get_current_user)):
    correlation_engine.resolve_threat(threat_id)
    return {"status": "SUCCESS", "message": f"Threat {threat_id} resolved"}

@router.get("/audit-logs")
def get_audit_logs():
    return response_engine.action_history
