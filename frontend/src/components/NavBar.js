import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = ({ rol, setToken, setRol }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken('');
    setRol('');
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-md">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600">Financiera</h1>
      </div>
      <nav className="mt-4">
        {rol === 'cajero' && (
          <>
            <Link to="/dashboard" className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/crear-vale" className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
              Crear Vale
            </Link>
            <Link to="/promotores" className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
              Promotores
            </Link>
          </>
        )}
        {(rol === 'supervisor' || rol === 'director') && (
          <>
            <Link to="/dashboard" className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/promotores" className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
              Promotores
            </Link>
            <Link to="/cajeros" className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
              Cajeros
            </Link>
            {(rol === 'supervisor' || rol === 'director') && (
              <Link to="/clientes" className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
                Clientes
              </Link>
            )}
          </>
        )}
        <button
          onClick={handleLogout}
          className="block w-full text-left px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
        >
          Cerrar Sesión
        </button>
      </nav>
    </div>
  );
};

export default NavBar;