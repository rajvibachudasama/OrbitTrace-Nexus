from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.schemas import MissionContinuityReport

router = APIRouter(prefix="/missions", tags=["Mission Continuity"])

continuity_engine = None
constellation_manager = None
link_manager = None

def init_missions_routes(me, cm, lm):
    global continuity_engine, constellation_manager, link_manager
    continuity_engine = me
    constellation_manager = cm
    link_manager = lm

@router.get("/tasks")
def get_mission_tasks():
    return list(continuity_engine.tasks.values())

@router.get("/continuity-report", response_model=MissionContinuityReport)
def get_mission_continuity_report():
    return continuity_engine.calculate_mission_continuity_metrics(
        constellation_manager.satellites,
        link_manager.router
    )
