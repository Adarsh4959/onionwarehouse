import React, { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "./firebase";
import { Container, Row, Col, Card, Toast, ToastContainer } from "react-bootstrap";
import {
  FaTemperatureHigh,
  FaTint,
  FaCloudMeatball,
  FaBoxOpen,
  FaFan,
  FaFire
} from "react-icons/fa";
import "./styles.css";

const WarehouseDashboard = () => {
  const [data, setData] = useState({
    warehouse1: {},
    warehouse2: {},
    avg_humidity: null
  });
  const [confirmState, setConfirmState] = useState({ show: false, message: "", warehouse: "", next: "" });

  useEffect(() => {
    const dbRef1 = ref(database, "warehouse1");
    const dbRef2 = ref(database, "warehouse2");
    const avgHumidityRef = ref(database, "avg_humidity");

    const unsub1 = onValue(dbRef1, snap =>
      setData(prev => ({ ...prev, warehouse1: snap.val() || {} }))
    );
    const unsub2 = onValue(dbRef2, snap =>
      setData(prev => ({ ...prev, warehouse2: snap.val() || {} }))
    );
    const unsub3 = onValue(avgHumidityRef, snap =>
      setData(prev => ({ ...prev, avg_humidity: snap.val() }))
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  // Auto control fan in Warehouse 1 based on avg_humidity
  useEffect(() => {
    const avgH = Number(data.avg_humidity);
    let fanStatus = data.warehouse1.fan_status;

    if (!isNaN(avgH)) {
      if (avgH < 60) {
        fanStatus = "HALF";
      } else if (avgH >= 60 && avgH <= 69) {
        fanStatus = "OFF";
      } else if (avgH > 70) {
        fanStatus = "FULL";
      }

      if (data.warehouse1.fan_status !== fanStatus) {
        set(ref(database, "warehouse1/fan_status"), fanStatus);
      }
    }
  }, [data.avg_humidity, data.warehouse1.fan_status]);

  const totalCapacity = 10000;
  const weight1 = Number(data.warehouse1.weight || 0);
  const vacantWeight = totalCapacity - weight1;

  const renderSensorCard = (icon, value, className = "") => (
    <div className="sensor-card equal-height">
      <span className={`icon ${className}`}>{icon}</span> {value}
    </div>
  );

  const renderWarehouse = (warehouseData, id) => {
    const isSecond = id === 2;
    const flame = Number(warehouseData.flame ?? -1);
    return (
      <Col md={6} className="mb-4">
        <Card className="warehouse-card text-center">
          <Card.Body>
            <Card.Title>{id === 1 ? "Onion Monitoring" : "Warehouse Monitoring"}</Card.Title>
            {renderSensorCard(<FaTemperatureHigh />, `${warehouseData.temperature ?? "--"}°C`, "text-danger")}
            {renderSensorCard(<FaTint />, `${warehouseData.humidity ?? "--"}%`, "text-info")}
            {renderSensorCard(<FaCloudMeatball />, `${warehouseData.methane ?? "--"} ppm`, "text-warning")}

            {!isSecond ? (
              <>
                {renderSensorCard(<FaBoxOpen />, `${warehouseData.weight ?? "--"} kg`, "text-success")}
                {renderSensorCard(
                  <FaFan />,
                  `Fan: ${warehouseData.fan_status ?? "OFF"}`,
                  warehouseData.fan_status === "FULL"
                    ? "text-danger fan-on"
                    : warehouseData.fan_status === "HALF"
                    ? "text-warning fan-on"
                    : "text-muted"
                )}
              </>
            ) : (
              <>
                {renderSensorCard(
                  <FaFire />,
                  `Flame: ${warehouseData.flame ?? "--"} - ${
                    flame < 100 ? "🔥 High Flame" : "✅ Low Flame"
                  }`,
                  flame < 100 ? "text-danger" : "text-success"
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <Container fluid className="dashboard-container">
      <h2 className="text-center text-light mb-4">Smart Allium Cepa Preservation System using IOT</h2>
      <Row>
        {renderWarehouse(data.warehouse1, 1)}
        {renderWarehouse(data.warehouse2, 2)}
      </Row>

      {/* Average Humidity Box */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="shadow-lg text-center bg-dark text-light">
            <Card.Body>
              <Card.Title>Average Humidity</Card.Title>
              <h3 className="text-info">
                {data.avg_humidity !== null ? `${data.avg_humidity} %` : "--"}
              </h3>
            </Card.Body>
          </Card>
        </Col>

        {/* Vacant Capacity */}
        <Col md={6}>
          <Card className="shadow-lg text-center bg-dark text-light">
            <Card.Body>
              <Card.Title>Total Vacant Capacity</Card.Title>
              <h3 className="text-warning">{vacantWeight} kg</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notification Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={confirmState.show}
          onClose={() => setConfirmState(prev => ({ ...prev, show: false }))}
          delay={5000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{confirmState.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default WarehouseDashboard;
