import math
import datetime

class OrbitalState:
    """
    Simulates realistic Low Earth Orbit (LEO) kinematics and Ground Track calculation.
    """
    def __init__(self, satellite_id: str, plane: int, initial_anomaly: float, altitude_km: float = 550.0, inclination_deg: float = 53.0):
        self.satellite_id = satellite_id
        self.plane = plane
        self.altitude = altitude_km
        self.inclination = math.radians(inclination_deg)
        self.true_anomaly = initial_anomaly  # in degrees (0 to 360)
        
        # Earth Constants
        self.earth_radius = 6371.0  # km
        self.mu = 398600.4418       # km^3/s^2 (Standard gravitational parameter)
        
        # Orbital Velocity & Period
        self.orbit_radius = self.earth_radius + self.altitude
        self.velocity = math.sqrt(self.mu / self.orbit_radius)  # km/s (~7.58 km/s)
        self.period_seconds = 2 * math.pi * math.sqrt((self.orbit_radius ** 3) / self.mu) # ~95.6 minutes
        self.angular_velocity_deg_per_sec = 360.0 / self.period_seconds
        
        # RAAN (Right Ascension of Ascending Node) for plane distribution
        self.raan = math.radians((plane - 1) * 90.0)
        
        # Initialize coordinates
        self.latitude = 0.0
        self.longitude = 0.0
        self.is_in_eclipse = False
        self.step(0.0)

    def step(self, dt: float = 1.0):
        """Advance the satellite orbit by dt seconds."""
        self.true_anomaly = (self.true_anomaly + self.angular_velocity_deg_per_sec * dt) % 360.0
        theta = math.radians(self.true_anomaly)
        
        # Spherical coordinates to Lat/Lng ground track
        # Lat: arcsin(sin(inc) * sin(theta))
        sin_lat = math.sin(self.inclination) * math.sin(theta)
        self.latitude = math.degrees(math.asin(max(-1.0, min(1.0, sin_lat))))
        
        # Lng calculation accounting for Earth rotation (360 deg / 86400 s)
        earth_rot_deg = (datetime.datetime.utcnow().timestamp() * (360.0 / 86400.0)) % 360.0
        arg_lng = math.atan2(math.cos(self.inclination) * math.sin(theta), math.cos(theta))
        self.longitude = (math.degrees(arg_lng + self.raan) - earth_rot_deg + 180.0) % 360.0 - 180.0
        
        # Eclipse model (approximated: in shadow for ~35% of orbit)
        self.is_in_eclipse = 100.0 <= self.true_anomaly <= 230.0

    def get_state(self) -> dict:
        return {
            "altitude": round(self.altitude, 2),
            "velocity": round(self.velocity, 3),
            "latitude": round(self.latitude, 4),
            "longitude": round(self.longitude, 4),
            "true_anomaly": round(self.true_anomaly, 2),
            "is_in_eclipse": self.is_in_eclipse
        }
