# 🚀 OrbitTrace Nexus

### Autonomous Cyber-Physical Digital Twin for Secure Satellite Constellations

OrbitTrace Nexus is a full-stack space cybersecurity simulation platform and Space Security Operations Center (Space-SOC) that creates a **digital twin of a multi-satellite constellation** and continuously monitors dynamic trust relationships, Inter-Satellite Links (ISLs), behavioral drift, and mission continuity under active adversarial conditions.

Unlike conventional satellite security systems that only monitor isolated spacecraft, OrbitTrace Nexus models **distributed trust relationships between satellites**. Every satellite evaluates its neighbors across 6 weighted behavioral and communication factors. When an anomaly or attack is detected, the platform autonomously isolates compromised nodes, reroutes constellation communications, dynamically migrates payload tasks to trusted spacecraft, and executes Level 5 cryptographic re-keying to restore healthy operations.

---

## 🌟 Key Features & 8 Architectural Modules

### 🛰️ 1. Constellation Digital Twin
- Simulates 8 Low Earth Orbit (LEO) satellites (`SAT-01` to `SAT-08`) in multiple orbital planes plus 3 Ground Stations (`GS-ALPHA Kourou`, `GS-BETA Svalbard`, `GS-GAMMA Canberra`).
- Continuous 1 Hz generation of 14+ physical and radio telemetry parameters:
  - Battery (%), CPU (%), Memory (%), Internal Temperature (°C), Altitude (km), Velocity (km/s), Latitude/Longitude ground tracks, RSSI signal strength (dBm), Packet transmission rates, Packet loss (%), RTT Latency (ms), Bit Error Rate.
  - Security States: `TRUSTED`, `SUSPICIOUS`, `HIGH_RISK`, `UNTRUSTED`, `ISOLATED`, `RECOVERING`.
  - Mission States: `EARTH_IMAGING`, `TELEMETRY_RELAY`, `GROUND_UPLINK`, `SECURE_BURST`, `SAFE_HOLD`.

### 🔐 2. Dynamic 6-Factor Trust Management Engine
Every satellite maintains a continuously dynamic trust score calculated from 6 weighted factors:
$$\text{Trust Score} = 0.25 \cdot F_{auth} + 0.20 \cdot F_{integ} + 0.20 \cdot F_{behav} + 0.15 \cdot F_{rel} + 0.10 \cdot F_{telem} + 0.10 \cdot F_{rep} - \Delta_{penalties}$$
- **25% Authentication**: HMAC/JWT token freshness & challenge-response nonces.
- **20% Packet Integrity**: SHA-256 payload checksums & cryptographic signatures.
- **20% Behaviour Consistency**: Statistical Z-score deviation from learned baseline.
- **15% Communication Reliability**: Latency stability & peer consensus ratings.
- **10% Telemetry Stability**: Physical sensor continuity & gradient plausibility.
- **10% Historical Reputation**: Exponential moving average (EMA) with asymmetric decay.

### 🌐 3. Inter-Satellite Communication Layer (ISL)
- Directional optical laser and Ka-band RF cross-links across orbital planes.
- Dynamic trust-weighted Dijkstra routing: edge cost scales exponentially if a node's trust score drops below nominal, automatically steering traffic away from suspicious nodes.
- Live simulated packet bursts with hop-by-hop route visualization.

### ⚔️ 4. Distributed Attack Simulation Laboratory
7 controllable adversarial space attack vectors with real-time progression tracking:
1. **Identity Clone Attack**: Injects spoofed telemetry claiming target satellite ID from conflicting orbital ephemeris.
2. **Rogue Satellite Injection**: Unauthorized spacecraft broadcasts spoofed beacons attempting to join mesh.
3. **Trust Manipulation / Sleeper Attack**: Satellite behaves nominally then gradually drops packets and corrupts payloads.
4. **Telemetry Sensor Drift Attack**: Subtly drifts sensor values ($21^\circ\text{C} \to 42^\circ\text{C}$) to test statistical Z-score detectors.
5. **Route Hijacking Attack**: Compromised node advertises bogus zero-cost paths to blackhole constellation traffic.
6. **Coordinated Multi-Satellite Attack**: Synchronized compromise across `SAT-02`, `SAT-04`, and `SAT-05`.
7. **Communication Flood (ISL DoS)**: Optical laser saturation with 10,000 pps, spiking latency and packet loss.

