import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardCajero = ({ token }) => {
  const [data, setData] = useState({ total_vales: 0, monto_total: 0, pagos_pendientes: 0, vales: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard/cajero`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError('Error al cargar los datos');
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="ml-64 p-6">
      <div className="container">
        <h1 className="text-2xl font-semibold mb-6">Dashboard Cajero</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700">Total Vales</h3>
            <p className="text-3xl font-bold text-blue-600">{data.total_vales}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700">Monto Total</h3>
            <p className="text-3xl font-bold text-blue-600">${data.monto_total?.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700">Pagos Pendientes</h3>
            <p className="text-3xl font-bold text-blue-600">${data.pagos_pendientes?.toLocaleString()}</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Últimos Vales</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4">ID</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Promotor</th>
                  <th className="p-4">Monto</th>
                  <th className="p-4">Interés</th>
                </tr>
              </thead>
              <tbody>
                {data.vales.map(vale => (
                  <tr key={vale.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{vale.id}</td>
                    <td className="p-4">{vale.cliente}</td>
                    <td className="p-4">{vale.promotor}</td>
                    <td className="p-4">${vale.monto.toLocaleString()}</td>
                    <td className="p-4">{vale.interes}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCajero;