import random
import datetime
from typing import Dict, List, Optional
from app.communication.isl import ISLLink
from app.communication.packet import Packet
from app.communication.routing import ConstellationRouter

class LinkManager:
    """
    Constructs the constellation mesh network topology, updates link quality metrics,
    and runs packet simulation bursts.
    """
    def __init__(self):
        self.links: Dict[str, ISLLink] = {}
        self.router = ConstellationRouter()
        self.packet_history: List[dict] = []
        self.max_packet_history = 100
        self._initialize_isl_topology()

    def _initialize_isl_topology(self):
        # Intra-plane links (Ring topology per orbital plane)
        # Plane 1: SAT-01 <-> SAT-02 <-> SAT-03 <-> SAT-04 <-> SAT-01
        plane1_pairs = [
            ("SAT-01", "SAT-02"),
            ("SAT-02", "SAT-03"),
            ("SAT-03", "SAT-04"),
            ("SAT-04", "SAT-01")
        ]
        
        # Plane 2: SAT-05 <-> SAT-06 <-> SAT-07 <-> SAT-08 <-> SAT-05
        plane2_pairs = [
            ("SAT-05", "SAT-06"),
            ("SAT-06", "SAT-07"),
            ("SAT-07", "SAT-08"),
            ("SAT-08", "SAT-05")
        ]
        
        # Inter-plane cross-links (Optical laser cross-connects between planes)
        cross_plane_pairs = [
            ("SAT-01", "SAT-05"),
            ("SAT-02", "SAT-06"),
            ("SAT-03", "SAT-07"),
            ("SAT-04", "SAT-08")
        ]
        
        all_pairs = plane1_pairs + plane2_pairs + cross_plane_pairs
        
        for s, t in all_pairs:
            # Create bidirectional links
            link_fwd = ISLLink(s, t, "OPTICAL_LASER")
            link_rev = ISLLink(t, s, "OPTICAL_LASER")
            self.links[link_fwd.id] = link_fwd
            self.links[link_rev.id] = link_rev

    def tick(self, satellites: dict, ground_stations: list, dt: float = 1.0):
        # Update link states
        for link in self.links.values():
            s_node = satellites.get(link.source_id)
            t_node = satellites.get(link.target_id)
            s_iso = s_node.is_isolated if s_node else False
            t_iso = t_node.is_isolated if t_node else False
            link.update_link_quality(s_iso, t_iso, dt)
            
        # Rebuild routing graph
        self.router.build_topology_graph(satellites, self.links, ground_stations)
        
        # Simulate background packet transmissions
        self._simulate_packets(satellites)

    def _simulate_packets(self, satellites: dict):
        # Generate 2-4 synthetic mission / telemetry packets per tick
        active_sats = [s_id for s_id, s in satellites.items() if not s.is_isolated]
        if len(active_sats) < 2:
            return
            
        for _ in range(random.randint(1, 3)):
            src = random.choice(active_sats)
            dst = random.choice([s for s in active_sats if s != src] + ["GS-ALPHA", "GS-BETA", "GS-GAMMA"])
            
            src_sat = satellites.get(src)
            key = src_sat.auth_token_secret if src_sat else "default_key"
            
            pkt_types = ["TELEMETRY", "MISSION_DATA", "ROUTING_UPDATE"]
            pkt = Packet(src, dst, random.choice(pkt_types), {"status": "OK", "val": random.randint(10, 100)}, key)
            
            # Find route
            route = self.router.find_secure_route(src, dst)
            if route and route["path"]:
                pkt.hops = route["path"]
                pkt_dict = pkt.to_dict()
                pkt_dict["route"] = route["path"]
                pkt_dict["status"] = "DELIVERED"
                self.packet_history.insert(0, pkt_dict)
            else:
                pkt_dict = pkt.to_dict()
                pkt_dict["status"] = "DROPPED_NO_ROUTE"
                self.packet_history.insert(0, pkt_dict)
                
        if len(self.packet_history) > self.max_packet_history:
            self.packet_history = self.packet_history[:self.max_packet_history]

    def sever_node_links(self, satellite_id: str):
        """Sever all links connected to a specific satellite."""
        for link in self.links.values():
            if link.source_id == satellite_id or link.target_id == satellite_id:
                link.sever()

    def restore_node_links(self, satellite_id: str):
        """Restore all links connected to a specific satellite."""
        for link in self.links.values():
            if link.source_id == satellite_id or link.target_id == satellite_id:
                link.restore()

    def get_all_links_state(self) -> List[dict]:
        return [l.get_state() for l in self.links.values()]
