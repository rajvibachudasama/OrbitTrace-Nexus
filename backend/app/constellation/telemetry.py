import random
import math

class TelemetryGenerator:
    """
    Generates realistic, physically-grounded telemetry for spacecraft digital twins,
    incorporating eclipse thermal dynamics, power drain/charging, and attack perturbations.
    """
    def __init__(self, satellite_id: str):
        self.satellite_id = satellite_id
        
        # Nominal Baselines
        self.base_battery = 88.0 + random.uniform(-4.0, 8.0)
        self.base_cpu = 32.0 + random.uniform(-5.0, 5.0)
        self.base_memory = 38.0 + random.uniform(-4.0, 6.0)
        self.base_temp = 23.5 + random.uniform(-2.0, 2.0)
        self.base_signal = -64.0 + random.uniform(-3.0, 3.0)
        self.base_packet_rate = 120.0 + random.uniform(-10.0, 15.0)
        self.base_loss = 0.4 + random.uniform(-0.2, 0.3)
        self.base_latency = 32.0 + random.uniform(-4.0, 6.0)

        # Current State
        self.battery = self.base_battery
        self.cpu = self.base_cpu
        self.memory = self.base_memory
        self.temperature = self.base_temp
        self.signal = self.base_signal
        self.packet_rate = self.base_packet_rate
        self.packet_loss = self.base_loss
        self.latency = self.base_latency
        
        # Perturbations injected during cyber attacks
        self.drift_temp_offset = 0.0
        self.drift_cpu_offset = 0.0
        self.flood_packet_offset = 0.0
        self.loss_spike_offset = 0.0
        self.latency_spike_offset = 0.0

    def generate(self, is_in_eclipse: bool, mission_state: str, is_isolated: bool) -> dict:
        # 1. Thermal & Battery dynamics
        if is_in_eclipse:
            # Cooling in eclipse, battery discharging slightly
            target_temp = 18.0 + random.uniform(-1.0, 1.0)
            battery_delta = -0.15
        else:
            # Solar warming, battery charging up to 98%
            target_temp = 28.0 + random.uniform(-1.0, 1.0)
            battery_delta = 0.25 if self.battery < 98.0 else 0.0
            
        self.battery = max(20.0, min(100.0, self.battery + battery_delta + random.uniform(-0.05, 0.05)))
        self.temperature += (target_temp - self.temperature) * 0.08 + random.uniform(-0.2, 0.2)
        
        # 2. CPU / Memory dynamic load based on mission
        if mission_state in ["EARTH_IMAGING", "SECURE_BURST"]:
            load_factor = 1.6
        elif mission_state in ["TELEMETRY_RELAY", "INTER_SATELLITE_ROUTING"]:
            load_factor = 1.3
        elif is_isolated or mission_state == "SAFE_HOLD":
            load_factor = 0.6
        else:
            load_factor = 1.0
            
        target_cpu = self.base_cpu * load_factor + random.uniform(-4.0, 4.0)
        target_mem = self.base_memory * (1.0 + (load_factor - 1.0) * 0.5) + random.uniform(-2.0, 2.0)
        
        self.cpu = max(5.0, min(100.0, target_cpu + self.drift_cpu_offset))
        self.memory = max(10.0, min(95.0, target_mem))
        
        # 3. Radio link dynamics
        if is_isolated:
            self.packet_rate = 10.0 + random.uniform(0, 5)
            self.packet_loss = 0.0
            self.latency = 0.0
        else:
            self.packet_rate = max(10.0, self.base_packet_rate * load_factor + self.flood_packet_offset + random.uniform(-8.0, 8.0))
            self.packet_loss = max(0.01, min(99.0, self.base_loss + self.loss_spike_offset + random.uniform(-0.1, 0.2)))
            self.latency = max(5.0, self.base_latency + self.latency_spike_offset + random.uniform(-2.0, 3.0))
            self.signal = max(-98.0, min(-45.0, self.base_signal + random.uniform(-1.5, 1.5)))

        return {
            "battery_level": round(self.battery, 2),
            "cpu_utilization": round(self.cpu, 2),
            "memory_utilization": round(self.memory, 2),
            "temperature": round(self.temperature + self.drift_temp_offset, 2),
            "signal_strength": round(self.signal, 2),
            "packet_tx_rate": round(self.packet_rate, 2),
            "packet_loss_rate": round(self.packet_loss, 2),
            "latency": round(self.latency, 2)
        }

    def reset_perturbations(self):
        self.drift_temp_offset = 0.0
        self.drift_cpu_offset = 0.0
        self.flood_packet_offset = 0.0
        self.loss_spike_offset = 0.0
        self.latency_spike_offset = 0.0
