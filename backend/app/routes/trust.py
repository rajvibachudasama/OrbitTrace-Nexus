from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import TrustHistory
from app.schemas import TrustFactorBreakdown

router = APIRouter(prefix="/trust", tags=["Trust Management"])

constellation_manager = None
trust_engine = None

def init_trust_routes(cm, te):
    global constellation_manager, trust_engine
    constellation_manager = cm
    trust_engine = te

@router.get("/scores")
def get_all_trust_scores():
    scores = {}
    for sat in constellation_manager.get_all_satellites():
        scores[sat.id] = {
            "satellite_id": sat.id,
            "trust_score": round(sat.trust_score, 2),
            "security_state": sat.security_state,
            "is_isolated": sat.is_isolated
        }
    return scores

@router.get("/factors/{satellite_id}", response_model=TrustFactorBreakdown)
def get_trust_factors(satellite_id: str):
    sat = constellation_manager.get_satellite(satellite_id)
    if not sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
    return trust_engine.get_breakdown(satellite_id)

@router.get("/all-factors")
def get_all_trust_factors():
    return [trust_engine.get_breakdown(s.id) for s in constellation_manager.get_all_satellites()]

@router.get("/history/{satellite_id}")
def get_trust_history(satellite_id: str, limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(TrustHistory).filter(TrustHistory.satellite_id == satellite_id).order_by(TrustHistory.timestamp.desc()).limit(limit).all()
    return logs
