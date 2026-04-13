import React, { useState, useEffect } from 'react';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [modalProduct, setModalProduct] = useState(null);

    //Modal de Crear Producto
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        descripcion: '',
        proveedor: '',
        presentacion: '',
        cantidad_disponible: 0,
        cantidad_minima: 0,
        cantidad_maxima: 0,
        precio_compra: 0,
        precio_venta: 0,
        categoria_id: 1  // ✅ Default categoría General
    });
    const [categorias, setCategorias] = useState([]); // ✅ Estado categorías


    //Editar Producto
    const [showEditModal, setShowEditModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [editForm, setEditForm] = useState({});

    //Modal de eliminar producto
    const [showModal, setShowModal] = useState(false);

    //Busqueda
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    //FETCH PRINCIPALES
        const fetchCategorias = async () => {
            try {
                const response = await fetch(`${apiURL}/categorias`);
                const data = await response.json();
                if (data.success) {
                    setCategorias(data.data);
                }
            } catch (error) {
                console.error('Error cargando categorías:', error);
            }
        };

        const fetchProductos = async (currentPage = 1, searchTerm = '', categoria = 'N/A') => {
            try {

                setLoading(true);

                const params = new URLSearchParams({
                    page: currentPage,
                    limit: 10
                });

                // búsqueda
                if (searchTerm && searchTerm.trim() !== '') {
                    params.append('search', searchTerm);
                }

                // categoría
                if (categoria && categoria !== 'N/A') {
                    params.append('categoria', categoria);
                }

                const response = await fetch(`${apiURL}/productos?${params.toString()}`);

                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }

                const data = await response.json();

                if (data.success) {

                    setProductos(data.data || []);

                    setPagination({
                        page: data.pagination.page,
                        totalPages: data.pagination.totalPages,
                        totalItems: data.pagination.totalItems,
                        hasNext: data.pagination.hasNext,
                        hasPrev: data.pagination.hasPrev
                    });

                    setError(null);

                } else {
                    throw new Error(data.message || 'Error al obtener productos');
                }

            } catch (err) {

                console.error('Error fetchProductos:', err);
                setError('Error al cargar productos');

            } finally {

                setLoading(false);

            }
        };

    //USEEFFECT PRINCIPALES
        useEffect(() => {
            fetchProductos(page, search);
        }, [page, search]);

        useEffect(() => {
            fetchCategorias();
        }, []);

        useEffect(() => {
            const delayDebounce = setTimeout(() => {
                setSearch(searchInput)
                setPage(1)
            }, 2000)

            return () => clearTimeout(delayDebounce)

        }, [searchInput])

    //HANDLERS PRINCIPALES
    // ✅ HANDLER ABRIR EDITAR
        const handleEditar = (producto) => {
            console.log(producto)
            setEditForm({
                descripcion: producto.descripcion || '',
                proveedor: producto.proveedor || '',
                presentacion: producto.presentacion || '',
                cantidad_disponible: producto.cantidad_disponible || 0,
                cantidad_minima: producto.cantidad_minima || 0,
                cantidad_maxima: producto.cantidad_maxima || 0,
                precio_compra: producto.precio_compra || 0,
                precio_venta: producto.precio_venta || 0,
                categoria_id: producto.categoria_id || 1
            });
            setEditProduct(producto);
            setShowEditModal(true);
        };

        // ✅ HANDLER CERRAR EDITAR
        const handleCerrarEditar = () => {
            setShowEditModal(false);
            setEditForm({});
            setEditProduct(null);
        };

        const handleAbrirCrear = () => {
            setCreateForm({
                descripcion: '',
                proveedor: '',
                presentacion: '',
                cantidad_disponible: 0,
                cantidad_minima: 0,
                cantidad_maxima: 0,
                precio_compra: 0,
                precio_venta: 0,
                categoria_id: 1
            });
            setShowCreateModal(true);
        };

        // ✅ GUARDAR NUEVO PRODUCTO
        const handleCrearProducto = async (e) => {
            e.preventDefault();
            try {
                setUpdating('new');
                const response = await fetch(`${apiURL}/productos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(createForm)
                });

                if (response.ok) {
                    const data = await response.json();
                    setProductos([data.data, ...productos]); // Agregar al inicio
                    setShowCreateModal(false);
                    setCreateForm({}); // Reset
                } else {
                    throw new Error('Error al crear producto');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setUpdating(null);
            }
        };

        // ✅ CERRAR MODAL CREAR
        const handleCerrarCrear = () => {
            setShowCreateModal(false);
            setCreateForm({});
        };

        const handleEliminar = (producto) => {
            setModalProduct(producto);
            setShowModal(true);
        };

        // ✅ HANDLER CONFIRMAR DESACTIVAR
        const handleConfirmarToggle = async () => {
            if (!modalProduct) return;
            
            try {
                setUpdating(modalProduct.id);
                const nuevoEstado = !modalProduct.activo;
                
                const response = await fetch(`${apiURL}/productos/${modalProduct.id}/toggle`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activo: nuevoEstado })
                });

                if (response.ok) {
                    const data = await response.json();
                    setProductos(productos.map(p => p.id === modalProduct.id ? data.data : p));
                } else {
                    throw new Error('Error al actualizar');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setUpdating(null);
                setShowModal(false);
                setModalProduct(null);
            }
        };

        // ✅ HANDLER CERRAR MODAL
        const handleCerrarModal = () => {
            setShowModal(false);
            setModalProduct(null);
        };

        // ✅ HANDLER GUARDAR EDITAR
        const handleGuardar = async (e) => {
            e.preventDefault();
            if (!editProduct) return;
            
            try {
                setUpdating(editProduct.id);
                const response = await fetch(`${apiURL}/productos/${editProduct.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editForm)
                });

                if (response.ok) {
                    const data = await response.json();
                    setProductos(productos.map(p => p.id === editProduct.id ? data.data : p));
                    setShowEditModal(false);
                    setEditForm({});
                    setEditProduct(null);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setUpdating(null);
            }
        };

        // ✅ HANDLER CANCELAR EDITAR
        const handleCancelar = () => {
            setEditForm({});
        };

        const handlePageChange = (newPage) => {
            if (newPage >= 1 && newPage <= pagination.totalPages) {
                setPage(newPage);
            }
        };

    //UTILS PRINCIPALES
        // ✅ Helper para precios seguros
        const formatPrecio = (precio) => {
            return Number(precio || 0).toLocaleString('es-SV', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        };

    // Productos.jsx — fragmento return (reemplaza desde el loading hasta el final)
// El resto del componente (estados, handlers, fetches) permanece igual.

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
                <p className="text-sm" style={{ color: '#888' }}>Cargando productos...</p>
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
                        <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Productos</h1>
                        <p className="text-sm" style={{ color: '#888' }}>Inventario y catálogo</p>
                    </div>
                    <button onClick={handleAbrirCrear}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                        + Nuevo Producto
                    </button>
                </div>

                {/* BUSCADOR */}
                <div className="mb-6 max-w-md">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="search" placeholder="Buscar productos, proveedor o categoría..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); e.target.blur(); } }}
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
                {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
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
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                        <span className="text-xs ml-1" style={{ color: '#aaa' }}>Pág. {page} de {pagination.totalPages}</span>
                    </div>
                )}

                {/* GRID PRODUCTOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                    {productos.map((producto) => (
                        <div key={producto.id} className="rounded-2xl p-5 transition-all duration-200"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

                            {/* Cabecera */}
                            <div className="flex items-start justify-between mb-3 gap-2">
                                <h3 className="text-sm font-medium leading-tight line-clamp-2 flex-1" style={{ color: '#111' }}>
                                    {producto.descripcion || 'Sin descripción'}
                                </h3>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    {producto.categoria_codigo && (
                                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f0f0ea', color: '#666', border: '0.5px solid #e0e0da' }}>
                                            {producto.categoria_codigo}
                                        </span>
                                    )}
                                    <span className="text-xs px-2 py-0.5 rounded-md"
                                        style={producto.activo
                                            ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                            : { background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>
                                        {producto.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 mb-4">
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Proveedor</span>
                                    <span className="font-medium truncate ml-2 max-w-[120px] text-right" style={{ color: '#555' }}>{producto.proveedor || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Presentación</span>
                                    <span className="font-medium truncate ml-2 max-w-[120px] text-right" style={{ color: '#555' }}>{producto.presentacion || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Stock</span>
                                    <span className="font-medium" style={{ color: producto.cantidad_disponible <= producto.cantidad_minima ? '#a03030' : '#2a7a2a' }}>
                                        {parseInt(producto.cantidad_disponible)} unid.
                                    </span>
                                </div>
                            </div>

                            {/* Precios */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="p-2 rounded-lg text-center" style={{ background: '#f5f5f0', border: '0.5px solid #e8e8e2' }}>
                                    <p className="text-xs mb-0.5" style={{ color: '#aaa' }}>Compra</p>
                                    <p className="text-sm font-medium" style={{ color: '#111' }}>${formatPrecio(producto.precio_compra)}</p>
                                </div>
                                <div className="p-2 rounded-lg text-center" style={{ background: '#f5f5f0', border: '0.5px solid #e8e8e2' }}>
                                    <p className="text-xs mb-0.5" style={{ color: '#aaa' }}>Venta</p>
                                    <p className="text-sm font-medium" style={{ color: '#111' }}>${formatPrecio(producto.precio_venta)}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                                <span className="text-xs" style={{ color: '#ccc' }}>{new Date(producto.fecha_creado).toLocaleDateString('es-SV')}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditar(producto)} disabled={updating === producto.id}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                                        style={{ background: '#f0f4ff', border: '0.5px solid #c8d8f0', color: '#3060a0' }}
                                        title="Editar">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => handleEliminar(producto)} disabled={updating === producto.id}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                                        style={producto.activo
                                            ? { background: '#fdf4f4', border: '0.5px solid #f0d0d0', color: '#a03030' }
                                            : { background: '#f4faf4', border: '0.5px solid #c8e6c8', color: '#2a7a2a' }}
                                        title={producto.activo ? 'Desactivar' : 'Activar'}>
                                        {producto.activo ? (
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

                {/* PAGINACIÓN INFERIOR */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
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
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                    </div>
                )}

                {/* VACÍO */}
                {productos.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm mb-4" style={{ color: '#aaa' }}>No hay productos registrados</p>
                        <button onClick={() => { setShowCreateModal(true); setProductosPage(1); fetchProductos(1); }}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium"
                            style={{ background: '#222', color: '#fff' }}>
                            + Crear Primer Producto
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
                            style={modalProduct?.activo
                                ? { background: '#fdf4f4', border: '0.5px solid #f0d0d0' }
                                : { background: '#f4faf4', border: '0.5px solid #c8e6c8' }}>
                            {modalProduct?.activo ? (
                                <svg className="w-5 h-5" style={{ color: '#a03030' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            ) : (
                                <svg className="w-5 h-5" style={{ color: '#2a7a2a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            )}
                        </div>

                        <h3 className="text-base font-medium text-center mb-2" style={{ color: '#111' }}>
                            {modalProduct?.activo ? '¿Desactivar producto?' : '¿Activar producto?'}
                        </h3>
                        <p className="text-xs text-center mb-1" style={{ color: '#888' }}>"{modalProduct?.descripcion}"</p>
                        <p className="text-xs text-center mb-6" style={{ color: '#bbb' }}>
                            {modalProduct?.activo
                                ? 'Se ocultará de las listas pero podrás reactivarlo.'
                                : 'Volverá a aparecer en todas las listas.'}
                        </p>

                        <div className="flex gap-3">
                            <button onClick={handleCerrarModal} disabled={updating === modalProduct?.id}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                                style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                Cancelar
                            </button>
                            <button onClick={handleConfirmarToggle} disabled={updating === modalProduct?.id}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                style={modalProduct?.activo
                                    ? { background: '#a03030', color: '#fff', border: 'none' }
                                    : { background: '#2a7a2a', color: '#fff', border: 'none' }}>
                                {updating === modalProduct?.id
                                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                                    : modalProduct?.activo ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                    </div>
                </div>
                </>
            )}

            {/* ── MODAL CREAR PRODUCTO ─────────────────────────────── */}
            {showCreateModal && (
                <>
                <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarCrear} />
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                            <div>
                                <h3 className="text-base font-medium" style={{ color: '#111' }}>Nuevo Producto</h3>
                                <p className="text-xs" style={{ color: '#aaa' }}>Completa los campos requeridos</p>
                            </div>
                            <button onClick={handleCerrarCrear} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form onSubmit={handleCrearProducto} className="space-y-4">

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>DESCRIPCIÓN *</label>
                                    <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                        style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                        value={createForm.descripcion}
                                        onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                                        placeholder="Cerveza Imperial 12oz" maxLength={100} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>PROVEEDOR</label>
                                        <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={createForm.proveedor}
                                            onChange={(e) => setCreateForm({ ...createForm, proveedor: e.target.value })}
                                            placeholder="Cervecería SV" />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>PRESENTACIÓN</label>
                                        <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={createForm.presentacion}
                                            onChange={(e) => setCreateForm({ ...createForm, presentacion: e.target.value })}
                                            placeholder="Botella 355ml" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>CATEGORÍA *</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-2.5 rounded-lg text-sm outline-none appearance-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={createForm.categoria_id}
                                            onChange={(e) => setCreateForm({ ...createForm, categoria_id: parseInt(e.target.value) })}
                                            required>
                                            <option value="">Selecciona una categoría</option>
                                            {categorias.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.codigo} - {cat.nombre}</option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#aaa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[['Stock Inicial', 'cantidad_disponible', '120'], ['Stock Mínimo', 'cantidad_minima', '20'], ['Stock Máximo', 'cantidad_maxima', '300']].map(([label, key, placeholder]) => (
                                        <div key={key}>
                                            <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>{label.toUpperCase()}</label>
                                            <input type="number" min="0" step="1" placeholder={placeholder} required
                                                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                                style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                                value={createForm[key]}
                                                onChange={(e) => setCreateForm({ ...createForm, [key]: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[['Precio Compra', 'precio_compra', '0.75'], ['Precio Venta', 'precio_venta', '1.20']].map(([label, key, placeholder]) => (
                                        <div key={key}>
                                            <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>{label.toUpperCase()} *</label>
                                            <input type="number" step="0.01" placeholder={placeholder} required
                                                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                                style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                                value={createForm[key]}
                                                onChange={(e) => setCreateForm({ ...createForm, [key]: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                    ))}
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
                                            : 'Crear Producto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                </>
            )}

            {/* ── MODAL EDITAR PRODUCTO ────────────────────────────── */}
            {showEditModal && (
                <>
                <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarEditar} />
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                            <div>
                                <h3 className="text-base font-medium" style={{ color: '#111' }}>Editar Producto <span style={{ color: '#aaa' }}>#{editProduct?.id}</span></h3>
                                <p className="text-xs" style={{ color: '#aaa' }}>Modifica la información del producto</p>
                            </div>
                            <button onClick={handleCerrarEditar} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form onSubmit={handleGuardar} className="space-y-4">

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>DESCRIPCIÓN *</label>
                                    <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                        style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                        value={editForm.descripcion || ''}
                                        onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                                        placeholder="Cerveza Imperial 12oz" maxLength={100} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>PROVEEDOR</label>
                                        <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={editForm.proveedor || ''}
                                            onChange={(e) => setEditForm({ ...editForm, proveedor: e.target.value })}
                                            placeholder="Cervecería SV" maxLength={50} />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>PRESENTACIÓN</label>
                                        <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={editForm.presentacion || ''}
                                            onChange={(e) => setEditForm({ ...editForm, presentacion: e.target.value })}
                                            placeholder="Botella 355ml" maxLength={30} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>CATEGORÍA *</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-2.5 rounded-lg text-sm outline-none appearance-none"
                                            style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                            value={editForm.categoria_id || ''}
                                            onChange={(e) => setEditForm({ ...editForm, categoria_id: parseInt(e.target.value) })}
                                            required>
                                            <option value="">Selecciona una categoría</option>
                                            {categorias.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.codigo} - {cat.nombre}</option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#aaa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[['Disponible', 'cantidad_disponible', '120'], ['Mínimo', 'cantidad_minima', '20'], ['Máximo', 'cantidad_maxima', '300']].map(([label, key, placeholder]) => (
                                        <div key={key}>
                                            <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>STOCK {label.toUpperCase()}</label>
                                            <input type="number" min="0" step="1" placeholder={placeholder} required
                                                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                                style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                                value={editForm[key] || ''}
                                                onChange={(e) => setEditForm({ ...editForm, [key]: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[['Precio Compra', 'precio_compra', '0.75'], ['Precio Venta', 'precio_venta', '1.20']].map(([label, key, placeholder]) => (
                                        <div key={key}>
                                            <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>{label.toUpperCase()} *</label>
                                            <input type="number" step="0.01" placeholder={placeholder} required
                                                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                                style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                                value={editForm[key] || ''}
                                                onChange={(e) => setEditForm({ ...editForm, [key]: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={handleCerrarEditar}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                        style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={updating === editProduct?.id}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                                        {updating === editProduct?.id
                                            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                                            : 'Actualizar Producto'}
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

export default Productos;