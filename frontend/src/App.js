import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import NavBar from './components/NavBar';
import PromotoresTable from './components/PromotoresTable';
import CrearVale from './components/CrearVale';
import DashboardCajero from './components/DashboardCajero';
import DashboardSupervisor from './components/DashboardSupervisor';
import DashboardDirector from './components/DashboardDirector';
import CajerosTable from './components/CajerosTable';
import ClientesTable from './components/ClientesTable';

const App = () => {
  const [token, setToken] = useState('');
  const [rol, setRol] = useState('');

  const renderDashboard = () => {
    if (!token) return <Navigate to="/login" />;
    switch (rol) {
      case 'cajero':
        return <DashboardCajero token={token} rol={rol} />;
      case 'supervisor':
        return <DashboardSupervisor token={token} rol={rol} />;
      case 'director':
        return <DashboardDirector token={token} rol={rol} />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Router>
      <div>
        {token && <NavBar rol={rol} setToken={setToken} setRol={setRol} />}
        <Routes>
          <Route path="/login" element={!token ? <Login setToken={setToken} setRol={setRol} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={renderDashboard()} />
          <Route path="/crear-vale" element={token && rol === 'cajero' ? <CrearVale token={token} rol={rol} /> : <Navigate to="/login" />} />
          <Route path="/promotores" element={token ? <PromotoresTable token={token} rol={rol} /> : <Navigate to="/login" />} />
          <Route path="/cajeros" element={token && (rol === 'supervisor' || rol === 'director') ? <CajerosTable token={token} rol={rol} /> : <Navigate to="/login" />} />
          <Route path="/clientes" element={token ? <ClientesTable token={token} rol={rol} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;