import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CrearVale = ({ token, rol }) => {
  const [vale, setVale] = useState({
    monto: 1000,
    interes: 5,
    pagos: 12,
    expediente: '',
    condiciones: ''
  });
  const [clienteNombre, setClienteNombre] = useState('');
  const [promotorNombre, setPromotorNombre] = useState('');
  const [promotores, setPromotores] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPromotores = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/promotores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotores(res.data);
    } catch (err) {
      setError('Error al cargar promotores');
    }
  };

  useEffect(() => {
    fetchPromotores();
  }, [token]);

  const handleSubmit = async () => {
    if (!promotorNombre) {
      setError('Seleccione un promotor');
      return;
    }
    if (!clienteNombre.trim()) {
      setError('El nombre del cliente es obligatorio');
      return;
    }
    try {
      const payload = {
        monto: vale.monto,
        interes: vale.interes,
        pagos: vale.pagos,
        expediente: vale.expediente,
        condiciones: vale.condiciones,
        cliente_nombre: clienteNombre,
        promotor_nombre: promotorNombre
      };
      await axios.post(`${process.env.REACT_APP_API_URL}/vales`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Vale creado exitosamente');
      setClienteNombre('');
      setPromotorNombre('');
      setVale({ monto: 1000, interes: 5, pagos: 12, expediente: '', condiciones: '' });
      setError('');
      fetchPromotores();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error al crear vale';
      setError(typeof errorMsg === 'string' ? errorMsg : 'Error desconocido');
    }
  };

  return (
    <div className="ml-64 p-6">
      <div className="container">
        <div className="card">
          <h1 className="text-2xl font-semibold mb-6">Crear Vale</h1>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
              <input
                type="text"
                className="input"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Ingrese el nombre del cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promotor</label>
              <select
                value={promotorNombre}
                onChange={(e) => setPromotorNombre(e.target.value)}
                className="input"
              >
                <option value="">Seleccione un promotor...</option>
                {promotores.map(promotor => (
                  <option key={promotor.id} value={promotor.nombre}>{promotor.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto (1000-10000)</label>
              <input
                type="number"
                className="input"
                value={vale.monto}
                onChange={(e) => setVale({ ...vale, monto: parseFloat(e.target.value) })}
                placeholder="Ingrese el monto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interés (%)</label>
              <input
                type="number"
                className="input"
                value={vale.interes}
                onChange={(e) => setVale({ ...vale, interes: parseFloat(e.target.value) })}
                placeholder="Ingrese el interés"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Pagos</label>
              <input
                type="number"
                className="input"
                value={vale.pagos}
                onChange={(e) => setVale({ ...vale, pagos: parseInt(e.target.value) })}
                placeholder="Ingrese el número de pagos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expediente</label>
              <textarea
                className="input"
                value={vale.expediente}
                onChange={(e) => setVale({ ...vale, expediente: e.target.value })}
                placeholder="Ingrese el expediente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones</label>
              <textarea
                className="input"
                value={vale.condiciones}
                onChange={(e) => setVale({ ...vale, condiciones: e.target.value })}
                placeholder="Ingrese las condiciones"
              />
            </div>
            <button
              className="button"
              onClick={handleSubmit}
            >
              Crear Vale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearVale;