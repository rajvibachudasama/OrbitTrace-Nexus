import datetime
from typing import Dict, List, Optional, Any

class MissionContinuityEngine:
    """
    Module 8: Mission Continuity Engine.
    Guarantees mission survivability during cyber attacks by dynamically migrating tasks
    and computing constellation mission availability metrics.
    """
    def __init__(self):
        self.tasks: Dict[str, dict] = {}
        self._initialize_default_tasks()

    def _initialize_default_tasks(self):
        default_tasks = [
            {
                "id": "TASK-01",
                "title": "Earth Observation Multispectral Scan (Sector 4)",
                "task_type": "EARTH_IMAGING",
                "primary_satellite_id": "SAT-03",
                "assigned_satellite_id": "SAT-03",
                "target_ground_station": "GS-BETA",
                "priority": "CRITICAL",
                "status": "RUNNING",
                "data_volume_gb": 42.5,
                "migrated_from": None,
                "reassigned_at": None
            },
            {
                "id": "TASK-02",
                "title": "Deep Space Telemetry Relay Backbone",
                "task_type": "TELEMETRY_RELAY",
                "primary_satellite_id": "SAT-02",
                "assigned_satellite_id": "SAT-02",
                "target_ground_station": "GS-ALPHA",
                "priority": "HIGH",
                "status": "RUNNING",
                "data_volume_gb": 18.2,
                "migrated_from": None,
                "reassigned_at": None
            },
            {
                "id": "TASK-03",
                "title": "Synthetic Aperture Radar (Maritime Surveillance)",
                "task_type": "EARTH_IMAGING",
                "primary_satellite_id": "SAT-06",
                "assigned_satellite_id": "SAT-06",
                "target_ground_station": "GS-GAMMA",
                "priority": "HIGH",
                "status": "RUNNING",
                "data_volume_gb": 65.0,
                "migrated_from": None,
                "reassigned_at": None
            },
            {
                "id": "TASK-04",
                "title": "Tactical Secure Burst Communications",
                "task_type": "SECURE_BURST",
                "primary_satellite_id": "SAT-05",
                "assigned_satellite_id": "SAT-05",
                "target_ground_station": "GS-ALPHA",
                "priority": "CRITICAL",
                "status": "RUNNING",
                "data_volume_gb": 8.4,
                "migrated_from": None,
                "reassigned_at": None
            },
            {
                "id": "TASK-05",
                "title": "Polar Meteorological Observation Uplink",
                "task_type": "GROUND_UPLINK",
                "primary_satellite_id": "SAT-07",
                "assigned_satellite_id": "SAT-07",
                "target_ground_station": "GS-BETA",
                "priority": "MEDIUM",
                "status": "RUNNING",
                "data_volume_gb": 12.0,
                "migrated_from": None,
                "reassigned_at": None
            }
        ]
        for t in default_tasks:
            self.tasks[t["id"]] = t

    def evaluate_and_migrate(self, satellites: dict) -> List[dict]:
        """
        Check if any assigned satellites are compromised/isolated, and migrate their workloads.
        """
        migration_events = []
        
        for task_id, task in self.tasks.items():
            curr_sat_id = task["assigned_satellite_id"]
            curr_sat = satellites.get(curr_sat_id)
            
            # If current host is compromised or isolated
            if curr_sat and (curr_sat.is_isolated or curr_sat.trust_score < 40.0 or curr_sat.security_state in ["ISOLATED", "UNTRUSTED"]):
                # Find best alternative candidate
                candidate = self._find_best_candidate(satellites, exclude_id=curr_sat_id, required_plane=curr_sat.orbital_plane)
                if candidate:
                    task["migrated_from"] = curr_sat_id
                    task["assigned_satellite_id"] = candidate.id
                    task["status"] = "MIGRATED"
                    task["reassigned_at"] = datetime.datetime.utcnow().isoformat()
                    
                    # Update candidate satellite mission state
                    candidate.mission_state = task["task_type"]
                    
                    migration_events.append({
                        "task_id": task_id,
                        "task_title": task["title"],
                        "from_satellite": curr_sat_id,
                        "to_satellite": candidate.id,
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    })
                else:
                    task["status"] = "DEGRADED"
                    
            elif curr_sat and curr_sat.security_state == "TRUSTED" and task["status"] == "MIGRATED" and task["migrated_from"] is None:
                task["status"] = "RUNNING"
                
        return migration_events

    def _find_best_candidate(self, satellites: dict, exclude_id: str, required_plane: int):
        # Look for trusted satellite with highest trust and lowest CPU load
        candidates = [
            s for s in satellites.values() 
            if s.id != exclude_id and not s.is_isolated and s.trust_score >= 75.0 and s.security_state == "TRUSTED"
        ]
        if not candidates:
            candidates = [
                s for s in satellites.values() 
                if s.id != exclude_id and not s.is_isolated and s.trust_score >= 60.0
            ]
        if not candidates:
            return None
            
        # Score candidates: prioritize same plane, high trust, lower CPU
        def score_candidate(s):
            plane_bonus = 20.0 if s.orbital_plane == required_plane else 0.0
            cpu_penalty = s.current_telemetry.get("cpu_utilization", 30.0) * 0.3
            return s.trust_score + plane_bonus - cpu_penalty
            
        candidates.sort(key=score_candidate, reverse=True)
        return candidates[0]

    def calculate_mission_continuity_metrics(self, satellites: dict, router) -> dict:
        total = len(self.tasks)
        if total == 0:
            return {"mission_availability": 100.0, "total_tasks": 0, "running_tasks": 0}
            
        operational = sum(1 for t in self.tasks.values() if t["status"] in ["RUNNING", "MIGRATED"])
        migrated = sum(1 for t in self.tasks.values() if t["status"] == "MIGRATED")
        
        # Network Reachability
        trusted_sats = sum(1 for s in satellites.values() if not s.is_isolated and s.trust_score >= 60.0)
        net_ratio = trusted_sats / max(1, len(satellites))
        
        raw_avail = (operational / total) * 0.70 + (net_ratio * 0.30)
        availability_pct = round(max(10.0, min(100.0, raw_avail * 100.0)), 1)
        
        isolated_list = [s.id for s in satellites.values() if s.is_isolated]
        avg_trust = sum(s.trust_score for s in satellites.values()) / max(1, len(satellites))
        
        return {
            "mission_availability": availability_pct,
            "total_tasks": total,
            "running_tasks": operational,
            "migrated_tasks": migrated,
            "isolated_satellites": isolated_list,
            "average_trust_score": round(avg_trust, 1),
            "network_health_index": round(net_ratio * 100.0, 1),
            "tasks": list(self.tasks.values()),
            "generated_at": datetime.datetime.utcnow().isoformat()
        }
