// pages/Usuarios.jsx - DISEÑO PREMIUM 🍻
import React, { useState, useEffect } from 'react';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [pagination, setPagination] = useState({ totalPages: 0, page: 1 });
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'cajero' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [updating, setUpdating] = useState(null);

    const fetchUsuarios = async (pageNum = 1, searchTerm = '') => {
        setLoading(true);
        try {
        const params = new URLSearchParams({ page: pageNum, search: searchTerm });
            const res = await fetch(`${apiURL}/usuarios?${params}`);
            const data = await res.json();
            setUsuarios(data.data || []);
            setPagination(data.pagination || { totalPages: 1, page: 1 });
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios(page, search);
    }, [page, search]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
        await fetch(`${apiURL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
            setShowCreateModal(false);
            setForm({ nombre: '', email: '', password: '', rol: 'cajero' });
            fetchUsuarios(page, search);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
        await fetch(`${apiURL}/usuarios/${editingUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, password: form.password || undefined }),
        });
            setShowEditModal(false);
            setEditingUser(null);
            setForm({ nombre: editingUser.nombre, email: editingUser.email, rol: editingUser.rol, password: '' });
            fetchUsuarios(page, search);
            closeModal();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingUserId) return;
        
        setUpdating(deletingUserId);
        try {
            await fetch(`${apiURL}/usuarios/${deletingUserId}`, { 
                method: 'DELETE' 
            });
            setShowDeleteModal(false);
            setDeletingUserId(null);
            fetchUsuarios(page, search);
            closeModal();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = (userId) => {
        setDeletingUserId(userId);
        setShowDeleteModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setForm({ nombre: user.nombre, email: user.email, rol: user.rol, password: '' });
        setShowEditModal(true);
    };

    const closeModal = () =>{

        setForm({ nombre: '', email: '', rol: '', password: ''})

        if(showCreateModal) setShowCreateModal(false);
        if(showEditModal) setShowEditModal(false);
    }

    // Usuarios.jsx — fragmento return (reemplaza el return completo)
// El resto del componente (estados, handlers, fetches) permanece igual.

    return (
        <>
        <div className="min-h-screen py-8 px-4 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>

            {/* Círculos decorativos */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.12)' }} />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.08)' }} />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Usuarios</h1>
                        <p className="text-sm" style={{ color: '#888' }}>{usuarios.length} usuarios registrados</p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                        + Nuevo Usuario
                    </button>
                </div>

                {/* BUSCADOR + PAGINACIÓN */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                    <div className="relative w-full max-w-md">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Buscar por nombre o email..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#222' }} />
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                            <span className="text-xs whitespace-nowrap" style={{ color: '#888' }}>Pág. {page} de {pagination.totalPages}</span>
                            <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                        </div>
                    )}
                </div>

                {/* GRID USUARIOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {usuarios.map((usuario) => (
                        <div key={usuario.id} className="rounded-2xl p-5 transition-all duration-200"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

                            {/* Cabecera */}
                            <div className="flex items-start justify-between mb-3 gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0"
                                        style={{ background: '#222', color: '#fff' }}>
                                        {usuario.nombre?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: '#111' }}>{usuario.nombre}</p>
                                        <p className="text-xs truncate" style={{ color: '#aaa' }}>{usuario.email}</p>
                                    </div>
                                </div>
                                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-md"
                                    style={usuario.activo
                                        ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                        : { background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>
                                    {usuario.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 mb-4">
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Rol</span>
                                    <span className="font-medium" style={{
                                        color: usuario.rol === 'admin' ? '#a03030' : usuario.rol === 'cajero' ? '#2a7a2a' : '#555'
                                    }}>
                                        {usuario.rol === 'admin' ? 'Administrador' : usuario.rol === 'cajero' ? 'Cajero' : 'Personal'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Creado</span>
                                    <span style={{ color: '#555' }}>{new Date(usuario.fecha_creado).toLocaleDateString('es-SV')}</span>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-2 pt-3" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                                <button onClick={() => openEditModal(usuario)}
                                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                                    style={{ background: '#f0f4ff', color: '#3060a0', border: '0.5px solid #c8d8f0' }}>
                                    Editar
                                </button>
                                <button onClick={() => handleDelete(usuario.id)}
                                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                                    style={usuario.activo
                                        ? { background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }
                                        : { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }}>
                                    {usuario.activo ? 'Desactivar' : 'Activar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PAGINACIÓN INFERIOR */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNum = Math.min(Math.max(1, page - 2) + i, pagination.totalPages);
                            return (
                                <button key={pageNum} onClick={() => setPage(pageNum)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                                    style={pageNum === page ? { background: '#222', color: '#fff' } : { background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                    </div>
                )}
            </div>
        </div>

        {/* ── MODAL CREAR USUARIO ──────────────────────────────── */}
        {showCreateModal && (
            <>
            <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowCreateModal(false)} />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
                    style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <div>
                            <h2 className="text-base font-medium" style={{ color: '#111' }}>Nuevo Usuario</h2>
                            <p className="text-xs" style={{ color: '#aaa' }}>Completa los campos requeridos</p>
                        </div>
                        <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                            <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <form onSubmit={handleCreate} className="space-y-4">

                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NOMBRE COMPLETO *</label>
                                <input type="text" value={form.nombre} required placeholder="Juan Pérez"
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                            </div>

                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>EMAIL *</label>
                                <input type="email" value={form.email} required placeholder="juan@gastrobar.com"
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                            </div>

                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>CONTRASEÑA *</label>
                                <input type="password" value={form.password} required placeholder="Mínimo 6 caracteres"
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                            </div>

                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>ROL *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'admin',    label: 'Admin' },
                                        { value: 'cajero',   label: 'Cajero' },
                                        { value: 'personal', label: 'Personal' },
                                    ].map((rol) => (
                                        <button key={rol.value} type="button" onClick={() => setForm({ ...form, rol: rol.value })}
                                            className="py-2.5 rounded-lg text-xs font-medium transition-all"
                                            style={form.rol === rol.value
                                                ? { background: '#222', color: '#fff', border: '0.5px solid #222' }
                                                : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                            {rol.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                    style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                    style={{ background: '#222', color: '#fff', border: 'none' }}>
                                    Crear Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            </>
        )}

        {/* ── MODAL EDITAR USUARIO ─────────────────────────────── */}
        {showEditModal && editingUser && (
            <>
            <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowEditModal(false)} />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
                    style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <div>
                            <h2 className="text-base font-medium" style={{ color: '#111' }}>Editar Usuario</h2>
                            <p className="text-xs" style={{ color: '#aaa' }}>Modifica los campos necesarios</p>
                        </div>
                        <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                            <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <form onSubmit={handleEdit} className="space-y-4">

                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NOMBRE COMPLETO *</label>
                                <input type="text" value={form.nombre} required
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                            </div>

                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>EMAIL *</label>
                                <input type="email" value={form.email} required
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                            </div>

                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NUEVA CONTRASEÑA (OPCIONAL)</label>
                                <input type="password" value={form.password} placeholder="Dejar vacío para mantener actual"
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                            </div>

                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>ROL *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'admin',    label: 'Admin' },
                                        { value: 'cajero',   label: 'Cajero' },
                                        { value: 'personal', label: 'Personal' },
                                    ].map((rol) => (
                                        <button key={rol.value} type="button" onClick={() => setForm({ ...form, rol: rol.value })}
                                            className="py-2.5 rounded-lg text-xs font-medium transition-all"
                                            style={form.rol === rol.value
                                                ? { background: '#222', color: '#fff', border: '0.5px solid #222' }
                                                : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                            {rol.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                    style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                    style={{ background: '#222', color: '#fff', border: 'none' }}>
                                    Actualizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            </>
        )}

        {/* ── MODAL CONFIRMAR TOGGLE ───────────────────────────── */}
        {showDeleteModal && deletingUserId && usuarios.find(u => u.id === deletingUserId) && (
            <>
            <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowDeleteModal(false)} />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-2xl p-6 text-center"
                    style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                        style={{ background: '#fdf4f4', border: '0.5px solid #f0d0d0' }}>
                        <svg className="w-5 h-5" style={{ color: '#a03030' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>

                    <h3 className="text-base font-medium mb-2" style={{ color: '#111' }}>¿Eliminar usuario?</h3>
                    <p className="text-xs mb-1" style={{ color: '#888' }}>"{usuarios.find(u => u.id === deletingUserId)?.nombre}"</p>
                    <p className="text-xs mb-6" style={{ color: '#bbb' }}>Esta acción no podrá deshacerse.</p>

                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModal(false)} disabled={updating === deletingUserId}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40"
                            style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                            Cancelar
                        </button>
                        <button onClick={handleConfirmDelete} disabled={updating === deletingUserId}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                            style={{ background: '#a03030', color: '#fff', border: 'none' }}>
                            {updating === deletingUserId
                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Eliminando...</>
                                : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </div>
            </>
        )}
        </>
    );
};

export default Usuarios;