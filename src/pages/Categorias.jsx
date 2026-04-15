import React, { useState, useEffect } from 'react';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);

    // Modal de Crear Categoría
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        nombre: '',
        codigo: '',
        descripcion: ''
    });

    // Modal de Editar Categoría
    const [showEditModal, setShowEditModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Modal de confirmación toggle
    const [showModal, setShowModal] = useState(false);
    const [modalCategory, setModalCategory] = useState(null);

    // FETCH PRINCIPAL
    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiURL}/categorias`);
            const data = await response.json();

            if (data.success) {
                setCategorias(data.data || []);
                setError(null);
            } else {
                throw new Error(data.message || 'Error al obtener categorías');
            }
        } catch (err) {
            console.error('Error fetchCategorias:', err);
            setError('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    // HANDLERS PRINCIPALES
    const handleAbrirCrear = () => {
        setCreateForm({
            nombre: '',
            codigo: '',
            descripcion: ''
        });
        setShowCreateModal(true);
    };

    const handleCerrarCrear = () => {
        setShowCreateModal(false);
        setCreateForm({});
    };

    const handleCrearCategoria = async (e) => {
        e.preventDefault();
        try {
            setUpdating('new');
            const response = await fetch(`${apiURL}/categorias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setCategorias([...categorias, data.data]);
                setShowCreateModal(false);
                setCreateForm({});
            } else {
                alert(data.message || 'Error al crear categoría');
            }
        } catch (error) {
            console.error(error);
            alert('Error al crear categoría');
        } finally {
            setUpdating(null);
        }
    };

    const handleEditar = (categoria) => {
        setEditForm({
            nombre: categoria.nombre || '',
            codigo: categoria.codigo || '',
            descripcion: categoria.descripcion || '',
            activo: categoria.activo
        });
        setEditCategory(categoria);
        setShowEditModal(true);
    };

    const handleCerrarEditar = () => {
        setShowEditModal(false);
        setEditForm({});
        setEditCategory(null);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!editCategory) return;

        try {
            setUpdating(editCategory.id);
            const response = await fetch(`${apiURL}/categorias/${editCategory.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setCategorias(categorias.map(c => c.id === editCategory.id ? data.data : c));
                setShowEditModal(false);
                setEditForm({});
                setEditCategory(null);
            } else {
                alert(data.message || 'Error al actualizar categoría');
            }
        } catch (error) {
            console.error(error);
            alert('Error al actualizar categoría');
        } finally {
            setUpdating(null);
        }
    };

    const handleEliminar = (categoria) => {
        setModalCategory(categoria);
        setShowModal(true);
    };

    const handleConfirmarToggle = async () => {
        if (!modalCategory) return;

        try {
            setUpdating(modalCategory.id);
            const nuevoEstado = !modalCategory.activo;

            const response = await fetch(`${apiURL}/categorias/${modalCategory.id}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: nuevoEstado })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setCategorias(categorias.map(c => c.id === modalCategory.id ? data.data : c));
            } else {
                alert(data.message || 'Error al actualizar');
            }
        } catch (error) {
            console.error(error);
            alert('Error al actualizar categoría');
        } finally {
            setUpdating(null);
            setShowModal(false);
            setModalCategory(null);
        }
    };

    const handleCerrarModal = () => {
        setShowModal(false);
        setModalCategory(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
                <p className="text-sm" style={{ color: '#888' }}>Cargando categorías...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>

            {/* Círculos decorativos */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.12)' }} />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.08)' }} />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Categorías</h1>
                        <p className="text-sm" style={{ color: '#888' }}>Gestión de categorías de productos</p>
                    </div>
                    <button onClick={handleAbrirCrear}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                        + Nueva Categoría
                    </button>
                </div>

                {/* GRID CATEGORÍAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                    {categorias.map((categoria) => (
                        <div key={categoria.id} className="rounded-2xl p-5 transition-all duration-200"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

                            {/* Cabecera */}
                            <div className="flex items-start justify-between mb-3 gap-2">
                                <h3 className="text-sm font-medium leading-tight line-clamp-2 flex-1" style={{ color: '#111' }}>
                                    {categoria.nombre || 'Sin nombre'}
                                </h3>
                                <span className="text-xs px-2 py-0.5 rounded-md flex-shrink-0"
                                    style={categoria.activo
                                        ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                        : { background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>
                                    {categoria.activo ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 mb-4">
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Código</span>
                                    <span className="font-medium ml-2 text-right" style={{ color: '#555' }}>{categoria.codigo || 'N/A'}</span>
                                </div>
                                {categoria.descripcion && (
                                    <div className="text-xs" style={{ color: '#888' }}>
                                        <span style={{ color: '#aaa' }}>Descripción: </span>
                                        {categoria.descripcion}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                                <span className="text-xs" style={{ color: '#ccc' }}>
                                    {new Date(categoria.fecha_creado).toLocaleDateString('es-SV')}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditar(categoria)} disabled={updating === categoria.id}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                                        style={{ background: '#f0f4ff', border: '0.5px solid #c8d8f0', color: '#3060a0' }}
                                        title="Editar">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => handleEliminar(categoria)} disabled={updating === categoria.id}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                                        style={categoria.activo
                                            ? { background: '#fdf4f4', border: '0.5px solid #f0d0d0', color: '#a03030' }
                                            : { background: '#f4faf4', border: '0.5px solid #c8e6c8', color: '#2a7a2a' }}
                                        title={categoria.activo ? 'Desactivar' : 'Activar'}>
                                        {categoria.activo ? (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ERROR */}
                {error && (
                    <div className="px-4 py-3 rounded-xl text-sm mb-6" style={{ background: '#fdf4f4', border: '0.5px solid #f0d0d0', color: '#a03030' }}>
                        {error}
                    </div>
                )}

                {/* VACÍO */}
                {categorias.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm mb-4" style={{ color: '#aaa' }}>No hay categorías registradas</p>
                        <button onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium"
                            style={{ background: '#222', color: '#fff' }}>
                            + Crear Primera Categoría
                        </button>
                    </div>
                )}
            </div>

            {/* ── MODAL CONFIRMACIÓN TOGGLE ───────────────────────── */}
            {showModal && (
                <>
                    <div className="fixed inset-0 z-[50]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarModal} />
                    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                            {/* Ícono */}
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                                style={modalCategory?.activo
                                    ? { background: '#fdf4f4', border: '0.5px solid #f0d0d0' }
                                    : { background: '#f4faf4', border: '0.5px solid #c8e6c8' }}>
                                {modalCategory?.activo ? (
                                    <svg className="w-5 h-5" style={{ color: '#a03030' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" style={{ color: '#2a7a2a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </div>

                            <h3 className="text-base font-medium text-center mb-2" style={{ color: '#111' }}>
                                {modalCategory?.activo ? '¿Desactivar categoría?' : '¿Activar categoría?'}
                            </h3>
                            <p className="text-xs text-center mb-1" style={{ color: '#888' }}>"{modalCategory?.nombre}"</p>
                            <p className="text-xs text-center mb-6" style={{ color: '#bbb' }}>
                                {modalCategory?.activo
                                    ? 'Se ocultará de las listas pero podrás reactivarla.'
                                    : 'Volverá a aparecer en todas las listas.'}
                            </p>

                            <div className="flex gap-3">
                                <button onClick={handleCerrarModal} disabled={updating === modalCategory?.id}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                                    style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                    Cancelar
                                </button>
                                <button onClick={handleConfirmarToggle} disabled={updating === modalCategory?.id}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                    style={modalCategory?.activo
                                        ? { background: '#a03030', color: '#fff', border: 'none' }
                                        : { background: '#2a7a2a', color: '#fff', border: 'none' }}>
                                    {updating === modalCategory?.id
                                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                                        : modalCategory?.activo ? 'Desactivar' : 'Activar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── MODAL CREAR CATEGORÍA ─────────────────────────────── */}
            {showCreateModal && (
                <>
                    <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarCrear} />
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                                <div>
                                    <h3 className="text-base font-medium" style={{ color: '#111' }}>Nueva Categoría</h3>
                                    <p className="text-xs" style={{ color: '#aaa' }}>Completa los campos requeridos</p>
                                </div>
                                <button onClick={handleCerrarCrear} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                    <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Form */}
                            <div className="px-6 py-5">
                                <form onSubmit={handleCrearCategoria} className="space-y-4">

                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NOMBRE *</label>
                                        <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={createForm.nombre}
                                            onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                                            placeholder="Bebidas" maxLength={100} required />
                                    </div>

                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>CÓDIGO *</label>
                                        <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={createForm.codigo}
                                            onChange={(e) => setCreateForm({ ...createForm, codigo: e.target.value })}
                                            placeholder="BEBIDAS" maxLength={20} required />
                                    </div>

                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>DESCRIPCIÓN</label>
                                        <textarea className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={createForm.descripcion}
                                            onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                                            placeholder="Descripción de la categoría" maxLength={255} rows={3} />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={handleCerrarCrear}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                            style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={updating === 'new'}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                                            style={{ background: '#222', color: '#fff', border: 'none' }}>
                                            {updating === 'new'
                                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando...</>
                                                : 'Crear Categoría'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── MODAL EDITAR CATEGORÍA ────────────────────────────── */}
            {showEditModal && (
                <>
                    <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarEditar} />
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                                <div>
                                    <h3 className="text-base font-medium" style={{ color: '#111' }}>Editar Categoría <span style={{ color: '#aaa' }}>#{editCategory?.id}</span></h3>
                                    <p className="text-xs" style={{ color: '#aaa' }}>Modifica la información de la categoría</p>
                                </div>
                                <button onClick={handleCerrarEditar} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                    <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Form */}
                            <div className="px-6 py-5">
                                <form onSubmit={handleGuardar} className="space-y-4">

                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NOMBRE *</label>
                                        <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={editForm.nombre || ''}
                                            onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                                            placeholder="Bebidas" maxLength={100} required />
                                    </div>

                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>CÓDIGO *</label>
                                        <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={editForm.codigo || ''}
                                            onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
                                            placeholder="BEBIDAS" maxLength={20} required />
                                    </div>

                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>DESCRIPCIÓN</label>
                                        <textarea className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={editForm.descripcion || ''}
                                            onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                                            placeholder="Descripción de la categoría" maxLength={255} rows={3} />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={handleCerrarEditar}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                            style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={updating === editCategory?.id}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                                            style={{ background: '#222', color: '#fff', border: 'none' }}>
                                            {updating === editCategory?.id
                                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                                                : 'Actualizar Categoría'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Categorias;
