// App.jsx - COMPLETO CON MENÚ MÓVIL FIJO DEBAJO DEL NAVBAR Y SCROLL AL INICIO
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Productos from './pages/Productos';
import Compras from "./pages/Compras";
import Cuentas from "./pages/Cuentas";
import GastosOperativos from "./pages/GastosOperativos";
import Dashboard from "./pages/Dashboard";
import Mesas from "./pages/Mesas";
import Historial from "./pages/Historial";
import Promociones from "./pages/Promociones";
import Usuarios from "./pages/Usuarios"; 
import Login from "./pages/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (userData === 'undefined' || userData === 'null') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
      return;
    }
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser?.nombre) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setShowUserDropdown(false);
    setIsMobileMenuOpen(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // ✅ FUNCIÓN PARA CERRAR MENÚ Y SCROLLEAR AL INICIO
  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">Cargando sistema...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-white">
        {/* NAVBAR PRINCIPAL - CON MENÚ MÓVIL DENTRO */}
        <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 relative overflow-invisible">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* FILA PRINCIPAL */}
            <div className="flex items-center justify-between h-16">
              {/* LOGO */}
              <NavLink 
                to="/" 
                className="flex items-center space-x-2 text-xl sm:text-2xl font-bold hover:scale-105 transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>🍻</span>
                <span className="hidden md:inline bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">Las Toñitas</span>
              </NavLink>

              {/* LINKS DESKTOP HORIZONTAL */}
              <div className="hidden md:flex items-center space-x-1">
                <NavLink to="/dashboard" className={({ isActive }) => 
                  `px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-blue-700 text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}>
                  📊
                </NavLink>

                <NavLink to="/productos" className={({ isActive }) => 
                  `px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}>
                  📦
                </NavLink>

                <NavLink to="/mesas" className={({ isActive }) => 
                  `px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}>
                  🪑
                </NavLink>

                <NavLink to="/compras" className={({ isActive }) => 
                  `px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                  }`}>
                  🛒
                </NavLink>

                <NavLink to="/promociones" className={({ isActive }) => 
                  `px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                  }`}>
                  🎉
                </NavLink>

                <NavLink to="/historial" className={({ isActive }) => 
                  `px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  }`}>
                  📋
                </NavLink>

                <NavLink to="/cuentas" className={({ isActive }) => 
                  `px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}>
                  💰
                </NavLink>

                {/* GASTOS OPERATIVOS - DESKTOP */}
                <NavLink to="/gastos-operativos" className={({ isActive }) => 
                  `px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}>
                  💸
                </NavLink>
              </div>

              {/* USER + HAMBURGUESA - MISMA FILA */}
              <div className="flex items-center space-x-2">
                {/* DROPDOWN USUARIO */}
                <div className="relative inline-block">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-blue-50 px-3 py-2 rounded-xl border border-emerald-200 hover:shadow-md hover:shadow-emerald-500/25 transition-all duration-300 group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                      {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user?.nombre}</p>
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* DROPDOWN MENU USUARIO */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 py-3 z-50 animate-in slide-in-from-top-2 duration-200 origin-top-right">
                      {/* Perfil */}
                      <div className="px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {user?.nombre?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-lg truncate">{user?.nombre}</p>
                            <p className={`text-sm font-semibold ${
                              user?.rol === 'admin' ? 'text-red-600' : 
                              user?.rol === 'cajero' ? 'text-emerald-600' : 'text-indigo-600'
                            }`}>
                              {user?.rol === 'admin' ? '👑 Administrador' : user?.rol === 'cajero' ? '💰 Cajero' : '👤 Personal'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Gestión Usuarios */}
                      <NavLink
                        to="/usuarios"
                        className={({ isActive }) => 
                          `block px-5 py-4 w-full text-left font-semibold transition-all duration-300 hover:bg-indigo-50 border-l-4 border-indigo-500 ${
                            isActive ? 'bg-indigo-100 shadow-inner' : 'hover:shadow-md'
                          }`
                        }
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">👥</span>
                          <span>Gestión de Usuarios</span>
                        </div>
                      </NavLink>

                      {/* Separador */}
                      <div className="px-5 my-1">
                        <div className="w-full h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                      </div>

                      {/* Logout */}
                      <button
                        onClick={logout}
                        className="w-full text-left px-5 py-4 font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 flex items-center space-x-3 group hover:shadow-md"
                      >
                        <span className="text-xl">🚪</span>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* HAMBURGUESA MOBILE */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Abrir menú"
                >
                  <svg className={`w-6 h-6 text-gray-700 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ✅ MENÚ MÓVIL - SIEMPRE DEBAJO DEL NAVBAR */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-40 w-full animate-in slide-in-from-top-2 duration-300">
                <div className="px-4 py-6 space-y-2 max-h-[calc(100vh-6rem)]">
                  {/* Dashboard */}
                  <NavLink to="/dashboard" className={({ isActive }) => 
                    `block w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-300 border-l-4 ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-blue-700 text-white shadow-lg border-emerald-500 scale-105' 
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-300 hover:shadow-md'
                    }`} 
                    onClick={handleMobileMenuClick}>
                    📊 Dashboard
                  </NavLink>

                  {/* Productos */}
                  <NavLink to="/productos" className={({ isActive }) => 
                    `block w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-300 border-l-4 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg border-blue-500 scale-105' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-300 hover:shadow-md'
                    }`} 
                    onClick={handleMobileMenuClick}>
                    📦 Productos
                  </NavLink>

                  {/* Mesas */}
                  <NavLink to="/mesas" className={({ isActive }) => 
                    `block w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-300 border-l-4 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg border-purple-500 scale-105' 
                        : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50 border-transparent hover:border-purple-300 hover:shadow-md'
                    }`} 
                    onClick={handleMobileMenuClick}>
                    🪑 Mesas
                  </NavLink>

                  {/* Compras */}
                  <NavLink to="/compras" className={({ isActive }) => 
                    `block w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-300 border-l-4 ${
                      isActive 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg border-orange-500 scale-105' 
                        : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50 border-transparent hover:border-orange-300 hover:shadow-md'
                    }`} 
                    onClick={handleMobileMenuClick}>
                    🛒 Compras
                  </NavLink>

                  {/* Promociones */}
                  <NavLink to="/promociones" className={({ isActive }) => 
                    `block w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-300 border-l-4 ${
                      isActive 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg border-pink-500 scale-105' 
                        : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50 border-transparent hover:border-pink-300 hover:shadow-md'
                    }`} 
                    onClick={handleMobileMenuClick}>
                    🎉 Promociones
                  </NavLink>

                  {/* Historial */}
                  <NavLink to="/historial" className={({ isActive }) => 
                    `block w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-300 border-l-4 ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg border-amber-500 scale-105' 
                        : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50 border-transparent hover:border-amber-300 hover:shadow-md'
                    }`} 
                    onClick={handleMobileMenuClick}>
                    📋 Historial
                  </NavLink>

                  {/* Cuentas */}
                  <NavLink to="/cuentas" className={({ isActive }) => 
                    `block w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-300 border-l-4 ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg border-emerald-500 scale-105' 
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-300 hover:shadow-md'
                    }`} 
                    onClick={handleMobileMenuClick}>
                    💰 Cuentas
                  </NavLink>

                  {/* Gastos Operativos */}
                  <NavLink to="/gastos-operativos" className={({ isActive }) => 
                    `block w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-300 border-l-4 ${
                      isActive 
                        ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg border-red-500 scale-105' 
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-300 hover:shadow-md'
                    }`} 
                    onClick={handleMobileMenuClick}>
                    💸 Gastos Operativos
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* CONTENIDO PRINCIPAL */}
        <main className="pt-4 pb-12 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/cuentas" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/mesas" element={<Mesas />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/promociones" element={<Promociones />} />
            <Route path="/cuentas" element={<Cuentas />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/gastos-operativos" element={<GastosOperativos />} />
            <Route path="*" element={<Navigate to="/cuentas" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;