import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';

export default function QueueStatusCard() {
  const queueStatus = {
    "General Information": { waiting: 3, activeCounters: 2, avgWaitTime: 8 },
    "Document Services": { waiting: 7, activeCounters: 3, avgWaitTime: 15 },
    "Technical Support": { waiting: 12, activeCounters: 1, avgWaitTime: 25 },
    "Financial Services": { waiting: 5, activeCounters: 2, avgWaitTime: 12 }
  };

  const getQueueVariant = (waiting) => {
    if (waiting <= 5) return "success";
    if (waiting <= 10) return "warning";
    return "danger";
  };

  const getQueueIndicator = (waiting) => {
    if (waiting <= 5) return "🟢";
    if (waiting <= 10) return "🟡";
    return "🔴";
  };

    const getQueueBg = (waiting) => {
    // soft background colors that match the indicator semantics
    if (waiting <= 5) return "#d1e7dd";   // light green
    if (waiting <= 10) return "#fff3cd";  // light yellow
    return "#f8d7da";                     // light red
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8f9fa' }}>
            <Card
        style={{
          width: '22rem',
          margin: '0.75rem',
          padding: '0.75rem',
          borderRadius: '0.75rem',
          border: '0.0625rem solid rgba(0,0,0,0.08)' // ~1px
        }}
      >
            <Card.Body>
                <Card.Title className="mb-3">Queue Status</Card.Title>
                <Card.Subtitle className="mb-3 text-muted">Real-time monitoring</Card.Subtitle>
                
                {Object.entries(queueStatus).map(([service, status]) => (
                <Card
              key={service}
              className="mb-3"
              border={getQueueVariant(status.waiting)}
              style={{
                borderRadius: '0.5rem',
                overflow: 'hidden',
                margin: '0.5rem 0',
                padding: '0.5rem',
                backgroundColor: getQueueBg(status.waiting),
                border: '0.0625rem solid rgba(0,0,0,0.08)'
              }}
            >
                    <Card.Body>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <Card.Title style={{ fontSize: '1rem', marginBottom: 0 }}>
                        {service}
                        </Card.Title>
                        <span style={{ fontSize: '1.5rem' }}>{getQueueIndicator(status.waiting)}</span>
                    </div>
                    
                    <Card.Text style={{ marginBottom: '0.25rem' }}>
                        <small className="text-muted">Waiting: </small>
                        <strong>{status.waiting} people</strong>
                    </Card.Text>
                    
                    <Card.Text style={{ marginBottom: '0.25rem' }}>
                        <small className="text-muted">Active Counters: </small>
                        <strong>{status.activeCounters}</strong>
                    </Card.Text>
                    
                    {status.avgWaitTime > 0 && (
                        <Card.Text style={{ marginBottom: 0 }}>
                        <small className="text-muted">Avg Wait Time: </small>
                        <strong>{status.avgWaitTime} min</strong>
                        </Card.Text>
                    )}
                    </Card.Body>
                </Card>
                ))}
                
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
                <small className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge bg="success" pill style={{ width: '8px', height: '8px', padding: 0 }}></Badge>
                    Live updates every 3 seconds
                </small>
                </div>
            </Card.Body>
            </Card>
        </div>

    );
}