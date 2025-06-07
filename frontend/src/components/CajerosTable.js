import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CajerosTable = ({ token, rol }) => {
  const [cajeros, setCajeros] = useState([]);
  const [search, setSearch] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCajeros();
  }, [search]);

  const fetchCajeros = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/cajeros?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCajeros(res.data);
    } catch (error) {
      console.error('Error al cargar cajeros');
    }
  };

  const handleCreateCajero = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/cajeros`, { username, password, rol: 'cajero' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage(res.data.message || 'Cajero creado exitosamente');
      setUsername('');
      setPassword('');
      fetchCajeros();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al crear cajero');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteCajero = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/cajeros/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCajeros();
    } catch (error) {
      setError('Error al eliminar cajero');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="ml-64 p-6">
      <div className="container">
        <h1 className="text-2xl font-semibold mb-6">Cajeros</h1>
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {(rol === 'supervisor' || rol === 'director') && (
          <form onSubmit={handleCreateCajero} className="mb-6 flex gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="border p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="border p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Crear Cajero</button>
          </form>
        )}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cajero..."
          className="border p-2 mb-4 w-full max-w-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4">ID</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {cajeros.map(cajero => (
                  <tr key={cajero.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{cajero.id}</td>
                    <td className="p-4">{cajero.nombre}</td>
                    <td className="p-4">
                      {(rol === 'supervisor' || rol === 'director') && (
                        <button
                          onClick={() => handleDeleteCajero(cajero.id)}
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
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

export default CajerosTable;