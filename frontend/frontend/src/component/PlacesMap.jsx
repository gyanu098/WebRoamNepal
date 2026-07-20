import { useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { getImageUrl } from "../service/Api";

const NEPAL_CENTER = { lat: 28.3949, lng: 84.124 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "400px", borderRadius: "16px" };

const PlacesMap = ({ places }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });
  const [activePlace, setActivePlace] = useState(null);

  const pinnedPlaces = places.filter((p) => p.latitude && p.longitude);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return null;
  }
  if (!isLoaded) {
    return <p>Loading map...</p>;
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={NEPAL_CENTER}
      zoom={7}
    >
      {pinnedPlaces.map((place) => (
        <Marker
          key={place.id}
          position={{ lat: Number(place.latitude), lng: Number(place.longitude) }}
          onClick={() => setActivePlace(place)}
        />
      ))}

      {activePlace && (
        <InfoWindow
          position={{ lat: Number(activePlace.latitude), lng: Number(activePlace.longitude) }}
          onCloseClick={() => setActivePlace(null)}
        >
          <div style={{ maxWidth: "200px" }}>
            {activePlace.image && (
              <img
                src={getImageUrl(activePlace.image)}
                alt={activePlace.name}
                style={{ width: "100%", borderRadius: "8px", marginBottom: "6px" }}
              />
            )}
            <strong>{activePlace.name}</strong>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>{activePlace.location}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default PlacesMap;
