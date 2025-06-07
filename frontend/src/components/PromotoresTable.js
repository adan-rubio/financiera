// frontend/src/PromotoresTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PromotoresTable = ({ token, rol }) => {
  const [promotores, setPromotores] = useState([]);
  const [search, setSearch] = useState('');
  const [newPromotor, setNewPromotor] = useState({ nombre: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPromotores = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/promotores?search=${search}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPromotores(res.data);
      } catch (error) {
        setError('Error al cargar los promotores');
      }
    };
    fetchPromotores();
  }, [token, search]);

  const handleAddPromotor = async () => {
    if (!newPromotor.nombre.trim()) {
      setError('El nombre del promotor es obligatorio');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/promotores`, {
        nombre: newPromotor.nombre
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Promotor creado exitosamente');
      setNewPromotor({ nombre: '' });
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/promotores?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotores(res.data);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al crear el promotor');
    }
  };

  const handleDeletePromotor = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/promotores/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Promotor eliminado exitosamente');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/promotores?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotores(res.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al eliminar promotor');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="ml-64 p-6">
      <div className="container">
        <div className="card">
          <h1 className="text-2xl font-semibold mb-6">Promotores</h1>
          <input
            type="text"
            placeholder="Buscar promotor..."
            className="border p-2 mb-4 w-full max-w-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {(rol === 'supervisor' || rol === 'director') && (
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">Agregar Promotor</h2>
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
              {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
              <input
                type="text"
                placeholder="Nombre del Promotor"
                className="border p-2 mb-4 w-full max-w-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPromotor.nombre}
                onChange={(e) => setNewPromotor({ nombre: e.target.value })}
              />
              <button
                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                onClick={handleAddPromotor}
              >
                Agregar Promotor
              </button>
            </div>
          )}
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
                {promotores.map(promotor => (
                  <tr key={promotor.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{promotor.id}</td>
                    <td className="p-4">{promotor.nombre}</td>
                    <td className="p-4">
                      {(rol === 'supervisor' || rol === 'director') && (
                        <button
                          onClick={() => handleDeletePromotor(promotor.id)}
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

export default PromotoresTable;