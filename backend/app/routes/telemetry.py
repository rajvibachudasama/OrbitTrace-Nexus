from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import TelemetryLog

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

constellation_manager = None

def init_telemetry_routes(cm):
    global constellation_manager
    constellation_manager = cm

@router.get("/live/{satellite_id}")
def get_live_telemetry(satellite_id: str):
    sat = constellation_manager.get_satellite(satellite_id)
    if not sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
    return sat.current_telemetry

@router.get("/history/{satellite_id}")
def get_telemetry_history(satellite_id: str, limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(TelemetryLog).filter(TelemetryLog.satellite_id == satellite_id).order_by(TelemetryLog.timestamp.desc()).limit(limit).all()
    # If DB is empty, return formatted active telemetry snapshot
    if not logs:
        sat = constellation_manager.get_satellite(satellite_id)
        if sat:
            return [{
                "timestamp": sat.last_updated.isoformat(),
                "battery_level": sat.current_telemetry.get("battery_level", 90.0),
                "cpu_utilization": sat.current_telemetry.get("cpu_utilization", 30.0),
                "memory_utilization": sat.current_telemetry.get("memory_utilization", 40.0),
                "temperature": sat.current_telemetry.get("temperature", 24.0),
                "signal_strength": sat.current_telemetry.get("signal_strength", -65.0),
                "packet_loss_rate": sat.current_telemetry.get("packet_loss_rate", 0.4),
                "latency": sat.current_telemetry.get("latency", 30.0),
                "trust_score": sat.trust_score,
                "security_state": sat.security_state,
                "behaviour_deviation": sat.behaviour_deviation
            }]
    return logs
