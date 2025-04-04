import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaTemperatureHigh, FaTint, FaFan, FaBoxOpen, FaCloudMeatball } from "react-icons/fa";
import "./styles.css";

const WarehouseDashboard = () => {
  const [sensorData, setSensorData] = useState({
    warehouse1: {},
    warehouse2: {},
    totalCapacity: 10000, // Example total capacity
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/warehouse-data");
        const data = await response.json();

        if (Array.isArray(data) && data.length === 2) {
          const warehouse1 = data.find((w) => w.warehouse_id === 1) || {};
          const warehouse2 = data.find((w) => w.warehouse_id === 2) || {};

          setSensorData({
            warehouse1: {
              temperature: warehouse1.temperature ?? "--",
              humidity: warehouse1.humidity ?? "--",
              methane: warehouse1.methane_level ?? "--",
              weight: warehouse1.onion_weight ?? "--",
              fan: warehouse1.fan_status === "ON",
            },
            warehouse2: {
              temperature: warehouse2.temperature ?? "--",
              humidity: warehouse2.humidity ?? "--",
              methane: warehouse2.methane_level ?? "--",
              weight: warehouse2.onion_weight ?? "--",
              fan: warehouse2.fan_status === "ON",
            },
            totalCapacity: 10000,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Function to toggle fan status
  const toggleFan = async (warehouseId) => {
    const newFanStatus =
      warehouseId === 1
        ? !sensorData.warehouse1.fan
        : !sensorData.warehouse2.fan;

    try {
      const response = await fetch("http://localhost:5000/api/update-fan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouse_id: warehouseId,
          fan_status: newFanStatus ? "ON" : "OFF",
        }),
      });

      if (response.ok) {
        setSensorData((prevData) => ({
          ...prevData,
          [`warehouse${warehouseId}`]: {
            ...prevData[`warehouse${warehouseId}`],
            fan: newFanStatus,
          },
        }));
      } else {
        console.error("Failed to update fan status");
      }
    } catch (error) {
      console.error("Error updating fan status:", error);
    }
  };

  const totalOnionWeight =
    (sensorData?.warehouse1?.weight || 0) + (sensorData?.warehouse2?.weight || 0);
  const vacantWeight = sensorData.totalCapacity - totalOnionWeight;

  return (
    <Container fluid className="dashboard-container">
      <h2 className="text-center text-light mb-4">
        Onion Warehouse Monitoring Dashboard
      </h2>

      <Row>
        {/* Warehouse 1 */}
        <Col md={6}>
          <Card className="warehouse-card text-center">
            <Card.Body>
              <Card.Title className="warehouse-title">Warehouse 1</Card.Title>
              <div className="sensor-card">
                <FaTemperatureHigh className="icon text-danger" />{" "}
                {sensorData?.warehouse1?.temperature}°C
              </div>
              <div className="sensor-card">
                <FaTint className="icon text-info" />{" "}
                {sensorData?.warehouse1?.humidity}%
              </div>
              <div className="sensor-card">
                <FaCloudMeatball className="icon text-warning" />{" "}
                {sensorData?.warehouse1?.methane} ppm
              </div>
              <div className="sensor-card">
                <FaBoxOpen className="icon text-success" />{" "}
                {sensorData?.warehouse1?.weight} kg
              </div>
              <div className="sensor-card">
                <FaFan
                  className={
                    sensorData?.warehouse1?.fan
                      ? "fan-on icon text-primary"
                      : "icon text-muted"
                  }
                />{" "}
                {sensorData?.warehouse1?.fan ? "ON" : "OFF"}
              </div>
              <Button
                variant={sensorData?.warehouse1?.fan ? "danger" : "success"}
                onClick={() => toggleFan(1)}
              >
                {sensorData?.warehouse1?.fan ? "Turn OFF" : "Turn ON"} Fan
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Warehouse 2 */}
        <Col md={6}>
          <Card className="warehouse-card text-center">
            <Card.Body>
              <Card.Title className="warehouse-title">Warehouse 2</Card.Title>
              <div className="sensor-card">
                <FaTemperatureHigh className="icon text-danger" />{" "}
                {sensorData?.warehouse2?.temperature}°C
              </div>
              <div className="sensor-card">
                <FaTint className="icon text-info" />{" "}
                {sensorData?.warehouse2?.humidity}%
              </div>
              <div className="sensor-card">
                <FaCloudMeatball className="icon text-warning" />{" "}
                {sensorData?.warehouse2?.methane} ppm
              </div>
              <div className="sensor-card">
                <FaBoxOpen className="icon text-success" />{" "}
                {sensorData?.warehouse2?.weight} kg
              </div>
              <div className="sensor-card">
                <FaFan
                  className={
                    sensorData?.warehouse2?.fan
                      ? "fan-on icon text-primary"
                      : "icon text-muted"
                  }
                />{" "}
                {sensorData?.warehouse2?.fan ? "ON" : "OFF"}
              </div>
              <Button
                variant={sensorData?.warehouse2?.fan ? "danger" : "success"}
                onClick={() => toggleFan(2)}
              >
                {sensorData?.warehouse2?.fan ? "Turn OFF" : "Turn ON"} Fan
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Vacant Capacity */}
      <Row className="mt-4">
        <Col md={12}>
          <Card className="shadow-lg text-center bg-dark text-light">
            <Card.Body>
              <Card.Title>Total Vacant Weight</Card.Title>
              <h3 className="text-warning">{vacantWeight} kg</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WarehouseDashboard;
