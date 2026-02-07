import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Container, Card, Spinner, Alert, ListGroup, Row, Col } from 'react-bootstrap';
import { getSessionStatus, getSessionDetails } from '../services/api';
import './MapLive.css';

// Fix for Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapLive() {
  const { deviceId } = useParams();
  const mapRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionLocations, setSessionLocations] = useState([]);

  const fetchSessionDetails = async (sessionId) => {
    try {
      const response = await getSessionDetails(sessionId);
      return response.data.session;
    } catch (err) {
      console.error('Error fetching session details:', err);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const statusResponse = await getSessionStatus(deviceId);
      const isActive = statusResponse.data.isActive || false;
      const sessionId = isActive ? statusResponse.data.sessionId : null;

      if (sessionId) {
        const session = await fetchSessionDetails(sessionId);
        if (session?.coordinates?.length > 0) {
          setSessionLocations(session.coordinates);
        } else {
          setSessionLocations([]);
        }
      } else {
        setSessionLocations([]);
      }
    } catch (err) {
      setError('Failed to fetch session data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deviceId]);

  useEffect(() => {
    if (mapRef.current && sessionLocations.length > 0) {
      const bounds = sessionLocations.map(coord => [coord.latitude, coord.longitude]);
      mapRef.current.fitBounds(bounds);
      mapRef.current.invalidateSize();
    }
  }, [sessionLocations]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading map...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const latestLocation = sessionLocations.length > 0
    ? sessionLocations[sessionLocations.length - 1]
    : null;

  return (
    <div className="device-details-background">
      <Container className="py-4">
        <Card className="glass-effect mb-4">
          <Card.Body style={{ height: '500px' }}>
            <MapContainer
              center={latestLocation ? [latestLocation.latitude, latestLocation.longitude] : [0, 0]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              whenCreated={(map) => {
                mapRef.current = map;
                if (sessionLocations.length > 0) {
                  const bounds = sessionLocations.map(coord => [coord.latitude, coord.longitude]);
                  map.fitBounds(bounds);
                }
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              {sessionLocations.map((coord, index) => (
                <Marker key={coord._id || index} position={[coord.latitude, coord.longitude]}>
                  <Popup>
                    Location {index + 1}<br />
                    {coord.latitude.toFixed(6)}, {coord.longitude.toFixed(6)}<br />
                    Time: {new Date(coord.timestamp).toLocaleString()}
                  </Popup>
                </Marker>
              ))}

              {sessionLocations.length > 1 && (
                <Polyline
                  positions={sessionLocations.map(coord => [coord.latitude, coord.longitude])}
                  color="blue"
                  weight={3}
                />
              )}
            </MapContainer>
          </Card.Body>
        </Card>

        <Card className="glass-effect">
          <Card.Body>
            <h5 className="text-gradient mb-3">All Locations</h5>
            {sessionLocations.length > 0 ? (
              <ListGroup variant="flush">
                {sessionLocations.map((coord, index) => (
                  <ListGroup.Item key={coord._id || index} className="small">
                    <div>
                      <strong>Time:</strong> {new Date(coord.timestamp).toLocaleString()}
                    </div>
                    <div>
                      <strong>Latitude:</strong> {coord.latitude.toFixed(6)},
                      <strong> Longitude:</strong> {coord.longitude.toFixed(6)}
                    </div>
                    {coord.accuracy && (
                      <div><strong>Accuracy:</strong> {coord.accuracy.toFixed(2)} m</div>
                    )}
                    {coord.speed && (
                      <div><strong>Speed:</strong> {coord.speed.toFixed(2)} m/s</div>
                    )}
                    {coord.tag && (
                      <div><strong>Tag:</strong> {coord.tag}</div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted">No coordinates available for this session.</p>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default MapLive;
