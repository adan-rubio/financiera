import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken, setRol }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/token`, {
        username,
        password
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setToken(res.data.access_token);
      const userRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
      setRol(userRes.data.rol);
      setError('');
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Iniciar Sesión</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </div>
          <button type="submit" className="button">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
};

export default Login;