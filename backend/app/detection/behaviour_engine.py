import math
from typing import Dict, Any
from app.constellation.satellite import Satellite

class BehaviourEngine:
    """
    Module 5: Behavioural Detection Engine.
    Evaluates real-time telemetry against each spacecraft's learned baseline profile.
    Computes statistical Z-score deviation without relying only on static hard thresholds.
    """
    def __init__(self):
        pass

    def evaluate_deviation(self, sat: Satellite) -> float:
        """
        Calculate composite behavioral deviation (0 - 100%).
        """
        telem = sat.current_telemetry
        baseline = sat.baseline_profile
        
        feature_deviations = []
        
        # 1. Packet Rate Deviation
        pkt_rate = telem.get("packet_tx_rate", 120.0)
        p_base = baseline["packet_rate"]
        z_pkt = abs(pkt_rate - p_base["mean"]) / max(1.0, p_base["std"])
        feature_deviations.append(min(100.0, z_pkt * 25.0))
        
        # 2. Latency Deviation
        lat = telem.get("latency", 32.0)
        l_base = baseline["latency"]
        z_lat = max(0.0, lat - l_base["mean"]) / max(1.0, l_base["std"])
        feature_deviations.append(min(100.0, z_lat * 30.0))
        
        # 3. CPU Utilization Deviation
        cpu = telem.get("cpu_utilization", 30.0)
        c_base = baseline["cpu"]
        z_cpu = max(0.0, cpu - c_base["mean"]) / max(1.0, c_base["std"])
        feature_deviations.append(min(100.0, z_cpu * 20.0))
        
        # 4. Temperature Thermal Drift Deviation
        temp = telem.get("temperature", 24.0)
        t_base = baseline["temperature"]
        z_temp = abs(temp - t_base["mean"]) / max(1.0, t_base["std"])
        feature_deviations.append(min(100.0, z_temp * 35.0))
        
        # 5. Packet Loss Rate Deviation
        loss = telem.get("packet_loss_rate", 0.4)
        loss_base = baseline["packet_loss"]
        z_loss = max(0.0, loss - loss_base["mean"]) / max(0.1, loss_base["std"])
        feature_deviations.append(min(100.0, z_loss * 40.0))
        
        # Weighted mean deviation
        composite_dev = sum(feature_deviations) / len(feature_deviations)
        sat.behaviour_deviation = max(0.0, min(100.0, composite_dev))
        return sat.behaviour_deviation

    def get_feature_contributions(self, sat: Satellite) -> Dict[str, float]:
        telem = sat.current_telemetry
        baseline = sat.baseline_profile
        
        return {
            "packet_rate": round(telem.get("packet_tx_rate", 0), 1),
            "packet_rate_baseline": round(baseline["packet_rate"]["mean"], 1),
            "latency": round(telem.get("latency", 0), 1),
            "latency_baseline": round(baseline["latency"]["mean"], 1),
            "cpu": round(telem.get("cpu_utilization", 0), 1),
            "cpu_baseline": round(baseline["cpu"]["mean"], 1),
            "temperature": round(telem.get("temperature", 0), 1),
            "temperature_baseline": round(baseline["temperature"]["mean"], 1),
            "packet_loss": round(telem.get("packet_loss_rate", 0), 2),
            "packet_loss_baseline": round(baseline["packet_loss"]["mean"], 2),
            "deviation_score": round(sat.behaviour_deviation, 1)
        }
