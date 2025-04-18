// src/WarehouseDashboard.js
import React, { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "./firebase";
import { Container, Row, Col, Card, Button, Toast, ToastContainer } from "react-bootstrap";
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
  const [data, setData] = useState({ warehouse1: {}, warehouse2: {} });
  const [confirmState, setConfirmState] = useState({ show: false, message: "", warehouse: "", next: "" });

  useEffect(() => {
    const dbRef1 = ref(database, "warehouse1");
    const dbRef2 = ref(database, "warehouse2");
    const unsub1 = onValue(dbRef1, snap => setData(prev => ({ ...prev, warehouse1: snap.val() || {} })));
    const unsub2 = onValue(dbRef2, snap => setData(prev => ({ ...prev, warehouse2: snap.val() || {} })));
    return () => { unsub1(); unsub2(); };
  }, []);

  // Sync fan of warehouse1 to flame status of warehouse2
  useEffect(() => {
    const flame = data.warehouse2.flame_status;
    const fan1 = data.warehouse1.fan_status;
    if (flame === "High" && fan1 !== "ON") set(ref(database, "warehouse1/fan_status"), "ON");
    if (flame === "Low" && fan1 !== "OFF") set(ref(database, "warehouse1/fan_status"), "OFF");
  }, [data.warehouse2.flame_status]);

  const handleToggle = warehouse => {
    const current = data[warehouse].fan_status;
    const next = current === "ON" ? "OFF" : "ON";
    // emergency when turning off during High flame
    if (warehouse === "warehouse1" && data.warehouse2.flame_status === "High" && next === "OFF") {
      setConfirmState({
        show: true,
        warehouse,
        next,
        message: "🔥 Flame is still high! Turning off the fan may damage the onions. Click confirm to proceed."
      });
      return;
    }
    // caution when turning on during Low flame
    if (warehouse === "warehouse1" && data.warehouse2.flame_status === "Low" && next === "ON") {
      setConfirmState({
        show: true,
        warehouse,
        next,
        message: "⚠️ Flame is low. Unnecessary fan operation may affect onion quality. Confirm to proceed."
      });
      return;
    }
    // direct toggle
    set(ref(database, `${warehouse}/fan_status`), next);
  };

  const confirmAction = () => {
    const { warehouse, next } = confirmState;
    set(ref(database, `${warehouse}/fan_status`), next);
    setConfirmState({ show: false, message: "", warehouse: "", next: "" });
  };

  const totalCapacity = 10000;
  const weight1 = Number(data.warehouse1.weight || 0);
  const vacantWeight = totalCapacity - weight1;

  const renderSensorCard = (icon, value, className = "") => (
    <div className="sensor-card equal-height">
      <span className={`icon ${className}`}>{icon}</span> {value}
    </div>
  );

  const renderWarehouse = (warehouseData, id) => {
    const is2 = id === 2;
    return (
      <Col md={6}>
        <Card className="warehouse-card text-center">
          <Card.Body>
            <Card.Title>Warehouse {id}</Card.Title>
            {renderSensorCard(<FaTemperatureHigh />, `${warehouseData.temperature ?? "--"}°C`, "text-danger")}
            {renderSensorCard(<FaTint />, `${warehouseData.humidity ?? "--"}%`, "text-info")}
            {renderSensorCard(<FaCloudMeatball />, `${warehouseData.methane ?? "--"} ppm`, "text-warning")}
            {!is2 ? (
              <>
                {renderSensorCard(<FaBoxOpen />, `${warehouseData.weight ?? "--"} kg`, "text-success")}
                {renderSensorCard(<FaFan />, warehouseData.fan_status ?? "OFF", warehouseData.fan_status === "ON" ? "fan-on text-primary" : "text-muted")}
                <Button variant={warehouseData.fan_status === "ON" ? "danger" : "success"}
                  onClick={() => handleToggle(`warehouse${id}`)}>
                  {warehouseData.fan_status === "ON" ? "Turn OFF" : "Turn ON"} Fan
                </Button>
              </>
            ) : (
              <>
                {renderSensorCard(<FaFire />, warehouseData.flame_status ?? "--", "text-danger")}
                {warehouseData.flame_status === "High" && (
                  <div className="alert alert-danger mt-3">🔥 Automatic fan ON in Warehouse 1</div>
                )}
                <Button variant="secondary" style={{ visibility: "hidden" }}>Placeholder</Button>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <Container fluid className="dashboard-container">
      <h2 className="text-center text-light mb-4">Onion Warehouse Monitoring Dashboard</h2>
      <Row>{renderWarehouse(data.warehouse1, 1)}{renderWarehouse(data.warehouse2, 2)}</Row>
      <Row className="mt-4"><Col md={12}><Card className="shadow-lg text-center bg-dark text-light"><Card.Body><Card.Title>Total Vacant Capacity</Card.Title><h3 className="text-warning">{vacantWeight} kg</h3></Card.Body></Card></Col></Row>
      {/* Confirmation Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast show={confirmState.show} onClose={() => setConfirmState(prev => ({ ...prev, show: false }))} delay={5000} autohide>
          <Toast.Header><strong className="me-auto">Action Required</strong></Toast.Header>
          <Toast.Body>
            {confirmState.message}
            <div className="mt-2 text-end">
              <Button size="sm" variant="primary" onClick={confirmAction}>Confirm</Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default WarehouseDashboard;
