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
            }, 4000)

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

        if (loading) {
        return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:py-20">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200/50 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <p className="text-lg sm:text-xl font-medium text-gray-700 text-center">Cargando productos...</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* ✅ BOTÓN CREAR - HEADER */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">🍻 Productos</h1>
                    <button
                        onClick={handleAbrirCrear}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 sm:py-3.5 sm:px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
                    >                       
                        ➕ Nuevo Producto
                    </button>
                </div>

                {/* 🔎 BUSCADOR */}
                <div className="mb-8 flex justify-center">
                    <div className="relative w-full max-w-lg">

                        {/* Icono */}
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <input
                            type="search"
                            placeholder="Buscar productos, proveedor o categoría..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setSearch(searchInput)
                                    setPage(1)
                                    e.target.blur()
                                }
                            }}
                            className="
                                w-full
                                pl-12 pr-10
                                py-3
                                bg-white
                                border border-gray-200
                                rounded-2xl
                                shadow-sm

                                text-gray-800
                                placeholder-gray-400

                                transition-all duration-200

                                focus:outline-none
                                focus:border-blue-400
                                focus:ring-4
                                focus:ring-blue-100
                                focus:shadow-md
                            "
                        />

                        {/* Botón limpiar */}
                        {searchInput && (
                            <button
                                onClick={() => {
                                    setSearchInput('')
                                    setSearch('')
                                    setPage(1)
                                }}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}

                    </div>
                </div>

                {/* Header RESPONSIVO */}
                <div className="text-center mb-8 sm:mb-12 px-4">
                    {/* ✅ PAGINACIÓN*/}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-md lg:shadow-lg flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 mb-8">
                            
                            {/* ← Anterior */}
                            <button 
                                className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page <= 1}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Números de página */}
                            <div className="hidden sm:flex gap-1 sm:gap-1.5 lg:gap-2 justify-center min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] flex-wrap">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const startPage = Math.max(1, page - 2);
                                    const pageNum = Math.min(startPage + i, pagination.totalPages);
                                    
                                    return (
                                        <button
                                            key={`page-btn-${pageNum}-${i}`}
                                            className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-sm lg:shadow-md flex items-center justify-center text-xs sm:text-sm lg:text-base flex-shrink-0 ${
                                                pageNum === page 
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-200'
                                            }`}
                                            onClick={() => setPage(pageNum)}
                                            aria-label={`Ir a página ${pageNum}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Siguiente → */}
                            <button 
                                className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                disabled={page >= pagination.totalPages}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Info página */}
                            <div className="hidden sm:block lg:flex text-gray-700 font-semibold bg-gray-100 px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
                                <span className="hidden sm:inline lg:hidden">{page}/{pagination.totalPages}</span>
                                <span className="lg:inline hidden">Pg. <span className="text-blue-600 font-bold">{page}</span> de <span className="text-purple-600 font-bold">{pagination.totalPages}</span></span>
                            </div>
                        </div>
                    )}
                </div>                

                {/* Productos Grid RESPONSIVO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {productos.map((producto) => (
                    <div 
                    key={producto.id}
                    className="group bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 sm:p-8 hover:shadow-xl hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 shadow-md relative overflow-hidden"
                    >                  
                        {/* ✅ BADGE CATEGORÍA - ESQUINA SUPERIOR DERECHA */}
                        {producto.categoria_codigo && (
                            <div className="absolute top-3 right-3 z-20">
                                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
                                    {producto.categoria_codigo}
                                </span>
                            </div>
                        )}
                        
                        {/* CONTENIDO ORIGINAL */}
                        <div>  
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-2 sm:gap-0">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-700 leading-tight">
                                {producto.descripcion || 'Sin descripción'}
                                </h3>
                                <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold self-start sm:self-end ${
                                producto.activo 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : 'bg-red-100 text-red-800 border border-red-300'
                                }`}>
                                {producto.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600 font-medium">Proveedor:</span>
                                <span className="text-gray-900 font-medium truncate">{producto.proveedor || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600 font-medium">Presentación:</span>
                                <span className="text-gray-900 font-medium truncate">{producto.presentacion || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm sm:text-base">
                                <span className="text-gray-600 font-medium">Stock:</span>
                                <span className={`font-bold text-base sm:text-lg ${
                                    producto.cantidad_disponible <= producto.cantidad_minima 
                                    ? 'text-red-600' 
                                    : 'text-emerald-600'
                                }`}>
                                    {parseInt(producto.cantidad_disponible)} unid.
                                </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="text-center p-3 sm:p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all duration-300">
                                <span className="block text-xs sm:text-sm text-blue-600 font-bold uppercase tracking-wide">Compra</span>
                                <span className="text-xl sm:text-2xl font-bold text-blue-700">${formatPrecio(producto.precio_compra)}</span>
                                </div>
                                <div className="text-center p-3 sm:p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 hover:shadow-md hover:border-emerald-200 transition-all duration-300">
                                <span className="block text-xs sm:text-sm text-emerald-600 font-bold uppercase tracking-wide">Venta</span>
                                <span className="text-xl sm:text-2xl font-bold text-emerald-700">${formatPrecio(producto.precio_venta)}</span>
                                </div>
                            </div>

                            <div className="pt-3 sm:pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    {/* FECHA a la izquierda */}
                                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                                        {new Date(producto.fecha_creado).toLocaleDateString('es-SV')}
                                    </span>
                                    
                                    {/* BOTONES FLOTANTES */}
                                    <div className="flex gap-2">
                                        {/* EDITAR */}
                                        <button
                                            onClick={() => handleEditar(producto)}
                                            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                            title="Editar producto"
                                            disabled={updating === producto.id}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        
                                        {/* ELIMINAR (Toggle activo) */}
                                        <button
                                            onClick={() => handleEliminar(producto)}
                                            className={`w-8 h-8 text-white rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                                            producto.activo 
                                                ? 'bg-red-500 hover:bg-red-600' 
                                                : 'bg-emerald-500 hover:bg-emerald-600'
                                            } ${updating === producto.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={producto.activo ? 'Desactivar producto' : 'Activar producto'}
                                            disabled={updating === producto.id}
                                        >
                                            {producto.activo ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>

                {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-red-800 mb-8 sm:mb-12 max-w-md mx-auto">
                    <p className="text-base sm:text-lg font-medium">{error}</p>
                </div>
                )}
                
                {/* ✅ PAGINACIÓN*/}
                {pagination.totalPages > 1 && (
                    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-md lg:shadow-lg flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 mb-8">
                        
                        {/* ← Anterior */}
                        <button 
                            className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Números de página */}
                        <div className="hidden sm:flex gap-1 sm:gap-1.5 lg:gap-2 justify-center min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] flex-wrap">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const startPage = Math.max(1, page - 2);
                                const pageNum = Math.min(startPage + i, pagination.totalPages);
                                
                                return (
                                    <button
                                        key={`page-btn-${pageNum}-${i}`}
                                        className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-sm lg:shadow-md flex items-center justify-center text-xs sm:text-sm lg:text-base flex-shrink-0 ${
                                            pageNum === page 
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-200'
                                        }`}
                                        onClick={() => setPage(pageNum)}
                                        aria-label={`Ir a página ${pageNum}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Siguiente → */}
                        <button 
                            className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                            disabled={page >= pagination.totalPages}
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Info página */}
                        <div className="hidden sm:block lg:flex text-gray-700 font-semibold bg-gray-100 px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
                            <span className="hidden sm:inline lg:hidden">{page}/{pagination.totalPages}</span>
                            <span className="lg:inline hidden">Pg. <span className="text-blue-600 font-bold">{page}</span> de <span className="text-purple-600 font-bold">{pagination.totalPages}</span></span>
                        </div>
                    </div>
                )}

                {/* VACÍO */}
                    {productos.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">🍻</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay productos</h3>
                            <p className="text-gray-600 mb-6">Crea tu primera producto para empezar</p>
                            <button
                                onClick={() => {
                                    setShowCreateModal(true);
                                    setProductosPage(1);
                                    fetchProductos(1);
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                                ➕ Crear Primer Producto
                            </button>
                        </div>
                    )}
            </div>
            {/* ✅ MODAL CONFIRMACIÓN */}
            {showModal && (
                <>
                    {/* Fondo overlay */}
                    <div 
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[50] flex items-center justify-center p-4"
                        onClick={handleCerrarModal}
                    />
                    
                    {/* Modal*/}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
                        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto transform transition-all duration-300 ease-out scale-100 opacity-100 translate-y-0
                            bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mx-4">
                            
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg border-4 transition-all duration-300 ${
                                    modalProduct?.activo 
                                        ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-red-200' 
                                        : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-emerald-200'
                                }`}>
                                    {modalProduct?.activo ? (
                                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    ) : (
                                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                
                                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 leading-tight">
                                    {modalProduct?.activo ? '¿Desactivar producto?' : '¿Activar producto?'}
                                </h3>
                                
                                <p className="text-lg font-semibold text-gray-900 mb-2">
                                    <span className="bg-gray-100 px-4 py-2 rounded-full text-sm inline-block">
                                        "{modalProduct?.descripcion}"
                                    </span>
                                </p>
                                
                                <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                                    {modalProduct?.activo 
                                        ? 'Este producto se ocultará de las listas públicas pero podrás reactivarlo cuando quieras.'
                                        : 'El producto volverá a aparecer en todas las listas y estará disponible para ventas.'
                                    }
                                </p>
                            </div>

                            {/* Botones */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
                                {/* Botón Principal - Stack en móvil, full-width */}
                                <button
                                    onClick={handleConfirmarToggle}
                                    disabled={updating === modalProduct?.id}
                                    className={`w-full sm:flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                                        modalProduct?.activo 
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-red-200' 
                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border border-emerald-200'
                                    }`}
                                >
                                    {updating === modalProduct?.id ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span className="text-sm sm:text-base">Procesando...</span>
                                        </div>
                                    ) : modalProduct?.activo ? '🗑️ Desactivar' : '✅ Activar'}
                                </button>
                                
                                {/* Botón Cancelar - Compacto en móvil */}
                                <button
                                    onClick={handleCerrarModal}
                                    disabled={updating === modalProduct?.id}
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-bold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 border border-gray-300 text-sm sm:text-base whitespace-nowrap"
                                >
                                    ❌ Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ✅ MODAL CREAR PRODUCTO CON CATEGORÍAS */}
            {showCreateModal && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                        onClick={handleCerrarCrear}
                    />
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                        <div className="w-full max-w-lg pointer-events-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl flex items-center justify-center border-4 border-green-200 shadow-lg">
                                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Nuevo Producto</h3>
                                <p className="text-gray-600">Completa todos los campos para crear tu nuevo producto</p>
                            </div>

                            <form onSubmit={handleCrearProducto} className="space-y-4">
                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                                    <input
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        value={createForm.descripcion}
                                        onChange={(e) => setCreateForm({...createForm, descripcion: e.target.value})}
                                        placeholder="Cerveza Imperial 12oz"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                {/* Proveedor + Presentación */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor</label>
                                        <input
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                                            value={createForm.proveedor}
                                            onChange={(e) => setCreateForm({...createForm, proveedor: e.target.value})}
                                            placeholder="Cervecería de El Salvador"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Presentación</label>
                                        <input
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                                            value={createForm.presentacion}
                                            onChange={(e) => setCreateForm({...createForm, presentacion: e.target.value})}
                                            placeholder="Botella 355ml"
                                        />
                                    </div>
                                </div>

                                {/* ✅ NUEVO: SELECTOR CATEGORÍAS */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm appearance-none bg-white"
                                            value={createForm.categoria_id}
                                            onChange={(e) => setCreateForm({...createForm, categoria_id: parseInt(e.target.value)})}
                                            required
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            {categorias.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.codigo} - {cat.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Inicial *</label>
                                        <input
                                            type="number" min="0" step="1"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                                            value={createForm.cantidad_disponible}
                                            onChange={(e) => setCreateForm({...createForm, cantidad_disponible: parseFloat(e.target.value) || 0})}
                                            placeholder="120"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Mínimo *</label>
                                        <input
                                            type="number" min="0" step="1"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                                            value={createForm.cantidad_minima}
                                            onChange={(e) => setCreateForm({...createForm, cantidad_minima: parseFloat(e.target.value) || 0})}
                                            placeholder="20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Máximo *</label>
                                        <input
                                            type="number" min="0" step="1"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                                            value={createForm.cantidad_maxima}
                                            onChange={(e) => setCreateForm({...createForm, cantidad_maxima: parseFloat(e.target.value) || 0})}
                                            placeholder="300"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Precios */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Compra *</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                                            value={createForm.precio_compra}
                                            onChange={(e) => setCreateForm({...createForm, precio_compra: parseFloat(e.target.value) || 0})}
                                            placeholder="0.75"
                                            required
                                        />  
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Venta *</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                                            value={createForm.precio_venta}
                                            onChange={(e) => setCreateForm({...createForm, precio_venta: parseFloat(e.target.value) || 0})}
                                            placeholder="1.20"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                                    <button
                                        type="submit"
                                        disabled={updating === 'new'}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                                    >
                                        {updating === 'new' ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-1"></div>
                                                Creando...
                                            </>
                                        ) : '✅ Crear Producto'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCerrarCrear}
                                        className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        ❌ Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* ✅ MODAL EDITAR PRODUCTO COMPLETO - CON CATEGORÍA */}
            {showEditModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                        onClick={handleCerrarEditar}
                    />
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                        <div className="w-full max-w-lg pointer-events-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center border-4 border-blue-200 shadow-lg">
                                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    Editar Producto <span className="text-blue-600">#{editProduct?.id}</span>
                                </h3>
                                <p className="text-gray-600">Modifica la información del producto</p>
                            </div>

                            <form onSubmit={handleGuardar} className="space-y-4">
                                {/* 1. DESCRIPCIÓN */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                                    <input
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editForm.descripcion || ''}
                                        onChange={(e) => setEditForm({...editForm, descripcion: e.target.value})}
                                        placeholder="Cerveza Imperial 12oz"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                {/* 2. PROVEEDOR + PRESENTACIÓN + CATEGORÍA */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor</label>
                                        <input
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={editForm.proveedor || ''}
                                            onChange={(e) => setEditForm({...editForm, proveedor: e.target.value})}
                                            placeholder="Cervecería de El Salvador"
                                            maxLength={50}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Presentación</label>
                                        <input
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={editForm.presentacion || ''}
                                            onChange={(e) => setEditForm({...editForm, presentacion: e.target.value})}
                                            placeholder="Botella 355ml"
                                            maxLength={30}
                                        />
                                    </div>
                                </div>

                                {/* ✅ SELECTOR CATEGORÍAS */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
                                            value={editForm.categoria_id || ''}
                                            onChange={(e) => setEditForm({...editForm, categoria_id: parseInt(e.target.value)})}
                                            required
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            {categorias.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.codigo} - {cat.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. STOCK - 3 COLUMNAS */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Disponible *</label>
                                        <input
                                            type="number" min="0" step="1"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={editForm.cantidad_disponible || ''}
                                            onChange={(e) => setEditForm({...editForm, cantidad_disponible: parseFloat(e.target.value) || 0})}
                                            placeholder="120"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Mínimo *</label>
                                        <input
                                            type="number" min="0" step="1"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={editForm.cantidad_minima || ''}
                                            onChange={(e) => setEditForm({...editForm, cantidad_minima: parseFloat(e.target.value) || 0})}
                                            placeholder="20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Máximo *</label>
                                        <input
                                            type="number" min="0" step="1"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={editForm.cantidad_maxima || ''}
                                            onChange={(e) => setEditForm({...editForm, cantidad_maxima: parseFloat(e.target.value) || 0})}
                                            placeholder="300"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* 4. PRECIOS */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Compra *</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={editForm.precio_compra || ''}
                                            onChange={(e) => setEditForm({...editForm, precio_compra: parseFloat(e.target.value) || 0})}
                                            placeholder="0.75"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Venta *</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={editForm.precio_venta || ''}
                                            onChange={(e) => setEditForm({...editForm, precio_venta: parseFloat(e.target.value) || 0})}
                                            placeholder="1.20"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* BOTONES RESPONSIVOS */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                                    <button
                                        type="submit"
                                        disabled={updating === editProduct?.id}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                                    >
                                        {updating === editProduct?.id ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-1"></div>
                                                Guardando...
                                            </>
                                        ) : '💾 Actualizar Producto'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCerrarEditar}
                                        className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        ❌ Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Productos;