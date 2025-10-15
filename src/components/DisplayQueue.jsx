import React from "react";
import  { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import API from "../API/API.mjs";

export default function QueueStatus() {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [queueStatusMap, setQueueStatusMap] = useState({});
  const [error, setError] = useState(null);
  /*const queueStatus = {
    "General Information": { waiting: 3, activeCounters: 2, avgWaitTime: 8 },
    "Document Services": { waiting: 7, activeCounters: 3, avgWaitTime: 15 },
    "Technical Support": { waiting: 12, activeCounters: 1, avgWaitTime: 25 },
    "Financial Services": { waiting: 5, activeCounters: 2, avgWaitTime: 12 }
  };*/

  const getQueueBg = (waiting) => {
    if (waiting <= 5) return "linear-gradient(135deg, #e6fff9 0%, #ffffff 100%)";
    if (waiting <= 10) return "linear-gradient(135deg, #fff9f0 0%, #ffffff 100%)";
    return "linear-gradient(135deg, #ffe6eb 0%, #ffffff 100%)";
  };

  const getQueueIndicatorColor = (waiting) => {
    if (waiting <= 5) return "#00d4aa";
    if (waiting <= 10) return "#ffc107";
    return "#ff6b9d";
  };

  const fetchStatuses = async () => {
    try {
      setError(null);
      const types = await API.getServiceTypes();
      // ensure array
      const typesArr = Array.isArray(types) ? types : (types.data || types.serviceTypes || []);
      setServiceTypes(typesArr);

      const promises = typesArr.map(async (t) => {
        const id = t.id;
        if (!id) return [null];
        try {
          const status = await API.getQueueStatus(id);
          return [id, status];
        } catch {
          return [id, null];
        }
      });

      const results = await Promise.all(promises);
      const map = {};
      results.forEach(([id, status]) => {
        if (id && status) {
          // Use service name as key instead of ID
          map[status.serviceTypeName] = status;
        }
      });
      setQueueStatusMap(map);
    } catch (err) {
      setError(err.message || "Failed to load queue status");
    }
  };

  useEffect(() => {
    fetchStatuses();
    const iv = setInterval(fetchStatuses, 3000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-3" style={{ background: "var(--bg-primary)" }}>
      <Card
        className="mx-auto"
        style={{
          width: "22rem",
          borderRadius: "1rem",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
          background: "var(--bg-secondary)"
        }}
      >
        <Card.Body>
          <Card.Title className="mb-2" style={{ fontSize: "1.25rem", color: "var(--primary-dark)", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Queue Status
          </Card.Title>
          <Card.Subtitle className="mb-3 text-muted" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Real-time monitoring
          </Card.Subtitle>

          {Object.entries(queueStatusMap).map(([service, status]) => (
            <Card
              key={service}
              className="mb-2"
                style={{
                  background: getQueueBg(status.waitingTickets),
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-light)",
                  transition: "all 0.3s ease"
                }}
            >
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center" style={{ gap: "0.75rem" }}>
                    <span
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        borderRadius: "999px",
                        backgroundColor: getQueueIndicatorColor(status.waitingTickets),
                        boxShadow: `0 0 8px ${getQueueIndicatorColor(status.waitingTickets)}50`
                      }}
                    />
                    <strong style={{ fontSize: "1rem", color: "var(--primary-dark)", fontWeight: 600 }}>{service}</strong>
                  </div>
                  <span style={{ 
                    fontSize: "0.85rem", 
                    fontWeight: 600,
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    background: getQueueIndicatorColor(status.waitingTickets) + "20",
                    color: getQueueIndicatorColor(status.waitingTickets)
                  }}>
                    {status.waitingTickets}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  <span><strong style={{ color: "var(--primary-dark)" }}>Waiting:</strong> {status.waitingTickets} {status.waitingTickets === 1 ? 'person' : 'people'}</span>
                  {status.servingTickets > 0 && (
                    <Badge bg="success" style={{ fontSize: "0.75rem" }}>
                      {status.servingTickets} serving
                    </Badge>
                  )}
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }} className="mb-1">
                  <strong style={{ color: "var(--primary-dark)" }}>Active Counters:</strong>{' '}
                  <Badge 
                    bg={status.activeCounters > 0 ? "primary" : "secondary"} 
                    style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}
                  >
                    {status.activeCounters}
                  </Badge>
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--primary-dark)" }}>Avg Wait Time:</strong>{' '}
                  <span style={{ 
                    color: status.estimatedWaitTime > 20 ? "#ff6b9d" : status.estimatedWaitTime > 10 ? "#ffc107" : "#00d4aa",
                    fontWeight: 600 
                  }}>
                    {status.estimatedWaitTime} min
                  </span>
                </div>
              </Card.Body>
            </Card>
          ))}

          <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--border-light)" }}>
            <small className="text-muted d-flex align-items-center justify-content-center" style={{ gap: "0.5rem", color: "var(--text-muted)" }}>
              <span style={{ 
                width: "0.5rem", 
                height: "0.5rem", 
                borderRadius: "999px",
                background: "#00d4aa",
                animation: "pulse 2s infinite"
              }} />
              Live updates every 3 seconds
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}