import React from 'react';
import { FaFan, FaTemperatureHigh } from 'react-icons/fa';
import { CiSun } from 'react-icons/ci';
import { BsLightbulb } from 'react-icons/bs';
import { GiWaterDrop } from 'react-icons/gi';
import { TbAirConditioning } from 'react-icons/tb';
import LineChart from './LineChart';
import axios from 'axios';
import './Home.scss';

class Home extends React.Component {
  state = {
    light1: false,
    light2: false,
    light3: false,
    light1Loading: false,
    light2Loading: false,
    light3Loading: false,
    temperature: null,
    humidity: null,
    light: null,
    temperatureData: [],
    humidityData: [],
    lightData: [],
    labels: [],
  };

  componentDidMount() {
    this.fetchSensorData();
    this.fetchLightStates();
    // Thêm polling cho cả sensor data và light states
    this.sensorInterval = setInterval(this.fetchSensorData, 2000);
    this.lightInterval = setInterval(this.fetchLightStates, 1000);
  }

  componentWillUnmount() {
    // Clear tất cả các intervals
    clearInterval(this.sensorInterval);
    clearInterval(this.lightInterval);
  }

  fetchSensorData = () => {
    axios.get('http://localhost:5000/api/sensor-data')
      .then((response) => {
        const { temperature, humidity, light, timestamp } = response.data;

        this.setState((prevState) => ({
          temperature,
          humidity,
          light,
          temperatureData: [...prevState.temperatureData, temperature].slice(-10),
          humidityData: [...prevState.humidityData, humidity].slice(-10),
          lightData: [...prevState.lightData, light].slice(-10),
          labels: [...prevState.labels, timestamp].slice(-10),
        }));
      })
      .catch((error) => {
        console.error('Lỗi khi gọi API:', error);
      });
  };

  fetchLightStates = () => {
    axios.get('http://localhost:5000/api/light-states')
      .then(response => {
        const { light1, light2, light3 } = response.data;
        
        // Chỉ cập nhật state nếu có sự thay đổi
        this.setState(prevState => {
          if (prevState.light1 !== light1 || 
              prevState.light2 !== light2 || 
              prevState.light3 !== light3) {
            return {
              light1,
              light2,
              light3,
              // Reset loading states nếu trạng thái đã thay đổi
              light1Loading: false,
              light2Loading: false,
              light3Loading: false
            };
          }
          return null;
        });
      })
      .catch(error => {
        console.error('Error fetching light states:', error);
      });
  };

  toggleLight = (light) => {
    const loadingKey = `${light}Loading`;
    const newState = !this.state[light];
    
    this.setState({ [loadingKey]: true });

    axios.post('http://localhost:5000/api/control-light', {
      light: light,
      state: newState
    })
    .catch(error => {
      console.error('Error toggling light:', error);
      this.setState({ 
        [loadingKey]: false,
        // Revert back to original state in case of error
        [light]: !newState
      });
    });
  };

  render() {
    const { 
      light1, light2, light3, 
      light1Loading, light2Loading, light3Loading,
      temperature, humidity, light, 
      temperatureData, humidityData, lightData, labels 
    } = this.state;

    const temperatureChartData = {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temperatureData,
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        borderColor: 'rgba(255, 165, 0, 1)',
      }],
    };

    const humidityChartData = {
      labels,
      datasets: [{
        label: 'Humidity (%)',
        data: humidityData,
        backgroundColor: 'rgba(0, 94, 255, 0.468)',
        borderColor: 'rgba(0, 94, 255, 0.468)',
      }],
    };

    const lightChartData = {
      labels,
      datasets: [{
        label: 'Light (Lux)',
        data: lightData,
        backgroundColor: 'rgb(255, 255, 0)',
        borderColor: 'rgb(255, 255, 0)',
      }],
    };
    const getBackgroundColor = (value, maxValue, baseColor) => {
      const opacity = Math.min(1, value / maxValue); // Giới hạn độ đậm từ 0 đến 1
      return `rgba(${baseColor}, ${opacity})`;
    };

    // Màu nền cho các box
    const temperatureBgColor = getBackgroundColor(temperature || 0, 50, "255, 165, 0"); // Orange
    const humidityBgColor = getBackgroundColor(humidity || 0, 100, "0, 94, 255"); // Blue
    const lightBgColor = getBackgroundColor(light || 0, 1000, "255, 255, 0"); // Yellow
    return (
      <div className='home'>
        <div className="container">
        <div className="box1" style={{ backgroundColor: temperatureBgColor }}>
            <span className="textT">Temperature</span>
            <div className="Icon"><FaTemperatureHigh /></div>
            <div className='inform'>{temperature !== null ? `${temperature}°C` : 'Loading...'}</div>
          </div>

          <div className="box2" style={{ backgroundColor: humidityBgColor }}>
            <span className="text">Humidity</span>
            <div className="Icon"><GiWaterDrop /></div>
            <div className='inform1'>{humidity !== null ? `${humidity}%` : 'Loading...'}</div>
          </div>

          <div className="box3" style={{ backgroundColor: lightBgColor }}>
            <span className="textL">Light</span>
            <div className="IconL"><CiSun /></div>
            <div className='inform2'>{light !== null ? `${light} lux` : 'Loading...'}</div>
          </div>
          
          <div className="Light">
            <span className="text">Light 1</span>
            <div className="button">
              <div className={light1 ? "Icon1" : "Icon4"}><BsLightbulb /></div>
              <div>
                <button 
                  className={light1 ? 'button-On' : 'button-Off'} 
                  onClick={() => this.toggleLight('light1')}
                  disabled={light1Loading}
                >
                  {light1Loading ? 'Loading...' : (light1 ? 'ON' : 'OFF')}
                </button>
              </div>
            </div>
          </div>

          <div className="Fan">
            <span className="text">Light 2</span>
            <div className="button">
              <div className={light2 ? "Icon1" : "Icon4"}><BsLightbulb /></div>
              <div>
                <button 
                  className={light2 ? 'button-On' : 'button-Off'} 
                  onClick={() => this.toggleLight('light2')}
                  disabled={light2Loading}
                >
                  {light2Loading ? 'Loading...' : (light2 ? 'ON' : 'OFF')}
                </button>
              </div>
            </div>
          </div>

          <div className="AC">
            <span className="text">Light 3</span>
            <div className="button">
              <div className={light3 ? "Icon1" : "Icon4"}><BsLightbulb /></div>
              <div>
                <button 
                  className={light3 ? 'button-On' : 'button-Off'} 
                  onClick={() => this.toggleLight('light3')}
                  disabled={light3Loading}
                >
                  {light3Loading ? 'Loading...' : (light3 ? 'ON' : 'OFF')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='chart'>
          <div className='chart1'>
            <LineChart data={temperatureChartData} title="Temperature" />
            <LineChart data={humidityChartData} title="Humidity" />
            <LineChart data={lightChartData} title="Light" />
          </div>
        </div>
      </div>
    );
  }
}

export default Home;