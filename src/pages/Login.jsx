// pages/Login.jsx
import React, { useState } from 'react';
 
const Login = ({ onLoginSuccess }) => {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
 
        try {
            const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiURL}/usuarios/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, password }),
            });
 
            const data = await response.json();
 
            if (data.success) {
                console.log('✅ BACKEND RESPONSE:', data);
 
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
                onLoginSuccess(data.data);
                setTimeout(() => {
                    window.location.href = '/cuentas';
                }, 500);
            } else {
                setError(data.error || 'Credenciales inválidas');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
 
            {/* Círculos decorativos */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.12)' }} />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.08)' }} />
 
            <div className="w-full max-w-sm relative z-10">
 
                {/* Header */}
                <div className="text-center mb-8">
                    <div
                        className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl text-lg font-medium"
                        style={{ background: '#fff', border: '0.5px solid #ddd', color: '#222', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                    >
                        E
                    </div>
                    <h1 className="text-xl font-medium mb-1" style={{ color: '#111' }}>ERP SV</h1>
                    <p className="text-sm" style={{ color: '#888' }}>Inicia sesión en tu cuenta</p>
                </div>
 
                {/* Card */}
                <div className="rounded-2xl p-7" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
 
                    {/* Error */}
                    {error && (
                        <div
                            className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                            style={{ background: '#fdf2f2', border: '0.5px solid #f0d0d0', color: '#a05050' }}
                        >
                            {error}
                        </div>
                    )}
 
                    {/* Formulario */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs mb-1.5 tracking-widest" style={{ color: '#999' }}>
                                USUARIO
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
                                style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                placeholder="nombre de usuario"
                                required
                                disabled={loading}
                            />
                        </div>
 
                        <div>
                            <label className="block text-xs mb-1.5 tracking-widest" style={{ color: '#999' }}>
                                CONTRASEÑA
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
                                style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </div>
 
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: '#222', border: 'none', color: '#fff' }}
                        >
                            {loading ? (
                                <>
                                    <div
                                        className="w-4 h-4 rounded-full border-2 animate-spin"
                                        style={{ borderColor: '#555', borderTopColor: '#fff' }}
                                    />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar al sistema'
                            )}
                        </button>
                    </form>
                </div>
 
                <p className="text-center mt-6 text-xs" style={{ color: '#bbb' }}>
                    ERP SV © 2026
                </p>
            </div>
        </div>
    );
};
 
export default Login;