// src/WarehouseDashboard.js
import React, { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "./firebase";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaTemperatureHigh, FaTint, FaCloudMeatball, FaBoxOpen, FaFan } from "react-icons/fa";
import "./styles.css";

const WarehouseDashboard = () => {
  const [data, setData] = useState({
    warehouse1: {},
    warehouse2: {},
  });

  useEffect(() => {
    const dbRef1 = ref(database, "warehouse1");
    const dbRef2 = ref(database, "warehouse2");

    const unsubscribe1 = onValue(dbRef1, (snapshot) => {
      setData((prev) => ({
        ...prev,
        warehouse1: snapshot.val() || {},
      }));
    });

    const unsubscribe2 = onValue(dbRef2, (snapshot) => {
      setData((prev) => ({
        ...prev,
        warehouse2: snapshot.val() || {},
      }));
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, []);

  const toggleFan = (warehouse) => {
    const fanStatus = data[warehouse]?.fan_status === "ON" ? "OFF" : "ON";
    set(ref(database, `${warehouse}/fan_status`), fanStatus);
  };

  const totalCapacity = 10000;
  const weight1 = Number(data?.warehouse1?.onion_weight || 0);
  const weight2 = Number(data?.warehouse2?.onion_weight || 0);
  const totalWeight = weight1 + weight2;
  const vacantWeight = totalCapacity - totalWeight;

  const renderWarehouse = (warehouseData, id) => (
    <Col md={6}>
      <Card className="warehouse-card text-center">
        <Card.Body>
          <Card.Title className="warehouse-title">{`Warehouse ${id}`}</Card.Title>
          <div className="sensor-card">
            <FaTemperatureHigh className="icon text-danger" />{" "}
            {warehouseData?.temperature ?? "--"}°C
          </div>
          <div className="sensor-card">
            <FaTint className="icon text-info" /> {warehouseData?.humidity ?? "--"}%
          </div>
          <div className="sensor-card">
            <FaCloudMeatball className="icon text-warning" /> {warehouseData?.methane ?? "--"} ppm
          </div>
          <div className="sensor-card">
            <FaBoxOpen className="icon text-success" /> {warehouseData?.onion_weight ?? "--"} kg
          </div>
          <div className="sensor-card">
            <FaFan
              className={
                warehouseData?.fan_status === "ON"
                  ? "fan-on icon text-primary"
                  : "icon text-muted"
              }
            />{" "}
            {warehouseData?.fan_status ?? "OFF"}
          </div>
          <Button
            variant={warehouseData?.fan_status === "ON" ? "danger" : "success"}
            onClick={() => toggleFan(`warehouse${id}`)}
          >
            {warehouseData?.fan_status === "ON" ? "Turn OFF" : "Turn ON"} Fan
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container fluid className="dashboard-container">
      <h2 className="text-center text-light mb-4">
        Onion Warehouse Monitoring Dashboard
      </h2>

      <Row>
        {renderWarehouse(data?.warehouse1, 1)}
        {renderWarehouse(data?.warehouse2, 2)}
      </Row>

      <Row className="mt-4">
        <Col md={12}>
          <Card className="shadow-lg text-center bg-dark text-light">
            <Card.Body>
              <Card.Title>Total Vacant Capacity</Card.Title>
              <h3 className="text-warning">{vacantWeight} kg</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WarehouseDashboard;
