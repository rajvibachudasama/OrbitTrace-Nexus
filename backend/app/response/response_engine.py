import datetime
from typing import Dict, Any, List
from app.config import settings
from app.response.isolation import IsolationManager
from app.response.recovery import RecoveryManager
from app.response.mission_continuity import MissionContinuityEngine

class AutonomousResponseEngine:
    """
    Module 7: Autonomous Response & Recovery Engine.
    Implements 6-Tier Autonomous Security Hierarchy:
      Level 0: Monitor (Nominal telemetry)
      Level 1: Observe (High-rate sampling & deep inspection)
      Level 2: Verify (Cryptographic challenge-response handshake)
      Level 3: Restrict (Revoke forwarding & throttle bandwidth)
      Level 4: Isolate (Complete ISL severing & route failover)
      Level 5: Recover (Re-keying & trust rebuild sequence)
    """
    def __init__(self):
        self.isolation_manager = IsolationManager()
        self.recovery_manager = RecoveryManager()
        self.continuity_engine = MissionContinuityEngine()
        self.action_history: List[dict] = []

    def evaluate_and_respond(self, satellites: dict, link_manager, trust_engine, correlated_threats: list) -> List[dict]:
        actions_taken = []
        
        if not settings.AUTO_RESPONSE_ENABLED:
            return actions_taken

        for sat_id, sat in satellites.items():
            if sat.security_state == "RECOVERING":
                self.recovery_manager.tick_recovery(sat, trust_engine, dt=1.0)
                continue

            trust = sat.trust_score
            
            # Level 4: Isolate if Trust < 20 or Critical Threat Correlated
            critical_threats = [t for t in correlated_threats if t.get("satellite_id") == sat_id and t.get("severity") == "CRITICAL"]
            if (trust < settings.TRUST_THRESHOLD_ISOLATED or critical_threats) and not sat.is_isolated:
                reason = critical_threats[0]["message"] if critical_threats else f"Trust score ({trust:.1f}) below isolation threshold ({settings.TRUST_THRESHOLD_ISOLATED})"
                evt = self.isolation_manager.isolate_satellite(sat, link_manager, reason)
                actions_taken.append(evt)
                self.record_action(sat_id, "LEVEL_4_ISOLATION_TRIGGERED", reason)

            # Level 3: Restrict if Trust < 40
            elif trust < settings.TRUST_THRESHOLD_UNTRUSTED and sat.response_level < 3 and not sat.is_isolated:
                sat.set_response_level(3)
                self.record_action(sat_id, "LEVEL_3_RESTRICT_COMMANDS", "Restricted non-critical telemetry and revoked relay priority")
                actions_taken.append({"satellite_id": sat_id, "action": "LEVEL_3_RESTRICT", "trust": trust})

            # Level 2: Verify if Trust < 60
            elif trust < settings.TRUST_THRESHOLD_HIGH_RISK and sat.response_level < 2 and not sat.is_isolated:
                sat.set_response_level(2)
                # Issue crypto challenge
                nonce = trust_engine.identity_engine.generate_challenge(sat_id)
                self.record_action(sat_id, "LEVEL_2_VERIFY_CHALLENGE", f"Issued cryptographic authentication challenge nonce {nonce[:8]}...")
                actions_taken.append({"satellite_id": sat_id, "action": "LEVEL_2_VERIFY", "trust": trust})

            # Level 1: Observe if Trust < 80
            elif trust < settings.TRUST_THRESHOLD_SUSPICIOUS and sat.response_level < 1 and not sat.is_isolated:
                sat.set_response_level(1)
                self.record_action(sat_id, "LEVEL_1_INCREASE_OBSERVABILITY", "Increased telemetry collection rate to 5Hz")
                actions_taken.append({"satellite_id": sat_id, "action": "LEVEL_1_OBSERVE", "trust": trust})

        # Evaluate mission task migrations
        migration_events = self.continuity_engine.evaluate_and_migrate(satellites)
        for m in migration_events:
            self.record_action(m["to_satellite"], "TASK_MIGRATION_EXECUTED", f"Migrated {m['task_title']} from {m['from_satellite']}")
            actions_taken.append(m)

        return actions_taken

    def manual_isolate(self, sat, link_manager, reason: str = "Manual SOC Operator Isolation"):
        evt = self.isolation_manager.isolate_satellite(sat, link_manager, reason)
        self.record_action(sat.id, "MANUAL_ISOLATE", reason)
        return evt

    def manual_recover(self, sat, link_manager, trust_engine):
        rec = self.recovery_manager.start_recovery(sat, link_manager, trust_engine)
        self.record_action(sat.id, "MANUAL_RECOVERY_STARTED", "Operator initiated Level 5 recovery procedure")
        return rec

    def record_action(self, target_id: str, action_type: str, details: str):
        self.action_history.insert(0, {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "target_id": target_id,
            "action_type": action_type,
            "details": details
        })
        if len(self.action_history) > 100:
            self.action_history = self.action_history[:100]
