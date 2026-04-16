import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "leaflet/dist/leaflet.css";

let API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
if (API_BASE_URL.includes("localhost") && window.location.hostname !== "localhost") {
  API_BASE_URL = API_BASE_URL.replace("localhost", window.location.hostname);
}
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
