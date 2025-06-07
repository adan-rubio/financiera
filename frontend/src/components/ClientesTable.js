import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientesTable = ({ token, rol }) => {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/clientes?search=${search}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientes(res.data);
      } catch (error) {
        console.error('Error al cargar clientes');
      }
    };
    fetchClientes();
  }, [search]);

  return (
    <div className="ml-64 p-6">
      <div className="container">
        <h1 className="text-2xl font-semibold mb-6">Clientes</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="border p-2 mb-4 w-full max-w-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4">ID</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Creado Por</th>
                  <th className="p-4">Fecha de Creación</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cliente => (
                  <tr key={cliente.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{cliente.id}</td>
                    <td className="p-4">{cliente.nombre}</td>
                    <td className="p-4">{cliente.creado_por || 'Desconocido'}</td>
                    <td className="p-4">{cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : 'Sin fecha'}</td>
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

export default ClientesTable;