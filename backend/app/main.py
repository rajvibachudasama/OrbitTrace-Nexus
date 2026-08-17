import asyncio
import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, TelemetryLog, TrustHistory

# 8 Core Modules
from app.constellation.constellation import ConstellationManager
from app.communication.link_manager import LinkManager
from app.trust.trust_engine import DynamicTrustEngine
from app.attacks.attack_manager import AttackManager
from app.detection.behaviour_engine import BehaviourEngine
from app.detection.anomaly_engine import AnomalyDetector
from app.detection.correlation_engine import ThreatCorrelationEngine
from app.detection.risk_engine import RiskEngine
from app.response.response_engine import AutonomousResponseEngine
from app.response.mission_continuity import MissionContinuityEngine
from app.websocket.manager import ws_manager

# Routes
from app.routes import auth, constellation, telemetry, trust, attacks, alerts, missions, analytics

# Initialize Database Schema
Base.metadata.create_all(bind=engine)

# Instantiate Core Singletons
constellation_manager = ConstellationManager()
link_manager = LinkManager()
trust_engine = DynamicTrustEngine()
attack_manager = AttackManager()
behaviour_engine = BehaviourEngine()
anomaly_detector = AnomalyDetector()
correlation_engine = ThreatCorrelationEngine()
risk_engine = RiskEngine()
response_engine = AutonomousResponseEngine()
continuity_engine = response_engine.continuity_engine

# Inject managers into routes
constellation.init_managers(constellation_manager, link_manager, response_engine, trust_engine)
telemetry.init_telemetry_routes(constellation_manager)
trust.init_trust_routes(constellation_manager, trust_engine)
attacks.init_attack_routes(attack_manager, constellation_manager, link_manager, trust_engine)
alerts.init_alerts_routes(correlation_engine, response_engine)
missions.init_missions_routes(continuity_engine, constellation_manager, link_manager)
analytics.init_analytics_routes(risk_engine, constellation_manager, link_manager, correlation_engine, continuity_engine, attack_manager)

# Seed default users
with SessionLocal() as db:
    auth.seed_users_if_needed(db)

async def simulation_loop():
    """
    Continuous real-time cyber-physical digital twin simulation loop (1 Hz).
    """
    tick_count = 0
    while True:
        try:
            tick_count += 1
            dt = settings.SIMULATION_INTERVAL_SECONDS
            
            # 1. Advance Orbital State and Physical Telemetry
            constellation_manager.tick(dt)
            
            # 2. Advance Active Attack Vectors
            attack_manager.step(constellation_manager, link_manager, trust_engine, anomaly_detector)
            
            # 3. Update Inter-Satellite Communication Links & Traffic
            link_manager.tick(constellation_manager.satellites, constellation_manager.ground_stations, dt)
            
            # 4. Behavioural Analysis & Anomaly Detection
            all_anomalies = []
            constellation_ids = list(constellation_manager.satellites.keys())
            
            for sat in constellation_manager.get_all_satellites():
                # Behavioural deviation Z-score
                behaviour_engine.evaluate_deviation(sat)
                
                # Dynamic 6-Factor Trust Score
                trust_engine.evaluate_satellite_trust(sat, constellation_ids)
                
                # Check discrete anomalies
                anoms = anomaly_detector.check_satellite_anomalies(sat, sat.current_telemetry)
                all_anomalies.extend(anoms)
                
            # 5. Threat Correlation & Systemic Risk
            correlated_threats = correlation_engine.correlate(
                all_anomalies,
                constellation_manager.satellites,
                link_manager.links,
                attack_manager.active_attacks
            )
            
            # 6. Autonomous Response & Workload Migration
            response_engine.evaluate_and_respond(
                constellation_manager.satellites,
                link_manager,
                trust_engine,
                correlated_threats
            )
            
            # 7. Persist telemetry and trust snapshots periodically (every 5 seconds)
            if tick_count % 5 == 0:
                try:
                    with SessionLocal() as db:
                        for sat in constellation_manager.get_all_satellites():
                            telem = sat.current_telemetry
                            t_log = TelemetryLog(
                                satellite_id=sat.id,
                                battery_level=telem.get("battery_level", 90.0),
                                cpu_utilization=telem.get("cpu_utilization", 30.0),
                                memory_utilization=telem.get("memory_utilization", 40.0),
                                temperature=telem.get("temperature", 24.0),
                                signal_strength=telem.get("signal_strength", -65.0),
                                packet_loss_rate=telem.get("packet_loss_rate", 0.4),
                                latency=telem.get("latency", 30.0),
                                trust_score=sat.trust_score,
                                security_state=sat.security_state,
                                behaviour_deviation=sat.behaviour_deviation
                            )
                            db.add(t_log)
                            
                            breakdown = trust_engine.get_breakdown(sat.id)
                            th_log = TrustHistory(
                                satellite_id=sat.id,
                                composite_score=breakdown.get("composite_score", sat.trust_score),
                                auth_factor=breakdown.get("auth_factor", 100.0),
                                integrity_factor=breakdown.get("integrity_factor", 100.0),
                                behaviour_factor=breakdown.get("behaviour_factor", 100.0),
                                reliability_factor=breakdown.get("reliability_factor", 100.0),
                                telemetry_factor=breakdown.get("telemetry_factor", 100.0),
                                reputation_factor=breakdown.get("reputation_factor", 100.0),
                                penalties=breakdown.get("penalties", 0.0),
                                security_state=sat.security_state
                            )
                            db.add(th_log)
                        db.commit()
                except Exception as db_err:
                    pass

            # 8. Broadcast Live State to all Space-SOC WebSocket clients
            fleet_summary = constellation_manager.get_fleet_summary()
            risk_summary = risk_engine.calculate_constellation_risk(
                constellation_manager.satellites,
                link_manager.links,
                correlation_engine.get_all_active_threats()
            )
            continuity_summary = continuity_engine.calculate_mission_continuity_metrics(
                constellation_manager.satellites,
                link_manager.router
            )
            
            broadcast_payload = {
                "type": "CONSTELLATION_TICK",
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "fleet_summary": fleet_summary,
                "risk_summary": risk_summary,
                "continuity_summary": continuity_summary,
                "satellites": [s.get_full_state() for s in constellation_manager.get_all_satellites()],
                "ground_stations": constellation_manager.ground_stations,
                "links": link_manager.get_all_links_state(),
                "active_attacks": attack_manager.get_active_attacks_status(),
                "active_threats": correlation_engine.get_all_active_threats()[:8],
                "recent_packets": link_manager.packet_history[:12],
                "recent_actions": response_engine.action_history[:6]
            }
            
            await ws_manager.broadcast(broadcast_payload)
            
        except Exception as loop_err:
            print(f"[Simulation Error]: {loop_err}")
            
        await asyncio.sleep(settings.SIMULATION_INTERVAL_SECONDS)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup background simulation loop
    sim_task = asyncio.create_task(simulation_loop())
    yield
    # Shutdown
    sim_task.cancel()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(constellation.router, prefix=settings.API_PREFIX)
app.include_router(telemetry.router, prefix=settings.API_PREFIX)
app.include_router(trust.router, prefix=settings.API_PREFIX)
app.include_router(attacks.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(missions.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "platform": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "OPERATIONAL",
        "doc_url": "/docs"
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, receive client commands if any
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
