const axios = require('axios');

const API_URL = 'http://localhost:8082/gps';

function randomBetween(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(6));
}

function randomDelay() {
  return Math.floor(Math.random() * 2000) + 3000;
}

function shouldSendInvalidRequest() {
  return Math.random() < 0.10;
}

const vehicles = Array.from({ length: 20 }, (_, index) => {
  const vehicleNumber = String(index + 1).padStart(3, '0');

  return {
    vehicle_id: `VH-${vehicleNumber}`,
    lat: randomBetween(4.60, 4.75),
    lng: randomBetween(-74.20, -73.95),
    mode:
      index < 12
        ? 'MOVING'
        : index < 17
        ? 'STOPPED'
        : 'NO_SIGNAL',
    active: true,
  };
});

function moveVehicle(vehicle) {
  if (vehicle.mode !== 'MOVING') return;

  vehicle.lat = Number(
    (vehicle.lat + randomBetween(-0.001, 0.001)).toFixed(6)
  );

  vehicle.lng = Number(
    (vehicle.lng + randomBetween(-0.001, 0.001)).toFixed(6)
  );
}

function createInvalidPayload(vehicle) {
  const invalidPayloads = [
    {},
    {
      vehicle_id: vehicle.vehicle_id,
    },
    {
      vehicle_id: '',
      lat: vehicle.lat,
      lng: vehicle.lng,
      timestamp: new Date().toISOString(),
    },
    {
      vehicle_id: vehicle.vehicle_id,
      lat: 999,
      lng: vehicle.lng,
      timestamp: new Date().toISOString(),
    },
    {
      vehicle_id: vehicle.vehicle_id,
      lat: vehicle.lat,
      lng: -999,
      timestamp: new Date().toISOString(),
    },
  ];

  return invalidPayloads[
    Math.floor(Math.random() * invalidPayloads.length)
  ];
}

async function sendGps(vehicle) {
  if (vehicle.mode === 'NO_SIGNAL' && !vehicle.active) {
    return;
  }

  moveVehicle(vehicle);

  const payload = shouldSendInvalidRequest()
    ? createInvalidPayload(vehicle)
    : {
        vehicle_id: vehicle.vehicle_id,
        lat: vehicle.lat,
        lng: vehicle.lng,
        timestamp: new Date().toISOString(),
      };

  try {
    const response = await axios.post(API_URL, payload);

    console.log(
      `[${response.status}] ${vehicle.vehicle_id} -> ${response.data.status}`
    );
  } catch (error) {
    const status = error.response?.status || 'ERROR';

    console.log(
      `[${status}] Payload inválido enviado por ${vehicle.vehicle_id}`
    );
  }
}

function startVehicle(vehicle) {
  const execute = async () => {
    await sendGps(vehicle);

    setTimeout(execute, randomDelay());
  };

  execute();
}

function scheduleNoSignalVehicles() {
  const noSignalVehicles = vehicles.filter(
    (vehicle) => vehicle.mode === 'NO_SIGNAL'
  );

  setTimeout(() => {
    noSignalVehicles.forEach((vehicle) => {
      vehicle.active = false;

      console.log(
        `🚫 ${vehicle.vehicle_id} dejó de reportar datos`
      );
    });
  }, 30000);
}

console.log('===================================');
console.log('🚀 Fleet Telemetry Simulator');
console.log('===================================');
console.log('📡 Backend:', API_URL);
console.log('🚗 Vehículos totales: 20');
console.log('🟢 Movimiento: 12');
console.log('🟡 Detenidos: 5');
console.log('🔴 Sin señal: 3');
console.log('⚠️ Requests inválidos: 10%');
console.log('===================================');

vehicles.forEach(startVehicle);

scheduleNoSignalVehicles();