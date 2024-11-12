import React, { useEffect, useState } from "react";
import './bai5.scss';
import { BsFillExclamationTriangleFill } from "react-icons/bs";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const API_BASE_URL = 'http://localhost:5000'; // Add this line

function Bai5() {
    const [windSpeedData, setWindSpeedData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [currentWindSpeed, setCurrentWindSpeed] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const updateLabels = (timestamp) => {
            const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLabels(prev => {
                const newLabels = [...prev, time];
                if (newLabels.length > 7) newLabels.shift();
                return newLabels;
            });
        };

        const fetchWindData = async () => {
            try {
                setError(null);
                const response = await fetch(`${API_BASE_URL}/api/wind-data`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Received wind data:', data); // Debug log
                
                setCurrentWindSpeed(data.windspeed);
                setWindSpeedData(prev => {
                    const newData = [...prev, data.windspeed];
                    if (newData.length > 7) newData.shift();
                    return newData;
                });
                updateLabels(Date.now());
                setIsLoading(false);
            } catch (error) {
                console.error('Error details:', error);
                setError(`Failed to fetch wind data: ${error.message}`);
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchWindData();

        // Set up polling interval
        const interval = setInterval(fetchWindData, 10000);

        return () => clearInterval(interval);
    }, []);

    // Enhanced error display
    if (error) {
        return (
            <div className="error-container" style={{ padding: '20px', color: 'red' }}>
                <h3>Error Loading Data</h3>
                <p>{error}</p>
                <p>Please check:</p>
                <ul>
                    <li>Backend server is running on port 5000</li>
                    <li>MQTT broker is connected</li>
                    <li>Network connection is stable</li>
                </ul>
            </div>
        );
    }

    // Rest of the component remains the same...
    return (
        <>
            <div className="box">
                <div className="WindSpeed">
                    <span>WindSpeed:</span>
                    <div className="giatri">
                        {isLoading ? 'Loading...' : `${currentWindSpeed.toFixed(1)} (m/s)`}
                    </div>
                </div>
                <div className="canhbao">
                    <BsFillExclamationTriangleFill 
                        className={`warning-icon ${currentWindSpeed > 60 ? 'blink' : ''}`}
                        title={currentWindSpeed > 60 ? 'High wind speed warning!' : 'Normal wind speed'}
                    />
                </div>
            </div>
            <div className="chartbai5">
                {!isLoading && (
                    <Line 
                        data={{
                            labels: labels,
                            datasets: [{
                                label: "Wind Speed (m/s)",
                                data: windSpeedData,
                                backgroundColor: "rgba(0, 123, 255, 0.2)",
                                borderColor: "rgba(0, 123, 255, 1)",
                                borderWidth: 2,
                                pointBackgroundColor: "rgba(0, 123, 255, 1)",
                            }]
                        }} 
                        options={{ 
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Wind Speed (m/s)'
                                    }
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Time'
                                    }
                                }
                            }
                        }} 
                    />
                )}
            </div>
        </>
    );
}

export default Bai5;