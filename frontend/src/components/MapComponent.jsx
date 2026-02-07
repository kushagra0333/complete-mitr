import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ coordinates = [], center = [0, 0], zoom = 13 }) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {coordinates.map((coord, index) => (
        coord?.lat && coord?.long && (
          <Marker key={index} position={[coord.lat, coord.long]}>
            <Popup>
              Latitude: {coord.lat.toFixed(6)}<br />
              Longitude: {coord.long.toFixed(6)}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default MapComponent;