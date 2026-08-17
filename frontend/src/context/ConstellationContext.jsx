import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wsClient } from '../services/websocket';
import { constellationAPI, attacksAPI, alertsAPI, missionsAPI } from '../services/api';

const ConstellationContext = createContext(null);

export const ConstellationProvider = ({ children }) => {
  const [satellites, setSatellites] = useState([]);
  const [groundStations, setGroundStations] = useState([]);
  const [links, setLinks] = useState([]);
  const [fleetSummary, setFleetSummary] = useState({
    total_satellites: 8,
    trusted_count: 8,
    suspicious_count: 0,
    high_risk_count: 0,
    untrusted_count: 0,
    isolated_count: 0,
    average_trust_score: 95.0,
  });
  const [riskSummary, setRiskSummary] = useState({
    overall_risk_score: 12.0,
    risk_level: 'LOW',
    resilience_score: 90.4,
  });
  const [continuitySummary, setContinuitySummary] = useState({
    mission_availability: 100.0,
    total_tasks: 5,
    running_tasks: 5,
    migrated_tasks: 0,
    isolated_satellites: [],
  });
  const [activeThreats, setActiveThreats] = useState([]);
  const [activeAttacks, setActiveAttacks] = useState([]);
  const [recentPackets, setRecentPackets] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState('SAT-03');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle incoming WebSocket telemetry frames
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'CONSTELLATION_TICK') {
      setIsConnected(true);
      if (data.satellites) setSatellites(data.satellites);
      if (data.ground_stations) setGroundStations(data.ground_stations);
      if (data.links) setLinks(data.links);
      if (data.fleet_summary) setFleetSummary(data.fleet_summary);
      if (data.risk_summary) setRiskSummary(data.risk_summary);
      if (data.continuity_summary) setContinuitySummary(data.continuity_summary);
      if (data.active_threats) setActiveThreats(data.active_threats);
      if (data.active_attacks) setActiveAttacks(data.active_attacks);
      if (data.recent_packets) setRecentPackets(data.recent_packets);
      if (data.recent_actions) setRecentActions(data.recent_actions);
      setLoading(false);
    }
  }, []);

  // Fetch initial REST snapshot
  const fetchInitialData = async () => {
    try {
      const [topRes, alertRes, atkRes, contRes] = await Promise.all([
        constellationAPI.getTopology(),
        alertsAPI.getActive(),
        attacksAPI.getActive(),
        missionsAPI.getContinuityReport(),
      ]);
      if (topRes.data) {
        setSatellites(topRes.data.satellites || []);
        setGroundStations(topRes.data.ground_stations || []);
        setLinks(topRes.data.links || []);
      }
      if (alertRes.data) setActiveThreats(alertRes.data);
      if (atkRes.data) setActiveAttacks(atkRes.data);
      if (contRes.data) setContinuitySummary(contRes.data);
    } catch (e) {
      console.warn('Initial REST load error (using mock/live WS fallback)', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const unsubscribe = wsClient.subscribe(handleWebSocketMessage);
    return () => unsubscribe();
  }, [handleWebSocketMessage]);

  // Actions
  const isolateSatellite = async (satelliteId) => {
    try {
      await constellationAPI.executeAction(satelliteId, 'ISOLATE');
    } catch (err) {
      console.error('Failed to isolate satellite', err);
    }
  };

  const recoverSatellite = async (satelliteId) => {
    try {
      await constellationAPI.executeAction(satelliteId, 'RECOVER');
    } catch (err) {
      console.error('Failed to recover satellite', err);
    }
  };

  const resetSatellite = async (satelliteId) => {
    try {
      await constellationAPI.executeAction(satelliteId, 'RESET');
    } catch (err) {
      console.error('Failed to reset satellite', err);
    }
  };

  const resetFleet = async () => {
    try {
      await constellationAPI.resetFleet();
      await attacksAPI.stopAll();
    } catch (err) {
      console.error('Failed to reset fleet', err);
    }
  };

  const launchAttack = async (attackType, targetSatelliteIds, intensity = 1.0) => {
    try {
      return await attacksAPI.launch(attackType, targetSatelliteIds, intensity);
    } catch (err) {
      console.error('Failed to launch attack', err);
      throw err;
    }
  };

  const stopAttack = async (attackId) => {
    try {
      await attacksAPI.stop(attackId);
    } catch (err) {
      console.error('Failed to stop attack', err);
    }
  };

  const resolveThreat = async (threatId) => {
    try {
      await alertsAPI.resolve(threatId);
      setActiveThreats((prev) => prev.filter((t) => t.id !== threatId));
    } catch (err) {
      console.error('Failed to resolve threat', err);
    }
  };

  const selectedSatellite = satellites.find((s) => s.id === selectedSatelliteId) || satellites[0];

  return (
    <ConstellationContext.Provider
      value={{
        satellites,
        groundStations,
        links,
        fleetSummary,
        riskSummary,
        continuitySummary,
        activeThreats,
        activeAttacks,
        recentPackets,
        recentActions,
        selectedSatelliteId,
        setSelectedSatelliteId,
        selectedSatellite,
        isConnected,
        loading,
        isolateSatellite,
        recoverSatellite,
        resetSatellite,
        resetFleet,
        launchAttack,
        stopAttack,
        resolveThreat,
      }}
    >
      {children}
    </ConstellationContext.Provider>
  );
};

export const useConstellation = () => useContext(ConstellationContext);
