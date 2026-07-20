import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const NEPAL_CENTER = { lat: 28.3949, lng: 84.124 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "220px", borderRadius: "10px" };

// Lets the user click the map to drop/move a pin marking a place's exact
// location; the picked lat/lng is reported to the parent via onPick.
const MapPicker = ({ value, onPick }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return null;
  }
  if (!isLoaded) {
    return <p>Loading map...</p>;
  }

  const markerPosition = value?.lat && value?.lng ? value : null;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={markerPosition || NEPAL_CENTER}
        zoom={markerPosition ? 12 : 7}
        onClick={(e) => onPick({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
        {markerPosition
          ? `Pinned at ${markerPosition.lat.toFixed(4)}, ${markerPosition.lng.toFixed(4)}`
          : "Click the map to pin this place's exact location (optional)"}
      </p>
    </div>
  );
};

export default MapPicker;
