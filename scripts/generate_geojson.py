import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
STATES_FILE = BASE_DIR / "data" / "states.json"
GEOJSON_FILE = BASE_DIR / "data" / "districts.geojson"

def create_district_polygon(lat: float, lng: float, radius: float = 0.35):
    """
    Creates a simplified hexagonal polygon feature around a center lat/lng.
    """
    import math
    coords = []
    num_points = 6
    for i in range(num_points):
        angle = (2 * math.pi / num_points) * i
        # Add slight pseudo-random jitter for organic boundary look
        jitter = 0.05 * math.sin(i * 2)
        r = radius + jitter
        pt_lng = lng + r * math.cos(angle) * 1.1 # aspect ratio adjustment for lat/lng
        pt_lat = lat + r * math.sin(angle)
        coords.append([round(pt_lng, 4), round(pt_lat, 4)])
    coords.append(coords[0]) # Close polygon ring
    return [coords]

def generate_geojson():
    print(f"Reading states from {STATES_FILE}...")
    with open(STATES_FILE, "r", encoding="utf-8") as f:
        states_data = json.load(f)

    features = []

    for state in states_data:
        state_name = state["name"]
        for dist in state["districts"]:
            dist_name = dist["name"]
            lat = dist["lat"]
            lng = dist["lng"]

            polygon_coords = create_district_polygon(lat, lng)

            feature = {
                "type": "Feature",
                "properties": {
                    "district": dist_name,
                    "state": state_name,
                    "latitude": lat,
                    "longitude": lng,
                    "disclaimer": "Simulated Demo Data"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": polygon_coords
                }
            }
            features.append(feature)

    feature_collection = {
        "type": "FeatureCollection",
        "name": "FRA_Demo_Districts",
        "disclaimer": "Demo system using simulated data. Not an official Government of India system.",
        "features": features
    }

    print(f"Writing GeoJSON with {len(features)} district boundaries to {GEOJSON_FILE}...")
    GEOJSON_FILE.parent.mkdir(exist_ok=True)
    with open(GEOJSON_FILE, "w", encoding="utf-8") as f:
        json.dump(feature_collection, f, indent=2)

    print("GeoJSON generation completed successfully!")

if __name__ == "__main__":
    generate_geojson()
