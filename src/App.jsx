// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
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
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
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

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-dropdown]')) {
        setShowInventoryDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/dashboard',        label: 'Dashboard',         icon: '📊' },
    { to: '/inventario',       label: 'Inventario',        icon: '📦', type: 'dropdown', children: [
      { to: '/categorias', label: 'Categorías' },
      { to: '/productos',  label: 'Productos' },
    ]},
    // { to: '/mesas',         label: 'Mesas',             icon: '🪑' },
    { to: '/compras',          label: 'Compras',           icon: '🛒' },
    { to: '/promociones',      label: 'Promociones',       icon: '🎉' },
    { to: '/historial',        label: 'Historial',         icon: '📋' },
    { to: '/cuentas',          label: 'Ventas',            icon: '💰' },
    { to: '/gastos-operativos',label: 'Gastos Operativos', icon: '💸' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
        <p className="text-sm font-medium" style={{ color: '#888' }}>Cargando sistema...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>

        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 relative" style={{ background: '#fff', borderBottom: '0.5px solid #e0e0da', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">

              {/* LOGO */}
              <NavLink
                to="/"
                className="flex items-center gap-2 text-base font-medium"
                style={{ color: '#111', textDecoration: 'none' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium" style={{ background: '#f0f0ea', border: '0.5px solid #ddd', color: '#333' }}>E</div>
                <span className="hidden md:inline" style={{ color: '#111' }}>ERP SV</span>
              </NavLink>

              {/* LINKS DESKTOP */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label, icon, type, children }) => {
                  if (type === 'dropdown') {
                    return (
                      <div key={to} className="relative" data-dropdown>
                        <button
                          onClick={() => setShowInventoryDropdown(!showInventoryDropdown)}
                          className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                          style={{ color: '#666', background: 'transparent' }}
                        >
                          {icon}
                          <svg className="w-2.5 h-2.5 transition-transform" style={{ transform: showInventoryDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showInventoryDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-40 rounded-xl py-2 z-50" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} data-dropdown>
                            {children.map((child) => (
                              <NavLink
                                key={child.to}
                                to={child.to}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm transition-all duration-200"
                                style={({ isActive }) => isActive
                                  ? { background: '#222', color: '#fff' }
                                  : { color: '#444', background: 'transparent' }
                                }
                                onClick={() => setShowInventoryDropdown(false)}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor', opacity: 0.4 }}></span>
                                {child.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      title={label}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={({ isActive }) => isActive
                        ? { background: '#222', color: '#fff' }
                        : { color: '#666', background: 'transparent' }
                      }
                    >
                      {icon}
                    </NavLink>
                  );
                })}
              </div>

              {/* USUARIO + HAMBURGUESA */}
              <div className="flex items-center gap-2">

                {/* DROPDOWN USUARIO */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200"
                    style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da' }}
                  >
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium" style={{ background: '#222', color: '#fff' }}>
                      {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium" style={{ color: '#333' }}>{user?.nombre}</span>
                    <svg
                      className="w-3 h-3 transition-transform duration-200"
                      style={{ color: '#aaa', transform: showUserDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* DROPDOWN MENU */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl py-2 z-50" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

                      {/* Perfil */}
                      <div className="px-4 py-3" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium" style={{ background: '#222', color: '#fff' }}>
                            {user?.nombre?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#111' }}>{user?.nombre}</p>
                            <p className="text-xs" style={{ color: '#aaa' }}>
                              {user?.rol === 'admin' ? 'Administrador' : user?.rol === 'cajero' ? 'Cajero' : 'Personal'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Gestión usuarios */}
                      <NavLink
                        to="/usuarios"
                        className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200"
                        style={{ color: '#444', textDecoration: 'none' }}
                        onClick={() => setShowUserDropdown(false)}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f0'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span>👥</span> Gestión de Usuarios
                      </NavLink>

                      <div style={{ borderTop: '0.5px solid #f0f0ea', margin: '4px 0' }} />

                      {/* Logout */}
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all duration-200"
                        style={{ color: '#a03030', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fdf4f4'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span>🚪</span> Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>

                {/* HAMBURGUESA */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg transition-all duration-200"
                  style={{ background: isMobileMenuOpen ? '#f0f0ea' : 'transparent', border: '0.5px solid #e0e0da' }}
                  aria-label="Abrir menú"
                >
                  <svg className="w-4 h-4" style={{ color: '#555' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* MENÚ MÓVIL */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 z-40" style={{ background: '#fff', borderTop: '0.5px solid #e0e0da', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <div className="px-4 py-3 space-y-1">
                  {navLinks.map(({ to, label, icon, type, children }) => {
                    if (type === 'dropdown') {
                      return (
                        <div key={to} className="space-y-1">
                          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium" style={{ color: '#555', background: 'transparent' }}>
                            <span>{icon}</span> {label}
                          </div>
                          <div className="pl-4 space-y-1">
                            {children.map((child) => (
                              <NavLink
                                key={child.to}
                                to={child.to}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-200"
                                style={({ isActive }) => isActive
                                  ? { background: '#222', color: '#fff' }
                                  : { color: '#555', background: 'transparent' }
                                }
                                onClick={handleMobileMenuClick}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor', opacity: 0.4 }}></span>
                                {child.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <NavLink
                        key={to}
                        to={to}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                        style={({ isActive }) => isActive
                          ? { background: '#222', color: '#fff' }
                          : { color: '#555', background: 'transparent' }
                        }
                        onClick={handleMobileMenuClick}
                      >
                        <span>{icon}</span> {label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* CONTENIDO */}
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/cuentas" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventario" element={<Navigate to="/categorias" />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/productos" element={<Productos />} />
            {/* <Route path="/mesas" element={<Mesas />} /> */}
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