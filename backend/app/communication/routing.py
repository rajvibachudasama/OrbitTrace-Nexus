import networkx as nx
from typing import Dict, List, Optional, Tuple, Any

class ConstellationRouter:
    """
    Computes optimal, cyber-resilient routes across the constellation graph
    using trust-weighted Dijkstra algorithm.
    """
    def __init__(self):
        self.graph = nx.Graph()

    def build_topology_graph(self, satellites: dict, links: dict, ground_stations: list):
        """Rebuild graph topology with trust-weighted edge costs."""
        self.graph.clear()
        
        # Add Ground Station nodes
        for gs in ground_stations:
            self.graph.add_node(gs["id"], node_type="GROUND_STATION", trust=100.0, is_isolated=False)
            
        # Add Satellite nodes
        for sat_id, sat in satellites.items():
            self.graph.add_node(
                sat_id,
                node_type="SATELLITE",
                trust=sat.trust_score,
                security_state=sat.security_state,
                is_isolated=sat.is_isolated
            )
            
        # Add ISL Edges
        for link_id, link in links.items():
            s_node = satellites.get(link.source_id)
            t_node = satellites.get(link.target_id)
            
            # Skip if link is isolated or either node is isolated
            if link.status == "ISOLATED" or (s_node and s_node.is_isolated) or (t_node and t_node.is_isolated):
                continue
                
            # Compute composite trust-weighted edge weight
            s_trust = s_node.trust_score if s_node else 100.0
            t_trust = t_node.trust_score if t_node else 100.0
            min_trust = max(1.0, min(s_trust, t_trust))
            
            # Trust multiplier: If trust drops below 80, path cost increases drastically
            trust_penalty = (100.0 / min_trust) ** 1.8
            loss_penalty = 1.0 / max(0.05, 1.0 - (link.packet_loss_rate / 100.0))
            
            weight = (link.latency_ms * trust_penalty * loss_penalty)
            
            self.graph.add_edge(
                link.source_id,
                link.target_id,
                weight=weight,
                latency=link.latency_ms,
                loss=link.packet_loss_rate,
                link_id=link.id,
                status=link.status
            )
            
        # Add Satellite-to-Ground uplinks for satellites over GS
        # SAT-01 <-> GS-ALPHA, SAT-03 <-> GS-BETA, SAT-07 <-> GS-GAMMA
        ground_anchors = [
            ("SAT-01", "GS-ALPHA", 15.0),
            ("SAT-03", "GS-BETA", 18.0),
            ("SAT-07", "GS-GAMMA", 16.0)
        ]
        for sat_id, gs_id, latency in ground_anchors:
            sat = satellites.get(sat_id)
            if sat and not sat.is_isolated and sat.trust_score > 30.0:
                cost = latency * (100.0 / max(1.0, sat.trust_score))
                self.graph.add_edge(sat_id, gs_id, weight=cost, latency=latency, loss=0.1, link_id=f"{sat_id}-{gs_id}", status="ONLINE")

    def find_secure_route(self, source_id: str, target_id: str) -> Optional[Dict[str, Any]]:
        """Find shortest secure path using Dijkstra on trust-weighted cost."""
        if not self.graph.has_node(source_id) or not self.graph.has_node(target_id):
            return None
            
        try:
            path = nx.shortest_path(self.graph, source=source_id, target=target_id, weight="weight")
            total_latency = 0.0
            min_path_trust = 100.0
            
            for i in range(len(path) - 1):
                u, v = path[i], path[i+1]
                edge_data = self.graph.get_edge_data(u, v)
                total_latency += edge_data.get("latency", 10.0)
                
                node_u_data = self.graph.nodes[u]
                node_v_data = self.graph.nodes[v]
                min_path_trust = min(min_path_trust, node_u_data.get("trust", 100.0), node_v_data.get("trust", 100.0))
                
            return {
                "source": source_id,
                "target": target_id,
                "path": path,
                "hop_count": len(path) - 1,
                "estimated_latency_ms": round(total_latency, 2),
                "bottleneck_trust": round(min_path_trust, 2),
                "is_secure": min_path_trust >= 60.0
            }
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    def get_all_routes_to_ground(self, satellites: dict) -> Dict[str, Any]:
        """Compute best routes for all satellites to nearest ground station."""
        routes = {}
        for sat_id, sat in satellites.items():
            if sat.is_isolated:
                routes[sat_id] = {"status": "ISOLATED", "path": []}
                continue
                
            best_route = None
            for gs in ["GS-ALPHA", "GS-BETA", "GS-GAMMA"]:
                r = self.find_secure_route(sat_id, gs)
                if r:
                    if best_route is None or r["estimated_latency_ms"] < best_route["estimated_latency_ms"]:
                        best_route = r
                        
            routes[sat_id] = best_route if best_route else {"status": "UNREACHABLE", "path": []}
        return routes
