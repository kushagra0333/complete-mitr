import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSessionHistory } from '../services/api';
import './TriggerHistory.css';
import { Fragment } from 'react';

function TriggerHistory() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedSession, setExpandedSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const deviceId = query.get('deviceId');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getSessionHistory(deviceId);
        if (response.sessions && Array.isArray(response.sessions)) {
          setSessions(response.sessions);
          setTotalPages(response.pagination?.totalPages || 1);
        } else {
          setError('No session data available');
          setSessions([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch trigger history');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) {
      fetchHistory();
    } else {
      setError('No device ID provided');
      setLoading(false);
    }
  }, [deviceId, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleExpand = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  if (loading) {
    return (
      <div className="trigger-history-background loading-screen">
        <div className="trigger-history-container text-center">
          <div className="spinner"></div>
          <p className="loading-text">Loading trigger history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trigger-history-background">
      <div className="trigger-history-overlay-glow"></div>
      <div className="trigger-history-container">
        <div className="glass-card slide-up">
          {deviceId && <h3 className=" text-gradient">Trigger History For {deviceId}</h3>}

          {error && (
            <div className="alert danger" onClick={() => setError('')}>
              {error}
              <div className="alert-actions">
                <button className="glow-btn" onClick={() => navigate('/devices')}>
                  Back to Devices
                </button>
              </div>
            </div>
          )}

          {!error && sessions.length === 0 && (
            <div className="alert info">
              No trigger sessions found for this device
              <div className="alert-actions">
                <button className="glow-btn" onClick={() => navigate('/devices')}>
                  Back to Devices
                </button>
              </div>
            </div>
          )}

          {sessions.length > 0 && (
            <>
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => {
                    const startTime = new Date(session.startTime);
                    const endTime = session.endTime ? new Date(session.endTime) : null;
                    const duration = endTime
                      ? `${Math.round((endTime - startTime) / 60000)} minutes`
                      : 'Ongoing';
                    const isExpanded = expandedSession === session._id;

                    return (
                      <Fragment key={session._id}>
                        <tr className="parent-row">
                          <td>{session._id.substring(0, 6)}...</td>
                          <td>{startTime.toLocaleString()}</td>
                          <td>{endTime ? endTime.toLocaleString() : 'Active'}</td>
                          <td>{duration}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                session.status === 'active' ? 'status-active' : 'status-ended'
                              }`}
                            >
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="glow-btn"
                              onClick={() => navigate(`/map/${session._id}`)}
                            >
                              View Map
                            </button>
                            <button
                              className="outline-btn"
                              onClick={() => toggleExpand(session._id)}
                            >
                              {isExpanded ? 'Hide' : 'Details'}
                            </button>
                          </td>
                        </tr>
                        <tr className="child-row">
                          <td colSpan="6" className="details-cell">
                            <div className={`collapse-content ${isExpanded ? 'expanded' : ''}`}>
                              {session.coordinates?.length > 0 ? (
                                <table className="nested-table">
                                  <thead>
                                    <tr>
                                      <th>#</th>
                                      <th>Time</th>
                                      <th>Latitude</th>
                                      <th>Longitude</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {session.coordinates.map((coord, index) => (
                                      <tr key={coord._id || index}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(coord.timestamp).toLocaleString()}</td>
                                        <td>{coord.latitude.toFixed(6)}</td>
                                        <td>{coord.longitude.toFixed(6)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-muted">No location data recorded</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="outline-btn"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </button>
                  <span className="page-info">Page {page} of {totalPages}</span>
                  <button
                    className="outline-btn"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TriggerHistory;