### 🧠 5. Behavioural Detection Engine
- Normal baseline profile tracking for each spacecraft $(\mu, \sigma)$.
- Multidimensional Z-score calculation across packet rates, latency, CPU utilization, thermal gradient, and loss rates.

### 🔎 6. Threat Correlation & Systemic Risk Engine
- Correlates multi-modal anomalies into unified high-confidence security incidents.
- Computes real-time Systemic Cyber Risk Index (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and constellation resilience score.

### 🛡️ 7. Autonomous Response & Recovery Engine (Levels 0–5)
- **Level 0 (Monitor)**: 1 Hz telemetry sampling.
- **Level 1 (Observe)**: 5 Hz sampling, deep packet inspection.
- **Level 2 (Verify)**: Cryptographic challenge-response handshakes.
- **Level 3 (Restrict)**: Revoke relay forwarding, restrict commands to safe-hold.
- **Level 4 (Isolate)**: Sever optical ISL cross-links, trigger route failover.
- **Level 5 (Recover)**: Ground station cryptographic re-key, firmware integrity check, step-wise trust rebuilding.

### 🛰️ 8. Mission Continuity Engine
- Continuously calculates **Constellation Mission Availability (%)**.
- Dynamic Task Migration: When a satellite is isolated, its active workloads (Earth Imaging, Deep Space Relay, SAR Scan) autonomously migrate to the nearest trusted peer on the same or adjacent plane without interrupting mission availability.
- Exportable research-grade cybersecurity benchmark reports (JSON).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, HTML5 Canvas Topology |
| **Backend** | Python 3.11, FastAPI, Uvicorn, SQLAlchemy, NetworkX, NumPy, SciPy, Scikit-Learn |
| **Real-Time** | WebSockets (1 Hz continuous digital twin telemetry & event broadcasting) |
| **Database** | SQLite (ORM models for satellites, telemetry logs, trust history, alerts, missions) |
| **Security** | JWT Bearer Tokens, Bcrypt password hashing, HMAC-SHA256 frame integrity |

---

## 🚀 Quick Start Guide

### 1. Launch Everything (1-Click)
Run the startup script in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\start_all.ps1
```
Or double-click `start_all.bat`.

### 2. Access the Space-SOC Dashboard
- **Space-SOC Dashboard**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend Server**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Default Login Credentials
| Role | Email / Username | Password |
|---|---|---|
| **Admin** | `admin@orbittrace.space` / `admin` | `nexus2026!` |
| **Operator** | `operator@orbittrace.space` / `operator` | `operator2026!` |
| **Analyst** | `analyst@orbittrace.space` / `analyst` | `analyst2026!` |

---

## 🧪 Running Automated Verification Tests

Run the complete 8-module automated verification suite:
```powershell
& "C:\Users\Rajviba Chudasama\python311\python.exe" backend\test_simulation.py
```
Expected output:
```text
==================================================================
  [*] RUNNING ORBITTRACE NEXUS CYBER-PHYSICAL VERIFICATION SUITE   
==================================================================
[PASS] Module 1 [Constellation Digital Twin]: Initialized 8 LEO satellites & 3 ground stations.
[PASS] Module 2 [Dynamic Trust Engine]: 6-factor composite score calculated: 98.88/100.
[PASS] Module 3 [Inter-Satellite Comm]: Dijkstra trust-weighted route SAT-01 -> GS-ALPHA.
[*] Injected Attack Scenario: IDENTITY_CLONE on SAT-03...
[PASS] Module 4 & 5 [Attack Lab & Behaviour Engine]: Attack injection and trust decay verified.
[PASS] Module 6 & 7 [Threat Correlation & Response]: Autonomous Level 4 Isolation verified.
[PASS] Module 8 [Mission Continuity]: Workload dynamically migrated from SAT-03 to SAT-01.
[PASS] Mission Availability Score: 96.2% (High resilience sustained).
[PASS] Module 7 [Level 5 Recovery]: Cryptographic re-keying & trust rebuild verified.
==================================================================
  [SUCCESS] ALL 8 ORBITTRACE NEXUS ARCHITECTURAL MODULES VERIFIED 100% 
==================================================================
```
