import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardSupervisor = ({ token, rol }) => {
  const [data, setData] = useState({ total_empresa: 0, total_vales: 0, promotores: [], cajeros: [], clientes: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    const endpoint = rol === 'director' ? '/dashboard/director' : '/dashboard/supervisor';
    axios.get(`${process.env.REACT_APP_API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setData(res.data))
      .catch(() => setError('Error al cargar los datos'));
  }, [token, rol]);

  return (
    <div className="ml-64 p-6">
      <div className="container">
        <h1 className="text-2xl font-semibold mb-6">{rol === 'director' ? 'Dashboard Director' : 'Dashboard Supervisor'}</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700">Total Empresa</h3>
            <p className="text-3xl font-bold text-blue-600">${data.total_empresa?.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700">Total Vales</h3>
            <p className="text-3xl font-bold text-blue-600">{data.total_vales}</p>
          </div>
          {rol === 'director' && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-700">Pagos Pendientes</h3>
              <p className="text-3xl font-bold text-blue-600">${data.pagos_pendientes?.toLocaleString()}</p>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Promotores</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Total Vales</th>
                  <th className="p-4">Monto Total</th>
                  {rol === 'director' && <th className="p-4">Pagos Pendientes</th>}
                </tr>
              </thead>
              <tbody>
                {data.promotores.map(p => (
                  <tr key={p.nombre} className="border-b hover:bg-gray-50">
                    <td className="p-4">{p.nombre}</td>
                    <td className="p-4">{p.total_vales}</td>
                    <td className="p-4">${p.monto_total?.toLocaleString()}</td>
                    {rol === 'director' && <td className="p-4">${p.pagos_pendientes?.toLocaleString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">Cajeros</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Total Vales</th>
                  <th className="p-4">Monto Total</th>
                  {rol === 'director' && <th className="p-4">Pagos Pendientes</th>}
                </tr>
              </thead>
              <tbody>
                {data.cajeros.map(c => (
                  <tr key={c.nombre} className="border-b hover:bg-gray-50">
                    <td className="p-4">{c.nombre}</td>
                    <td className="p-4">{c.total_vales}</td>
                    <td className="p-4">${c.monto_total?.toLocaleString()}</td>
                    {rol === 'director' && <td className="p-4">${c.pagos_pendientes?.toLocaleString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {rol === 'director' && (
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Clientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Total Vales</th>
                    <th className="p-4">Monto Total</th>
                    <th className="p-4">Pagos Pendientes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clientes.map(c => (
                    <tr key={c.nombre} className="border-b hover:bg-gray-50">
                      <td className="p-4">{c.nombre}</td>
                      <td className="p-4">{c.total_vales}</td>
                      <td className="p-4">${c.monto_total?.toLocaleString()}</td>
                      <td className="p-4">${c.pagos_pendientes?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSupervisor;