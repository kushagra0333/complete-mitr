import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Container, Card, Button, ListGroup, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { getSessionDetails } from '../services/api';
import './map.css';

// Fix for Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getSessionDetails(sessionId);
        if (response.data?.session) {
          setSession(response.data.session);
          if (response.data.session.coordinates?.length > 0 && mapRef.current) {
            const bounds = response.data.session.coordinates.map(coord => [
              coord.latitude,
              coord.longitude,
            ]);
            mapRef.current.fitBounds(bounds);
          }
        } else {
          setError('Session data not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch session details');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="map-page-background">
        <Container className="map-page-container text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading session details...</p>
        </Container>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="map-page-background loading-screen">
        <Container className="map-page-container py-5">
          <Alert variant="danger">
            {error || 'Session not found'}
            <div className="mt-3">
              <Button
                variant="primary"
                className="neon-btn"
                onClick={() => navigate('/devices')}
              >
                Back to Devices
              </Button>
            </div>
          </Alert>
        </Container>
      </div>
    );
  }

  const latestLocation = session.coordinates?.length > 0
    ? session.coordinates[session.coordinates.length - 1]
    : null;

  const pathCoordinates = session.coordinates.map(coord => [coord.latitude, coord.longitude]);

  return (
    <div className="map-page-background">
      <div className="map-page-overlay-glow" />
      <Container className="map-page-container py-5">
        <Card className="glass-effect animate-slide-up">
          <Card.Body>
            <Card.Title className="text-gradient">Session: {sessionId.substring(0, 6)}...</Card.Title>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Row>
              <Col>
                <Card.Subtitle className="text-gradient mb-3">Session Details</Card.Subtitle>
                <ListGroup variant="flush" className="mb-3">
                  <ListGroup.Item>
                    <strong>Device ID:</strong> {session.deviceId}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Start Time:</strong> {new Date(session.startTime).toLocaleString()}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>End Time:</strong>{' '}
                    {session.endTime ? new Date(session.endTime).toLocaleString() : 'Still active'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Coordinates Count:</strong> {session.coordinates?.length || 0}
                  </ListGroup.Item>
                </ListGroup>
              </Col>
            </Row>

            {session.coordinates?.length > 0 && (
              <>
                <Row className="mb-3">
                  <Col>
                    <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
                      <MapContainer
                        center={
                          latestLocation
                            ? [latestLocation.latitude, latestLocation.longitude]
                            : [0, 0]
                        }
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        whenCreated={(map) => {
                          mapRef.current = map;
                          if (session.coordinates.length > 0) {
                            const bounds = session.coordinates.map(coord => [
                              coord.latitude,
                              coord.longitude,
                            ]);
                            map.fitBounds(bounds);
                          }
                        }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* Draw the path line */}
                        <Polyline positions={pathCoordinates} color="blue" weight={4} />

                        {/* Mark each coordinate */}
                        {session.coordinates.map((coord, index) => (
                          <Marker
                            key={coord._id || index}
                            position={[coord.latitude, coord.longitude]}
                          >
                            <Popup>
                              Location {index + 1}
                              <br />
                              {coord.latitude.toFixed(6)}, {coord.longitude.toFixed(6)}
                              <br />
                              Time: {new Date(coord.timestamp).toLocaleString()}
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Card.Subtitle className="text-gradient mb-2">All Locations</Card.Subtitle>
                    <ListGroup variant="flush">
                      {session.coordinates.map((coord, index) => (
                        <ListGroup.Item key={coord._id || index} className="small">
                          <div>
                            <strong>Time:</strong> {new Date(coord.timestamp).toLocaleString()}
                          </div>
                          <div>
                            <strong>Latitude:</strong> {coord.latitude.toFixed(6)},{' '}
                            <strong>Longitude:</strong> {coord.longitude.toFixed(6)}
                          </div>
                          {coord.accuracy && (
                            <div>
                              <strong>Accuracy:</strong> {coord.accuracy.toFixed(2)} m
                            </div>
                          )}
                          {coord.speed && (
                            <div>
                              <strong>Speed:</strong> {coord.speed.toFixed(2)} m/s
                            </div>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Col>
                </Row>
              </>
            )}

            <div className="text-center mt-3">
              <Button
                variant="primary"
                className="neon-btn"
                onClick={() => navigate(`/device/${session.deviceId}`)}
              >
                Back to Device
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default MapPage;
