import React from "react";

export default function QueueStatus() {
  const queueStatus = {
    "General Information": { waiting: 3, activeCounters: 2, avgWaitTime: 8 },
    "Document Services": { waiting: 7, activeCounters: 3, avgWaitTime: 15 },
    "Technical Support": { waiting: 12, activeCounters: 1, avgWaitTime: 25 },
    "Financial Services": { waiting: 5, activeCounters: 2, avgWaitTime: 12 }
  };

  const getQueueBg = (waiting) => {
    if (waiting <= 5) return "#d1e7dd";
    if (waiting <= 10) return "#fff3cd";
    return "#f8d7da";
  };

  const getQueueIndicator = (waiting) => {
    if (waiting <= 5) return "🟢";
    if (waiting <= 10) return "🟡";
    return "🔴";
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8f9fa' }}>
      <div style={{
        width: '22rem',
        margin: '0.75rem auto',
        padding: '0.75rem',
        borderRadius: '0.75rem',
        border: '1px solid #e0e0e0',
        background: '#fff'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#0b3d91' }}>Queue Status</h3>
        <div style={{ marginBottom: '1rem', color: '#666' }}>Real-time monitoring</div>
        {Object.entries(queueStatus).map(([service, status]) => (
          <div
            key={service}
            style={{
              borderRadius: '0.5rem',
              margin: '0.5rem 0',
              padding: '0.75rem',
              backgroundColor: getQueueBg(status.waiting),
              border: '1px solid #e0e0e0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>{service}</span>
              <span style={{ fontSize: '1.5rem' }}>{getQueueIndicator(status.waiting)}</span>
            </div>
            <div style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              <strong>Waiting:</strong> {status.waiting} people
            </div>
            <div style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              <strong>Active Counters:</strong> {status.activeCounters}
            </div>
            <div style={{ fontSize: '0.95rem' }}>
              <strong>Avg Wait Time:</strong> {status.avgWaitTime} min
            </div>
          </div>
        ))}
        <div style={{ marginTop: '1rem', borderTop: '1px solid #dee2e6', paddingTop: '0.7rem', color: '#888', fontSize: '0.9rem' }}>
          Live updates every 3 seconds
        </div>
      </div>
    </div>
  );
}