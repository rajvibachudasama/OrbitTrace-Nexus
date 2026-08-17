import json
import asyncio
from typing import List, Set
from fastapi import WebSocket, WebSocketDisconnect

class WebSocketManager:
    """
    Broadcasts real-time constellation telemetry, security alerts, and attack events
    to connected Space-SOC dashboard clients.
    """
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
            
        data_text = json.dumps(message)
        disconnected = set()
        
        for connection in self.active_connections:
            try:
                await connection.send_text(data_text)
            except Exception:
                disconnected.add(connection)
                
        for dead_conn in disconnected:
            self.disconnect(dead_conn)

ws_manager = WebSocketManager()
