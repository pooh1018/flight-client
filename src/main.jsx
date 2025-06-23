import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'element-theme-default';
import './styles/global.scss';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
  </BrowserRouter>
);
