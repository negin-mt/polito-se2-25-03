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
    if (waiting <= 5) return "#d1e7dd";
    if (waiting <= 10) return "#fff3cd";
    return "#f8d7da";
  };

  const getQueueIndicator = (waiting) => {
    if (waiting <= 5) return "🟢";
    if (waiting <= 10) return "🟡";
    return "🔴";
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
    <div className="p-3 bg-light">
      <Card
        className="mx-auto"
        style={{
          width: "22rem",
          borderRadius: "0.75rem",
          border: "0.0625rem solid rgba(0,0,0,0.08)"
        }}
      >
        <Card.Body>
          <Card.Title className="mb-2" style={{ fontSize: "1.125rem", color: "#0b3d91" }}>
            Queue Status
          </Card.Title>
          <Card.Subtitle className="mb-3 text-muted" style={{ fontSize: "0.9rem" }}>
            Real-time monitoring
          </Card.Subtitle>

          {Object.entries(queueStatusMap).map(([service, status]) => (
            <Card
              key={service}
              className="mb-2"
                style={{
                  backgroundColor: getQueueBg(status.waitingTickets),
                  borderRadius: "0.5rem",
                  border: "0.0625rem solid rgba(0,0,0,0.06)"
                }}
            >
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
                    <span
                      style={{
                        width: "0.5rem",
                        height: "0.5rem",
                        borderRadius: "999px",
                        backgroundColor:
                          status.waitingTickets <= 5 ? "#198754" : status.waitingTickets <= 10 ? "#ffc107" : "#dc3545"
                      }}
                    />
                    <strong style={{ fontSize: "1rem" }}>{service}</strong>
                  </div>
                  <span style={{ fontSize: "1.25rem" }}>{getQueueIndicator(status.waitingTickets)}</span>
                </div>

                <div style={{ fontSize: "0.95rem" }} className="mb-1">
                  <strong>Waiting:</strong> {status.waitingTickets} people
                </div>
                <div style={{ fontSize: "0.95rem" }} className="mb-1">
                  <strong>Active Counters:</strong> {status.activeCounters}
                </div>
                <div style={{ fontSize: "0.95rem" }}>
                  <strong>Avg Wait Time:</strong> {status.estimatedWaitTime} min
                </div>
              </Card.Body>
            </Card>
          ))}

          <div className="mt-3 pt-2 border-top" style={{ borderColor: "#dee2e6" }}>
            <small className="text-muted d-flex align-items-center" style={{ gap: "0.5rem" }}>
              <Badge bg="success" pill style={{ width: "0.5rem", height: "0.5rem", padding: 0 }} />
              Live updates every 3 seconds
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}