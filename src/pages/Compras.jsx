import React, { useState, useEffect } from 'react';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Compras = () => {
    // Estados principales
    const [compras, setCompras] = useState([]);
    const [productos, setProductos] = useState([]);
    const [pagination, setPagination] = useState({});
    const [productosPagination, setProductosPagination] = useState({});
    const [page, setPage] = useState(1);
    const [productosPage, setProductosPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    // ESTADOS PARA EDITAR
    const [loadingDetail, setLoadingDetail] = useState(null);
    const [compraEditando, setCompraEditando] = useState(null);

    // Modal estados - CREAR
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProductos, setSelectedProductos] = useState([]);
    const [createForm, setCreateForm] = useState({
        proveedor: '',
        direccion: '',
        total: 0
    });

    //categorias productos
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('N/A');

    //buscador compras
    const [searchComprasInput, setSearchComprasInput] = useState('');
    const [searchCompras, setSearchCompras] = useState('');

    //buscador productos en modal
    const [searchProductoInput, setSearchProductoInput] = useState('');
    const [searchProducto, setSearchProducto] = useState('');

    //FETCH PRINCIPAL COMPRAS, CATEGORIAS Y PRODUCTOS
     // Fetch compras
    const fetchCompras = async (currentPage = 1, searchTerm = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10
            });

            if (searchTerm && searchTerm.trim() !== '') {
                params.append('search', searchTerm);
            }

            const response = await fetch(`${apiURL}/compras?${params}`);
            const data = await response.json();

            if (data.success) {
                setCompras(data.data);
                setPagination(data.pagination);
            }

        } catch (error) {
            console.error('Error cargando compras:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // ✅ Cargar categorías al abrir modal
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

    // PAGINACIÓN PRODUCTOS
    const fetchProductos = async (currentPage = 1, categoria = 'N/A', searchTerm = '') => {
        try {

            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                categoria
            });

            if (searchTerm && searchTerm.trim() !== '') {
                params.append('search', searchTerm);
            }

            const response = await fetch(`${apiURL}/productos?${params}`);
            const data = await response.json();

            if (data.success) {
                setProductos(data.data);
                setProductosPagination(data.pagination);
            }

        } catch (error) {
            console.error('Error cargando productos:', error);
        }

    };

    //USEEFFECT PRINCIPAL
    useEffect(() => {
        fetchCompras(page, searchCompras);
    }, [page, searchCompras]);


    // useEffect(() => {
    //     const delay = setTimeout(() => {
    //         setSearchCompras(searchComprasInput);
    //         setPage(1);
    //     }, 4000);

    //     return () => clearTimeout(delay);

    // }, [searchComprasInput]);

    useEffect(() => {
        if (showCreateModal) {
            fetchProductos(productosPage, categoriaSeleccionada, searchProducto);
        }
    }, [showCreateModal, productosPage, categoriaSeleccionada, searchProducto]);

    useEffect(() => {
        const delay = setTimeout(() => {
            setSearchProducto(searchProductoInput);
            setProductosPage(1);
        }, 4000);

        return () => clearTimeout(delay);

    }, [searchProductoInput]);

    //HANDLES CREAR COMPRA, VER DETALLE, PAGAR COMPRA, AUMENTAR/DISMINUIR CANTIDAD, BORRAR PRODUCTO, AGREGAR PRODUCTO

     // ✅ NUEVA FUNCIÓN: VER DETALLE / EDITAR COMPRA
    const handleVerDetalle = async (compraId) => {
        try {
            setLoadingDetail(compraId);
            const response = await fetch(`${apiURL}/compras/${compraId}`);
            const data = await response.json();
            
            if (data.success) {
                const compra = data.data;
                setCompraEditando(compra);
                setShowCreateModal(true);
                setCreateForm({
                    proveedor: compra.proveedor || '',
                    direccion: compra.direccion || '',
                    total: 0 // Se recalculará
                });
                setSelectedProductos(compra.detalles?.map(detalle => ({
                    id: detalle.producto_id,
                    descripcion: detalle.descripcion || '',
                    presentacion: detalle.presentacion || '',
                    precio_compra: detalle.precio_compra_actual,
                    precio_venta: detalle.precio_venta,
                    cantidad_disponible: 0, // No editable
                    cantidad: detalle.cantidad_vendida
                })) || []);
                setProductosPage(1);
                fetchCategorias();
                setCategoriaSeleccionada('N/A');
            }
        } catch (error) {
            console.error('Error cargando detalle:', error);
        } finally {
            setLoadingDetail(null);
        }
    };

    // CERRAR MODAL CREAR
    const handleCerrarModal = () => {
        setShowCreateModal(false);
        setSelectedProductos([]);
        setCreateForm({ proveedor: '', direccion: '', total: 0 });
        setCompraEditando(null);
        setSearchProducto('')
        setSearchProductoInput('')
        setProductosPage(1)
        setProductosPage(1);
        setCategoriaSeleccionada('N/A');
    };

    // AUMENTAR/DISMINUIR/BORRAR - SIN CAMBIOS
    const handleAumentarCantidad = (productoId) => {
        setSelectedProductos(selectedProductos.map(p => 
            p.id === productoId ? { ...p, cantidad: Number(p.cantidad) + 1 } : p
        ));
    };

    const handleDisminuirCantidad = (productoId) => {
        const producto = selectedProductos.find(p => p.id === productoId);
        if (producto && producto.cantidad > 1) {
            setSelectedProductos(selectedProductos.map(p => 
                p.id === productoId ? { ...p, cantidad: Number(p.cantidad) - 1 } : p
            ));
        }
    };

    const handleBorrarProducto = (productoId) => {
        setSelectedProductos(selectedProductos.filter(p => p.id !== productoId));
    };

    const handleCantidadChange = (productoId, valorInput) => {
        // Si el input está vacío, dejamos que el estado sea un string vacío
        // Esto permite que el usuario borre el número sin que se ponga un '1' o desaparezca
        if (valorInput === "") {
            setSelectedProductos(selectedProductos.map(p => 
                p.id === productoId ? { ...p, cantidad: "" } : p
            ));
            return;
        }

        const nuevaCantidad = parseFloat(valorInput);

        // Solo eliminamos si el usuario pone explícitamente 0 o un número negativo
        if (nuevaCantidad <= 0) {
            setSelectedProductos(selectedProductos.filter(p => p.id !== productoId));
        } else {
            setSelectedProductos(selectedProductos.map(p => 
                p.id === productoId ? { ...p, cantidad: nuevaCantidad } : p
            ));
        }
    };


     // ✅ MODIFICAR CREAR/EDITAR COMPRA
    const handleCrearCompra = async (e) => {
        e.preventDefault();
        try {
            setUpdating('new');
            
            const esEdicion = !!compraEditando;
            const url = esEdicion 
                ? `${apiURL}/compras/${compraEditando.id}`
                : `${apiURL}/compras`;
            const method = esEdicion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...createForm,
                    total: calcularTotal(),
                    estado: esEdicion ? compraEditando.estado : 'pendiente',
                    detalles: selectedProductos.map(p => ({
                        producto_id: p.id,
                        cantidad_vendida: p.cantidad,
                        precio_compra_actual: p.precio_compra,
                        precio_venta: p.precio_venta
                    }))
                })
            });

            if (response.ok) {
                handleCerrarModal();
                fetchCompras(page);
            }
        } catch (error) {
            console.error('Error guardando compra:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleAgregarProducto = (producto) => {
        const existe = selectedProductos.find(p => p.id === producto.id);
        if (existe) {
            handleAumentarCantidad(producto.id);
        } else {
            setSelectedProductos([...selectedProductos, { ...producto, cantidad: 1 }]);
        }
    };

    const handlePagarCompra = async (compraId) => {
        try {
            setUpdating(compraId);
            const response = await fetch(`${apiURL}/compras/${compraId}/pagar`, {
                method: 'PATCH'
            });
            if (response.ok) {
                fetchCompras(page);
            }
        } catch (error) {
            console.error('Error pagando compra:', error);
        } finally {
            setUpdating(null);
        }
    };

    //UTILS: FORMATEAR DINERO, CALCULAR TOTAL
    // ✅ FORMATEAR DINERO - 2 DECIMALES SIEMPRE
    const formatDinero = (numero) => {
        return Number(numero ?? 0).toLocaleString('es-SV', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const calcularTotal = () => {
        return selectedProductos.reduce((total, p) => total + (p.precio_compra * p.cantidad), 0);
    };

    const formatFechaUTCWithTime = (fechaUTC) => {
        if (!fechaUTC) return '';

        const date = new Date(fechaUTC.replace(' ', 'T'));

        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();

        let hours = date.getUTCHours();
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');

        const ampm = hours >= 12 ? 'p.m.' : 'a.m.';

        hours = hours % 12;
        if (hours === 0) hours = 12;

        const hoursStr = String(hours).padStart(2, '0');

        return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
    };

    // Compras.jsx — fragmento return (reemplaza desde el loading hasta el final)
// El resto del componente (estados, handlers, fetches) permanece igual.

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
                <p className="text-sm" style={{ color: '#888' }}>Cargando compras...</p>
            </div>
        );
    }

    return (
        <>
        {/* ── LISTA PRINCIPAL ───────────────────────────────────── */}
        <div className="min-h-screen py-8 px-4 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>

            {/* Círculos decorativos */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.12)' }} />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.08)' }} />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Compras</h1>
                        <p className="text-sm" style={{ color: '#888' }}>Gestión de órdenes de compra</p>
                    </div>
                    <button
                        onClick={() => { setShowCreateModal(true); setProductosPage(1); fetchCategorias(); setCategoriaSeleccionada('N/A'); }}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                        + Nueva Compra
                    </button>
                </div>

                {/* BUSCADOR */}
                <div className="mb-6 max-w-md">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="search" placeholder="Buscar compras por proveedor..."
                            value={searchComprasInput}
                            onChange={(e) => setSearchComprasInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { setSearchCompras(searchComprasInput); setPage(1); e.target.blur(); } }}
                            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg outline-none transition-all"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#222' }} />
                        {searchComprasInput && (
                            <button onClick={() => { setSearchComprasInput(''); setSearchCompras(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#bbb' }}>
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

                {/* GRID COMPRAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {compras.map(compra => (
                        <div key={compra.id} className="rounded-2xl p-5 transition-all duration-200"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

                            {/* Cabecera */}
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium" style={{ color: '#111' }}>Compra #{compra.id}</p>
                                <span className="text-xs px-2 py-1 rounded-md font-medium"
                                    style={compra.estado === 'pagado'
                                        ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                        : { background: '#fdfaf4', color: '#7a6a2a', border: '0.5px solid #e6d8a0' }}>
                                    {compra.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 mb-4">
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Proveedor</span>
                                    <span className="font-medium truncate ml-2 max-w-[140px] text-right" style={{ color: '#333' }}>{compra.proveedor}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Dirección</span>
                                    <span className="font-medium truncate ml-2 max-w-[140px] text-right" style={{ color: '#333' }}>{compra.direccion}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Fecha</span>
                                    <span style={{ color: '#555' }}>{formatFechaUTCWithTime(compra.fecha_creado)}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <p className="text-2xl font-medium mb-5" style={{ color: '#111' }}>${formatDinero(compra.total)}</p>

                            {/* Botones */}
                            <div className="flex gap-2">
                                {compra.estado === 'pendiente' && (
                                    <button onClick={() => handlePagarCompra(compra.id)} disabled={updating === compra.id}
                                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                                        {updating === compra.id ? 'Procesando...' : 'Marcar Pagado'}
                                    </button>
                                )}
                                <button onClick={() => handleVerDetalle(compra.id)} disabled={loadingDetail === compra.id}
                                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                                    style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                    {loadingDetail === compra.id ? 'Cargando...' : 'Ver Detalle'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

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
                {compras.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm mb-4" style={{ color: '#aaa' }}>No hay compras registradas</p>
                        <button onClick={() => { setShowCreateModal(true); setProductosPage(1); fetchProductos(1); }}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium"
                            style={{ background: '#222', color: '#fff' }}>
                            + Crear Primera Compra
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* ── MODAL CREAR / EDITAR COMPRA ──────────────────────── */}
        {showCreateModal && (
            <>
            <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarModal} />
            <div className="fixed inset-0 z-[60] p-4 flex items-center justify-center">
                <div className="w-full max-w-4xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden"
                    style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                    {/* Header fijo */}
                    <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-medium" style={{ color: '#111' }}>
                                    {compraEditando ? 'Editar Compra' : 'Nueva Compra'}
                                    {compraEditando?.estado === 'pagado' && (
                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-md" style={{ background: '#f4faf4', color: '#2a7a2a' }}>Pagada</span>
                                    )}
                                </h2>
                                <p className="text-xs" style={{ color: '#aaa' }}>
                                    Total: <span className="font-medium" style={{ color: '#111' }}>${formatDinero(calcularTotal())}</span>
                                    {selectedProductos.length > 0 && ` · ${selectedProductos.length} productos`}
                                </p>
                            </div>
                            <button onClick={handleCerrarModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Campos cabecera */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs tracking-widest mb-1.5" style={{ color: '#999' }}>PROVEEDOR *</label>
                                <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                    value={createForm.proveedor}
                                    onChange={(e) => setCreateForm({ ...createForm, proveedor: e.target.value })}
                                    required />
                            </div>
                            <div>
                                <label className="block text-xs tracking-widest mb-1.5" style={{ color: '#999' }}>DIRECCIÓN</label>
                                <input className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                    value={createForm.direccion}
                                    onChange={(e) => setCreateForm({ ...createForm, direccion: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Contenido scrollable */}
                    <div className="flex-1 overflow-y-auto min-h-0">

                        {/* Sección productos */}
                        <div className="p-6" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                            <p className="text-sm font-medium mb-4" style={{ color: '#111' }}>
                                Productos
                                {selectedProductos.length > 0 && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f0ea', color: '#666' }}>{selectedProductos.length} seleccionados</span>
                                )}
                            </p>

                            {/* Categorías */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                <button onClick={() => { setCategoriaSeleccionada('N/A'); fetchProductos(1, 'N/A'); setProductosPage(1); }}
                                    className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                                    style={categoriaSeleccionada === 'N/A' ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                    Todos
                                </button>
                                {categorias.map((cat) => (
                                    <button key={cat.id} onClick={() => { setCategoriaSeleccionada(cat.codigo); fetchProductos(1, cat.codigo); setProductosPage(1); }}
                                        className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                                        style={categoriaSeleccionada === cat.codigo ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                        {cat.codigo}
                                    </button>
                                ))}
                            </div>

                            {/* Buscador */}
                            <div className="relative mb-4 max-w-sm">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input type="search" placeholder="Buscar producto..." value={searchProductoInput}
                                    onChange={(e) => setSearchProductoInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { setSearchProducto(searchProductoInput); setProductosPage(1); e.target.blur(); } if (e.key === 'Escape') { setSearchProductoInput(''); setSearchProducto(''); } }}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                {searchProductoInput && (
                                    <button onClick={() => { setSearchProductoInput(''); setSearchProducto(''); setProductosPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#bbb' }}>✕</button>
                                )}
                            </div>

                            {/* Paginación superior */}
                            {productosPagination.totalPages > 1 && (
                                <div className="flex gap-2 mb-4">
                                    <button onClick={() => setProductosPage(Math.max(1, productosPage - 1))} disabled={productosPage <= 1}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                                    <button onClick={() => setProductosPage(Math.min(productosPagination.totalPages, productosPage + 1))} disabled={productosPage >= productosPagination.totalPages}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                                </div>
                            )}

                            {/* Grid productos */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {productos.map(producto => {
                                    const cantidadSeleccionada = selectedProductos.filter(p => p.id === producto.id).reduce((t, p) => t + (p.cantidad || 1), 0);
                                    return (
                                        <button key={producto.id} onClick={() => handleAgregarProducto(producto)} disabled={producto.cantidad_disponible === 0}
                                            className="p-3 rounded-xl text-left transition-all duration-200 disabled:opacity-40 relative"
                                            style={cantidadSeleccionada > 0
                                                ? { background: '#222', border: '0.5px solid #222' }
                                                : { background: '#fff', border: '0.5px solid #e0e0da' }}>
                                            {cantidadSeleccionada > 0 && (
                                                <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{parseInt(cantidadSeleccionada)}</span>
                                            )}
                                            <p className="text-xs font-medium mb-1 line-clamp-2 pr-6" style={{ color: cantidadSeleccionada > 0 ? '#fff' : '#222' }}>{producto.descripcion}</p>
                                            <p className="text-xs mb-1" style={{ color: cantidadSeleccionada > 0 ? 'rgba(255,255,255,0.6)' : '#aaa' }}>{producto.presentacion}</p>
                                            <p className="text-sm font-medium" style={{ color: cantidadSeleccionada > 0 ? '#fff' : '#111' }}>${producto.precio_compra.toLocaleString('es-SV')}</p>
                                            <p className="text-xs mt-1" style={{ color: cantidadSeleccionada > 0 ? 'rgba(255,255,255,0.5)' : '#ccc' }}>Stock {parseInt(producto.cantidad_disponible)}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Paginación inferior */}
                            {productosPagination.totalPages > 1 && (
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => setProductosPage(Math.max(1, productosPage - 1))} disabled={productosPage <= 1}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                                    <button onClick={() => setProductosPage(Math.min(productosPagination.totalPages, productosPage + 1))} disabled={productosPage >= productosPagination.totalPages}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                                </div>
                            )}
                        </div>

                        {/* Productos seleccionados */}
                        {selectedProductos.length > 0 && (
                            <div className="p-6" style={{ background: '#fafafa' }}>
                                <p className="text-sm font-medium mb-4" style={{ color: '#111' }}>Seleccionados ({selectedProductos.length})</p>
                                <div className="space-y-3">
                                    {selectedProductos.map(producto => (
                                        <div key={producto.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl"
                                            style={{ background: '#fff', border: '0.5px solid #e0e0da' }}>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{producto.descripcion}</p>
                                                <p className="text-xs" style={{ color: '#aaa' }}>{producto.presentacion}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 rounded-lg p-1" style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da' }}>
                                                    <button onClick={() => handleDisminuirCantidad(producto.id)} disabled={producto.cantidad <= 1}
                                                        className="w-7 h-7 rounded-md flex items-center justify-center text-sm disabled:opacity-40"
                                                        style={{ background: '#fff', color: '#555' }}>-</button>
                                                    <input type="number" min="0" step="any"
                                                        value={producto.cantidad}
                                                        onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
                                                        onBlur={() => { if (!producto.cantidad) setSelectedProductos(selectedProductos.filter(p => p.id !== producto.id)); }}
                                                        className="w-14 text-center text-sm font-medium outline-none"
                                                        style={{ background: 'transparent', color: '#222' }} />
                                                    <button onClick={() => handleAumentarCantidad(producto.id)}
                                                        className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
                                                        style={{ background: '#222', color: '#fff' }}>+</button>
                                                </div>
                                                <span className="text-sm font-medium min-w-[64px] text-right" style={{ color: '#111' }}>
                                                    ${(producto.precio_compra * producto.cantidad).toLocaleString('es-SV')}
                                                </span>
                                                <button onClick={() => handleBorrarProducto(producto.id)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                                                    style={{ background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                        <button type="button" onClick={handleCerrarModal}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium"
                            style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                            Cancelar
                        </button>
                        <button type="button" onClick={handleCrearCompra}
                            disabled={selectedProductos.length === 0 || updating === 'new' || compraEditando?.estado === 'pagado'}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center gap-2"
                            style={{ background: '#222', color: '#fff', border: 'none' }}>
                            {updating === 'new' ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                            ) : compraEditando
                                ? compraEditando.estado === 'pagado' ? 'Compra Pagada' : `Guardar Cambios · ${selectedProductos.length}`
                                : `Crear Compra · ${selectedProductos.length}`
                            }
                        </button>
                    </div>
                </div>
            </div>
            </>
        )}
        </>
    );
};

export default Compras;