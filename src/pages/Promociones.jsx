// pages/Promociones.jsx - COMPLETO Y FUNCIONAL ✅
import React, { useState, useEffect, useCallback } from 'react';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Promociones = () => {
    const [promociones, setPromociones] = useState([]);
    const [productos, setProductos] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPromocion, setSelectedPromocion] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        nombre_promocion: '',
        producto_id: '',
        nuevo_precio_venta: '',
        fecha_inicio: '',
        fecha_fin: '',
    });
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);

    //buscador promociones
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    const fetchPromociones = async (currentPage = 1, searchTerm = '') => {
        try {

            setLoading(true);

            const params = new URLSearchParams({
                page: currentPage,
                limit: 10
            });

            if (searchTerm && searchTerm.trim() !== '') {
                params.append('search', searchTerm);
            }

            const response = await fetch(`${apiURL}/promociones/pag?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Error en servidor');
            }

            const data = await response.json();

            if (data.success) {

                setPromociones(data.data);

                setTotalPages(data.pagination.totalPages);

            }

        } catch (error) {

            console.error('Error fetchPromociones:', error);

        } finally {

            setLoading(false);

        }
    };
    // ✅ FIXED: Usa endpoint correcto de productos
    const fetchProductos = useCallback(async () => {
        try {
            // ✅ ENDPOINT CORRECTO: /api/productos
            const response = await fetch(`${apiURL}/productos/all`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                setProductos(data.data);
            }
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchProductos();
        //fetchPromociones(page, search);
    }, []);

    // Search + pagination
    useEffect(() => {
        fetchPromociones(page, search);
        setPage(page);
    }, [page,search]);

    useEffect(() => {
        const delay = setTimeout(() => {
            setSearch(searchInput);
        }, 400);

        return () => clearTimeout(delay);

    }, [searchInput]);

    // CRUD Handlers
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const response = await fetch(`${apiURL}/promociones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setShowCreateModal(false);
                setFormData({ 
                    nombre_promocion: '', 
                    producto_id: '', 
                    nuevo_precio_venta: '', 
                    fecha_inicio: '', 
                    fecha_fin: '' 
                });
                fetchPromociones(search);
            } else {
                console.error('Error en creación:', response.status);
            }
        } catch (error) {
            console.error('Error creando:', error);
        } finally {
            setCreating(false);
        }
    };

    //Enviar datos para actualizar modal
    const handleEdit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const response = await fetch(`${apiURL}/promociones/${selectedPromocion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setShowEditModal(false);
                setSelectedPromocion(null);
                fetchPromociones(search);
                setFormData({ 
                    nombre_promocion: '', 
                    producto_id: '', 
                    nuevo_precio_venta: '', 
                    fecha_inicio: '', 
                    fecha_fin: '' 
                });
            }
        } catch (error) {
            console.error('Error editando:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`${apiURL}/promociones/${selectedPromocion.id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setShowDeleteModal(false);
                setSelectedPromocion(null);
                fetchPromociones(search);
                setFormData({ 
                    nombre_promocion: '', 
                    producto_id: '', 
                    nuevo_precio_venta: '', 
                    fecha_inicio: '', 
                    fecha_fin: '' 
                });
            }
        } catch (error) {
            console.error('Error desactivando:', error);
        }
    };

    const handleCloseModal = async () => {
        setFormData({
            nombre_promocion: '',
            producto_id: '',
            nuevo_precio_venta: '',
            fecha_inicio: '',
            fecha_fin: ''
        })
        if(showCreateModal) setShowCreateModal(false)

        if(showEditModal) setShowEditModal(false)
    }

    const openEditModal = (promocion) => {
        setSelectedPromocion(promocion);
        setFormData({
            nombre_promocion: promocion.nombre_promocion || '',
            producto_id: promocion.producto_id || '',
            nuevo_precio_venta: promocion.nuevo_precio_venta || '',
            fecha_inicio: promocion.fecha_inicio?.split('T')[0] || '',
            fecha_fin: promocion.fecha_fin?.split('T')[0] || ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (promocion) => {
        setSelectedPromocion(promocion);
        setShowDeleteModal(true);
    };

    const formatDinero = (numero) => {
        return Number(numero ?? 0).toLocaleString('es-SV', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const formatFechaUTC = (fechaUTC) => {
        const date = new Date(fechaUTC);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        
        return `${day}/${month}/${year}`;
    };

    const getProductoNombre = (productoId) => {
        const producto = productos.find(p => p.id == productoId);
        return producto ? producto.descripcion : `#${productoId}`;
    };

    const getProductoPresentacion = (productoId) => {
        const producto = productos.find(p => p.id == productoId);
        return producto ? producto.presentacion : `#${productoId}`;
    };

    // Promociones.jsx — fragmento return (reemplaza el return completo)
// El resto del componente (estados, handlers, fetches) permanece igual.

    return (
        <div className="min-h-screen py-8 px-4 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>

            {/* Círculos decorativos */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.12)' }} />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.08)' }} />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Promociones</h1>
                        <p className="text-sm" style={{ color: '#888' }}>Gestión de precios especiales</p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} disabled={loading}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40"
                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                        + Nueva Promoción
                    </button>
                </div>

                {/* BUSCADOR */}
                <div className="mb-6 max-w-md">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="search" placeholder="Buscar promociones..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); e.target.blur(); } if (e.key === 'Escape') { setSearchInput(''); setSearch(''); } }}
                            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg outline-none transition-all"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#222' }} />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#bbb' }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* PAGINACIÓN SUPERIOR */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                        {(() => {
                            const startPage = Math.max(1, page - 2);
                            const endPage = Math.min(totalPages, page + 2);
                            return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                                const pageNum = startPage + i;
                                return (
                                    <button key={pageNum} onClick={() => setPage(pageNum)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                                        style={pageNum === page ? { background: '#222', color: '#fff' } : { background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>
                                        {pageNum}
                                    </button>
                                );
                            });
                        })()}
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || loading}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                        <span className="text-xs ml-1" style={{ color: '#aaa' }}>Pág. {page} de {totalPages}</span>
                    </div>
                )}

                {/* GRID PROMOCIONES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 min-h-[200px]">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                        </div>
                    ) : promociones.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-sm mb-4" style={{ color: '#aaa' }}>No hay promociones registradas</p>
                            <button onClick={() => setShowCreateModal(true)} disabled={loading}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium"
                                style={{ background: '#222', color: '#fff' }}>
                                + Crear Promoción
                            </button>
                        </div>
                    ) : (
                        promociones.map((promocion) => (
                            <div key={promocion.id} className="rounded-2xl p-5 flex flex-col transition-all duration-200"
                                style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

                                {/* Cabecera */}
                                <div className="flex items-start justify-between mb-3 gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium leading-tight line-clamp-1 mb-1" style={{ color: '#111' }}>{promocion.nombre_promocion}</h3>
                                        <p className="text-xs truncate" style={{ color: '#aaa' }}>
                                            {getProductoNombre(promocion.producto_id)} {getProductoPresentacion(promocion.producto_id)}
                                        </p>
                                    </div>
                                    <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-md"
                                        style={promocion.activo
                                            ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                            : { background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>
                                        {promocion.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>

                                {/* Precio */}
                                <div className="flex-1 flex flex-col justify-center mb-4">
                                    <div className="p-3 rounded-xl text-center" style={{ background: '#f5f5f0', border: '0.5px solid #e8e8e2' }}>
                                        <p className="text-xs mb-1" style={{ color: '#aaa' }}>Precio promoción</p>
                                        <p className="text-2xl font-medium" style={{ color: '#111' }}>${formatDinero(promocion.nuevo_precio_venta)}</p>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="space-y-1.5 mb-4">
                                    <div className="flex justify-between text-xs">
                                        <span style={{ color: '#aaa' }}>Inicio</span>
                                        <span style={{ color: '#555' }}>{promocion.fecha_inicio ? formatFechaUTC(promocion.fecha_inicio) : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span style={{ color: '#aaa' }}>Fin</span>
                                        <span style={{ color: new Date(promocion.fecha_fin) < new Date() ? '#a03030' : '#555' }}>
                                            {promocion.fecha_fin ? formatFechaUTC(promocion.fecha_fin) : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-2 pt-3" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                                    <button onClick={() => openEditModal(promocion)}
                                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                                        style={{ background: '#f0f4ff', color: '#3060a0', border: '0.5px solid #c8d8f0' }}>
                                        Editar
                                    </button>
                                    <button onClick={() => openDeleteModal(promocion)}
                                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                                        style={promocion.activo
                                            ? { background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }
                                            : { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }}>
                                        {promocion.activo ? 'Desactivar' : 'Activar'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* PAGINACIÓN INFERIOR */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                        {(() => {
                            const startPage = Math.max(1, page - 2);
                            const endPage = Math.min(totalPages, page + 2);
                            return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                                const pageNum = startPage + i;
                                return (
                                    <button key={pageNum} onClick={() => setPage(pageNum)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                                        style={pageNum === page ? { background: '#222', color: '#fff' } : { background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>
                                        {pageNum}
                                    </button>
                                );
                            });
                        })()}
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || loading}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                    </div>
                )}
            </div>

            {/* ── MODAL CREAR ──────────────────────────────────────── */}
            {showCreateModal && (
                <>
                <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCloseModal} />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
                        style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                            <div>
                                <h2 className="text-base font-medium" style={{ color: '#111' }}>Nueva Promoción</h2>
                                <p className="text-xs" style={{ color: '#aaa' }}>Completa los campos requeridos</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form onSubmit={handleCreate} className="space-y-4">

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NOMBRE *</label>
                                    <input type="text" value={formData.nombre_promocion} required placeholder="Ej: 2x1 Cerveza Lager"
                                        onChange={(e) => setFormData({ ...formData, nombre_promocion: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                        style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                </div>

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>PRODUCTO *</label>
                                    <div className="relative">
                                        <select value={formData.producto_id} required
                                            onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none appearance-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}>
                                            <option value="">Seleccionar producto</option>
                                            {productos.map(producto => (
                                                <option key={producto.id} value={producto.id}>
                                                    {producto.id} - {producto.descripcion} {producto.presentacion}
                                                </option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#aaa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NUEVO PRECIO * ($)</label>
                                    <input type="number" step="0.01" value={formData.nuevo_precio_venta} required placeholder="1.50"
                                        onChange={(e) => setFormData({ ...formData, nuevo_precio_venta: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                        style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>FECHA INICIO</label>
                                        <input type="date" value={formData.fecha_inicio} required
                                            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>FECHA FIN</label>
                                        <input type="date" value={formData.fecha_fin} required
                                            onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={handleCloseModal} disabled={creating}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                        style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={creating}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                                        {creating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando...</> : 'Crear Promoción'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                </>
            )}

            {/* ── MODAL EDITAR ─────────────────────────────────────── */}
            {showEditModal && selectedPromocion && (
                <>
                <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCloseModal} />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
                        style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                            <div>
                                <h2 className="text-base font-medium" style={{ color: '#111' }}>Editar Promoción</h2>
                                <p className="text-xs" style={{ color: '#aaa' }}>Modifica los campos necesarios</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form className="space-y-4">

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NOMBRE *</label>
                                    <input type="text" value={formData.nombre_promocion} required
                                        onChange={(e) => setFormData({ ...formData, nombre_promocion: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                        style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                </div>

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>PRODUCTO *</label>
                                    <div className="relative">
                                        <select value={formData.producto_id} required
                                            onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none appearance-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}>
                                            <option value="">Seleccionar producto</option>
                                            {productos.map(producto => (
                                                <option key={producto.id} value={producto.id}>
                                                    {producto.id} - {producto.descripcion} {producto.presentacion}
                                                </option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#aaa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NUEVO PRECIO * ($)</label>
                                    <input type="number" step="0.01" value={formData.nuevo_precio_venta} required placeholder="1.50"
                                        onChange={(e) => setFormData({ ...formData, nuevo_precio_venta: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                        style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>FECHA INICIO</label>
                                        <input type="date" value={formData.fecha_inicio} required
                                            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>FECHA FIN</label>
                                        <input type="date" value={formData.fecha_fin} required
                                            onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={handleCloseModal} disabled={updating}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                        style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                        Cancelar
                                    </button>
                                    <button type="button" onClick={handleEdit} disabled={updating}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                                        {updating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : 'Actualizar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                </>
            )}

            {/* ── MODAL CONFIRMAR TOGGLE ───────────────────────────── */}
            {showDeleteModal && selectedPromocion && (
                <>
                <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowDeleteModal(false)} />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-2xl p-6 text-center"
                        style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                            style={{ background: '#fdf4f4', border: '0.5px solid #f0d0d0' }}>
                            <svg className="w-5 h-5" style={{ color: '#a03030' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        <h3 className="text-base font-medium mb-2" style={{ color: '#111' }}>¿Desactivar promoción?</h3>
                        <p className="text-xs mb-1" style={{ color: '#888' }}>"{selectedPromocion.nombre_promocion}"</p>
                        <p className="text-xs mb-6" style={{ color: '#bbb' }}>Esta promoción se ocultará de la lista.</p>

                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                Cancelar
                            </button>
                            <button onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                style={{ background: '#a03030', color: '#fff', border: 'none' }}>
                                Desactivar
                            </button>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default Promociones;