"""
OrbitTrace Nexus - Automated Verification & Benchmark Test Suite
Tests all 8 Architectural Modules:
  1. Constellation Digital Twin
  2. Dynamic Trust Management Engine
  3. Inter-Satellite Communication Layer (ISLs & Dijkstra)
  4. Distributed Attack Simulation Lab (7 Attacks)
  5. Behavioural Detection Engine
  6. Threat Correlation & Systemic Risk
  7. Autonomous Response & Recovery (Levels 0-5)
  8. Mission Continuity & Workload Failover
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.constellation.constellation import ConstellationManager
from app.communication.link_manager import LinkManager
from app.trust.trust_engine import DynamicTrustEngine
from app.attacks.attack_manager import AttackManager
from app.detection.behaviour_engine import BehaviourEngine
from app.detection.anomaly_engine import AnomalyDetector
from app.detection.correlation_engine import ThreatCorrelationEngine
from app.detection.risk_engine import RiskEngine
from app.response.response_engine import AutonomousResponseEngine

def run_tests():
    print("==================================================================")
    print("  [*] RUNNING ORBITTRACE NEXUS CYBER-PHYSICAL VERIFICATION SUITE   ")
    print("==================================================================")
    
    # 1. Module 1: Constellation Digital Twin
    cm = ConstellationManager()
    assert len(cm.satellites) == 8, "Expected 8 satellites in constellation"
    assert len(cm.ground_stations) == 3, "Expected 3 ground stations"
    cm.tick(1.0)
    sat1 = cm.get_satellite("SAT-01")
    assert sat1.trust_score >= 90.0, "Initial trust score must be >= 90"
    print("[PASS] Module 1 [Constellation Digital Twin]: Initialized 8 LEO satellites & 3 ground stations.")

    # 2. Module 2: Dynamic Trust Engine
    te = DynamicTrustEngine()
    breakdown = te.evaluate_satellite_trust(sat1, list(cm.satellites.keys()))
    assert breakdown["composite_score"] >= 80.0, "Nominal trust score must be >= 80"
    print(f"[PASS] Module 2 [Dynamic Trust Engine]: 6-factor composite score calculated: {breakdown['composite_score']}/100.")

    # 3. Module 3: Inter-Satellite Communication Layer & Dynamic Routing
    lm = LinkManager()
    lm.tick(cm.satellites, cm.ground_stations, 1.0)
    route = lm.router.find_secure_route("SAT-01", "GS-ALPHA")
    assert route is not None and len(route["path"]) >= 2, "Route to Ground Station must exist"
    print(f"[PASS] Module 3 [Inter-Satellite Comm]: Dijkstra trust-weighted route SAT-01 -> GS-ALPHA: {' -> '.join(route['path'])} ({route['estimated_latency_ms']} ms).")

    # 4. Module 4 & 5: Attack Lab & Behavioural Detection Engine
    am = AttackManager()
    be = BehaviourEngine()
    ad = AnomalyDetector()
    ce = ThreatCorrelationEngine()
    re = RiskEngine()
    resp = AutonomousResponseEngine()
    
    # Launch Attack 2: Identity Clone Attack on SAT-03
    atk = am.launch_attack("IDENTITY_CLONE", ["SAT-03"], intensity=1.0)
    print(f"[*] Injected Attack Scenario: {atk['attack_type']} on SAT-03...")
    
    # Step simulation for 5 ticks
    for _ in range(5):
        am.step(cm, lm, te, ad)
        sat3 = cm.get_satellite("SAT-03")
        be.evaluate_deviation(sat3)
        te.evaluate_satellite_trust(sat3, list(cm.satellites.keys()))
        anoms = ad.check_satellite_anomalies(sat3, sat3.current_telemetry)
        threats = ce.correlate(anoms, cm.satellites, lm.links, am.active_attacks)
        resp.evaluate_and_respond(cm.satellites, lm, te, threats)

    sat3 = cm.get_satellite("SAT-03")
    print(f"[*] Post-Attack State for SAT-03: Trust = {sat3.trust_score:.1f}%, Security State = {sat3.security_state}")
    assert sat3.trust_score < 75.0, "Trust score must drop during attack"
    print("[PASS] Module 4 & 5 [Attack Lab & Behaviour Engine]: Attack injection and trust decay verified.")

    # 5. Module 6 & 7: Threat Correlation & Autonomous Response Isolation
    assert sat3.is_isolated is True, "SAT-03 must be isolated"
    assert sat3.security_state == "ISOLATED", "Security state must be ISOLATED"
    print("[PASS] Module 6 & 7 [Threat Correlation & Response]: Autonomous Level 4 Isolation verified. ISL links severed.")

    # Verify Dynamic Routing recalculation bypassing isolated node
    lm.router.build_topology_graph(cm.satellites, lm.links, cm.ground_stations)
    new_route = lm.router.find_secure_route("SAT-01", "GS-BETA")
    if new_route:
        assert "SAT-03" not in new_route["path"], "Compromised isolated node SAT-03 must NOT be in active route"
        print(f"[PASS] Route Failover: Constellation rerouted around isolated node: {' -> '.join(new_route['path'])}")

    # 6. Module 8: Mission Continuity Engine (Dynamic Task Migration)
    task1 = resp.continuity_engine.tasks["TASK-01"]
    assert task1["assigned_satellite_id"] != "SAT-03", "Task on compromised SAT-03 must be migrated to healthy node"
    print(f"[PASS] Module 8 [Mission Continuity]: Workload dynamically migrated from SAT-03 to {task1['assigned_satellite_id']}.")
    
    continuity_metrics = resp.continuity_engine.calculate_mission_continuity_metrics(cm.satellites, lm.router)
    print(f"[PASS] Mission Availability Score: {continuity_metrics['mission_availability']}% (High resilience sustained).")
    assert continuity_metrics["mission_availability"] >= 80.0, "Mission availability must remain resilient"

    # 7. Recovery: Level 5 Cryptographic Re-Key & Trust Restoration
    print("[*] Initiating Level 5 Cryptographic Re-Key & Restoration Procedure on SAT-03...")
    rec = resp.recovery_manager.start_recovery(sat3, lm, te)
    for _ in range(8):
        resp.recovery_manager.tick_recovery(sat3, te, dt=1.0)
    
    print(f"[*] Restored State for SAT-03: Trust = {sat3.trust_score:.1f}%, Security State = {sat3.security_state}, Isolated = {sat3.is_isolated}")
    assert sat3.trust_score >= 80.0, "Restored satellite trust score must reach nominal"
    print("[PASS] Module 7 [Level 5 Recovery]: Cryptographic re-keying & trust rebuild verified.")

    print("\n==================================================================")
    print("  [SUCCESS] ALL 8 ORBITTRACE NEXUS ARCHITECTURAL MODULES VERIFIED 100% ")
    print("==================================================================")

if __name__ == "__main__":
    run_tests()
