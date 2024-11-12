const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const app = express();
const PORT = 5000;
const connection = require('./config/database');
require('dotenv').config();
app.use(cors());
app.use(express.json());

const mqttHost = '192.168.33.5';
const mqttPort = '1893';
const mqttClientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const connectUrl = `mqtt://${mqttHost}:${mqttPort}`;

const client = mqtt.connect(connectUrl, {
  clientId: mqttClientId,
  clean: true,
  connectTimeout: 4000,
  username: 'minh',
  password: 'b21dccn525',
  reconnectPeriod: 1000,
});

let sensorData = {
  temperature: 0,
  humidity: 0,
  light: 0,
  timestamp: new Date().toLocaleTimeString(),
};

let lightStates = {
  light1: false,
  light2: false,
  light3: false,
};

let recentControlledLight = null;
let windspeed = 0;
let alertCounter = 0;

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe([
    'temperature', 
    'humidity', 
    'light_intensity',
    'windspeed',
    'light1/status',
    'light2/status',
    'light3/status'
  ], () => {
    console.log(`Subscribed to topics`);
  });
});

client.on('message', async (topic, payload) => {
  console.log('Received Message:', topic, payload.toString());

  if (['temperature', 'humidity', 'light_intensity'].includes(topic)) {
    const value = parseFloat(payload.toString());
    switch (topic) {
      case 'temperature':
        sensorData.temperature = value;
        break;
      case 'humidity':
        sensorData.humidity = value;
        break;
      case 'light_intensity':
        sensorData.light = value;
        break;
    }
    sensorData.timestamp = new Date().toLocaleTimeString();

    try {
      const [rows] = await connection.promise().query('SELECT COUNT(*) as count FROM sensor');
      const count = rows[0].count;

      if (count >= 100) {
        await connection.promise().query('DELETE FROM sensor ORDER BY ID ASC LIMIT 1');
      }

      await connection.promise().query(
        'INSERT INTO sensor (temperature, humidity, light, Datesave) VALUES (?, ?, ?, ?)', 
        [sensorData.temperature, sensorData.humidity, sensorData.light, new Date()]
      );

      console.log('Sensor data saved to database');
    } catch (err) {
      console.error('Error inserting sensor data:', err);
    }
  }

  if (topic === 'windspeed') {
    // Cập nhật biến windspeed toàn cục
    windspeed = parseFloat(payload.toString());
    console.log('Updated windspeed:', windspeed);
  
    // Xử lý lưu vào database
    try {
      if (windspeed > 60) {
        await connection.promise().query(
          'INSERT INTO wind_alerts (windspeed, alert_active) VALUES (?, ?)',
          [windspeed, true]
        );
        console.log(`Wind alert recorded with windspeed: ${windspeed}`);
      } else {
        await connection.promise().query(
          'INSERT INTO wind_alerts (windspeed, alert_active) VALUES (?, ?)',
          [windspeed, false]
        );
        console.log(`Normal wind speed recorded: ${windspeed}`);
      }
    } catch (err) {
      console.error('Error inserting wind data:', err);
    }
  }
  

  if (topic.endsWith('/status')) {
    const lightName = topic.split('/')[0];
    const newState = payload.toString() === 'true';

    if (lightName === recentControlledLight && lightStates[lightName] !== newState) {
      lightStates[lightName] = newState;

      try {
        await connection.promise().query(
          'INSERT INTO light_history (light_name, state) VALUES (?, ?)',
          [lightName, newState]
        );
        console.log(`Light state ${lightName}: ${newState} saved to database`);
      } catch (err) {
        console.error('Error saving light state:', err);
      }

      recentControlledLight = null;
    }
  }
});

app.post('/api/control-light', async (req, res) => {
  const { light, state } = req.body;
  if (light in lightStates) {
    let mqttMessage;
    if (light === 'light1') mqttMessage = state ? '0' : '1';
    if (light === 'light2') mqttMessage = state ? '2' : '3';
    if (light === 'light3') mqttMessage = state ? '4' : '5';

    recentControlledLight = light;

    client.publish('inTopic', mqttMessage, { qos: 0, retain: false }, (error) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending command to device' });
      } else {
        res.json({ message: `Command sent to ${light}` });
      }
    });
  } else {
    res.status(400).json({ message: 'Invalid light' });
  }
});
app.get('/api/wind-data', (req, res) => {
  res.json({ windspeed });
});

app.get('/api/sensor-data', (req, res) => {
  res.json(sensorData);
});

app.get('/api/light-states', (req, res) => {
  res.json(lightStates);
});

app.get('/api/light-history', async (req, res) => {
  const { page = 1, limit = 10, search = '', sortKey = 'timestamp', sortDirection = 'ASC' } = req.query;

  const offset = (page - 1) * limit;

  try {
    const query = `
      SELECT * FROM light_history 
      WHERE light_name LIKE ? 
      ORDER BY ${sortKey} ${sortDirection === 'DESC' ? 'DESC' : 'ASC'}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.promise().query(query, [`%${search}%`, parseInt(limit), parseInt(offset)]);

    const [totalRows] = await connection.promise().query('SELECT COUNT(*) as total FROM light_history WHERE light_name LIKE ?', [`%${search}%`]);
    const total = totalRows[0].total;

    res.json({
      data: rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (err) {
    console.error('Error fetching light history:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.get('/api/sensor', (req, res) => {
  const { page = 1, limit = 10, search = '', sortKey = 'ID', sortDirection = 'ASC' } = req.query;

  const offset = (page - 1) * limit;
  
  const queryCount = `SELECT COUNT(*) as total FROM sensor WHERE Datesave LIKE ?`;
  const queryData = `
    SELECT * FROM sensor 
    WHERE Datesave LIKE ? 
    ORDER BY ${sortKey} ${sortDirection === 'DESC' ? 'DESC' : 'ASC'} 
    LIMIT ? OFFSET ?`;

  connection.query(queryCount, [`%${search}%`], (err, countResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const total = countResults[0].total;

    connection.query(queryData, [`%${search}%`, parseInt(limit), parseInt(offset)], (err, dataResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        data: dataResults,
        total: total,
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
