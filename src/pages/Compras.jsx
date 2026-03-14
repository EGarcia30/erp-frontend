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


    useEffect(() => {
        const delay = setTimeout(() => {
            setSearchCompras(searchComprasInput);
            setPage(1);
        }, 4000);

        return () => clearTimeout(delay);

    }, [searchComprasInput]);

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
            p.id === productoId ? { ...p, cantidad: p.cantidad + 1 } : p
        ));
    };

    const handleDisminuirCantidad = (productoId) => {
        const producto = selectedProductos.find(p => p.id === productoId);
        if (producto && producto.cantidad > 1) {
            setSelectedProductos(selectedProductos.map(p => 
                p.id === productoId ? { ...p, cantidad: p.cantidad - 1 } : p
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

    if (loading) {
        return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:py-20">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200/50 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <p className="text-lg sm:text-xl font-medium text-gray-700 text-center">Cargando compras...</p>
        </div>
        );
    }
    return (
        <>
            {/* ✅ LISTA PRINCIPAL */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-6 px-4 sm:py-8 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">🛒 Compras</h1>
                        <button
                            onClick={() => {
                                setShowCreateModal(true);
                                setProductosPage(1);
                                fetchCategorias();
                                setCategoriaSeleccionada('N/A');
                            }}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 px-6 sm:py-3 sm:px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
                        >
                            ➕ Nueva Compra
                        </button>
                    </div>

                    {/* 🔎 BUSCAR COMPRAS */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative w-full max-w-lg">

                            {/* icono */}
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>

                            <input
                                type="search"
                                placeholder="Buscar compras por proveedor..."
                                value={searchComprasInput}
                                onChange={(e) => setSearchComprasInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {

                                        setSearchCompras(searchComprasInput)
                                        setPage(1)

                                        // 📱 cerrar teclado móvil
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
                                    placeholder-gray-400
                                    transition-all
                                    focus:outline-none
                                    focus:border-emerald-400
                                    focus:ring-4
                                    focus:ring-emerald-100
                                "
                            />

                            {/* limpiar búsqueda */}
                            {searchComprasInput && (
                                <button
                                    onClick={() => {
                                        setSearchComprasInput('')
                                        setSearchCompras('')
                                        setPage(1)
                                    }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}

                        </div>
                    </div>

                    {/* ✅ PAGINACIÓN COMPRAS*/}
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


                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {compras.map(compra => (
                            <div key={compra.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                                    <h3 className="font-bold text-lg sm:text-xl text-gray-900">#{compra.id}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-bold ${
                                        compra.estado === 'pagado' 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {compra.estado === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                                    </span>
                                </div>
                                <p className="text-sm sm:text-base text-gray-600 mb-2">
                                    <span className="font-normal">Proveedor:</span> 
                                    <span className="font-bold ml-1">{compra.proveedor}</span>
                                </p>
                                <p className="text-sm sm:text-base text-gray-600 mb-2">
                                    <span className="font-normal">Dirección:</span> 
                                    <span className="font-bold ml-1">{compra.direccion}</span>
                                </p>
                                <div className="flex items-start">
                                    <span className="text-sm font-bold text-gray-600">{formatFechaUTCWithTime(compra.fecha_creado)}</span>
                                </div>
                                <div className="text-2xl lg:text-3xl font-bold text-emerald-600 my-2 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                                ${formatDinero(compra.total)}
                                </div>
                                {/* ✅ BOTONES RESPONSIVE */}
                                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                    {compra.estado === 'pendiente' && (
                                        <button
                                            onClick={() => handlePagarCompra(compra.id)}
                                            disabled={updating === compra.id}
                                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 text-sm"
                                        >
                                            {updating === compra.id ? 'Procesando...' : '✅ Marcar Pagado'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleVerDetalle(compra.id)}
                                        disabled={loadingDetail === compra.id}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 text-sm"
                                    >
                                        {loadingDetail === compra.id ? 'Cargando...' : '👁️ Ver Detalle'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ✅ PAGINACIÓN COMPRAS*/}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-md lg:shadow-lg flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 my-8">
                            
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
                    {compras.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">🛒</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay compras</h3>
                            <p className="text-gray-600 mb-6">Crea tu primera compra para empezar</p>
                            <button
                                onClick={() => {
                                    setShowCreateModal(true);
                                    setProductosPage(1);
                                    fetchProductos(1);
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                                ➕ Crear Primera Compra
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ MODAL CREAR */}
            {showCreateModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] sm:bg-black/40" onClick={handleCerrarModal} />
                    <div className="fixed inset-0 z-[60] p-4 sm:p-6 flex items-center justify-center">
                        <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl max-h-[95vh] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                            
                            {/* ✅ HEADER FIJO MÁS COMPACTO */}
                            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50 flex-shrink-0">
                                <div className="flex items-center justify-between mb-3 gap-3">
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight truncate">
                                            {compraEditando ? '✏️ Editar Compra' : '➕ Nueva Compra'}
                                            {compraEditando?.estado === 'pagado' && (
                                                <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                                                    ✅ Pagada
                                                </span>
                                            )}
                                            <p className="text-base text-gray-600">
                                                Total: <span className="text-xl font-bold text-emerald-600">${formatDinero(calcularTotal())}</span>
                                                {selectedProductos.length > 0 && ` (${selectedProductos.length} productos)`}
                                            </p>
                                        </h2>
                                    </div>
                                    
                                    {/* TOTAL Y X TOTALMENTE A LA DERECHA */}
                                    <div className="flex items-center gap-3 flex-shrink-0"> 
                                        <button 
                                            onClick={handleCerrarModal} 
                                            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all w-9 h-9 flex items-center justify-center flex-shrink-0"
                                            aria-label="Cerrar modal"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* ✅ FORM CABECERA COMPACTO */}
                                <form onSubmit={handleCrearCompra} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Proveedor *</label>
                                        <input
                                            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                            value={createForm.proveedor}
                                            onChange={(e) => setCreateForm({...createForm, proveedor: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Dirección</label>
                                        <input
                                            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                            value={createForm.direccion}
                                            onChange={(e) => setCreateForm({...createForm, direccion: e.target.value})}
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* ✅ CONTENIDO SCROLLABLE */}
                            <div className="flex-1 overflow-y-auto">
                                {/* ✅ LISTA PRODUCTOS + BOTÓN CREAR */}
                                <div className="p-4 sm:p-6">   
                                    <div className="mb-6 space-y-3">                                       
                                        {/* CATEGORÍAS - Scroll horizontal NATURAL */}
                                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                                            {/* N/A */}
                                            <button onClick={() => {
                                                    setCategoriaSeleccionada('N/A');
                                                    fetchProductos(1, 'N/A');
                                                    setProductosPage(1);
                                                }}
                                                className={`flex-none px-3 py-2 rounded-xl font-semibold text-sm whitespace-nowrap ${
                                                    categoriaSeleccionada === 'N/A'
                                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                                                        : 'bg-white hover:bg-emerald-50 text-gray-700 border border-gray-200 hover:shadow-md'
                                                }`}>
                                                N/A
                                            </button>
                                            
                                            {/* Categorías */}
                                            {categorias.map((cat) => (
                                                <button key={cat.id}
                                                        onClick={() => {
                                                            setCategoriaSeleccionada(cat.codigo);
                                                            fetchProductos(1, cat.codigo);
                                                            setProductosPage(1);
                                                        }}
                                                        className={`flex-none px-3 py-2 rounded-xl font-semibold text-sm whitespace-nowrap flex items-center gap-1 ${
                                                            categoriaSeleccionada === cat.codigo
                                                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                                                                : 'bg-white hover:bg-emerald-50 text-gray-700 border border-gray-200 hover:shadow-md'
                                                        }`}>
                                                    {cat.codigo}
                                                </button>
                                            ))}
                                        </div>
                                        {/* 🔎 BUSCAR PRODUCTO */}
                                        <div className="mb-4">
                                            <div className="relative">

                                                {/* Icono */}
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                                    </svg>
                                                </div>

                                                <input
                                                    type="search"
                                                    placeholder="Buscar producto..."
                                                    value={searchProductoInput}
                                                    onChange={(e) => setSearchProductoInput(e.target.value)}
                                                    onKeyDown={(e) => {

                                                        if (e.key === "Enter") {
                                                            setSearchProducto(searchProductoInput)
                                                            setProductosPage(1)

                                                            // 📱 cerrar teclado móvil
                                                            e.target.blur()
                                                        }

                                                        // limpiar con ESC (extra UX)
                                                        if (e.key === "Escape") {
                                                            setSearchProductoInput('')
                                                            setSearchProducto('')
                                                        }

                                                    }}
                                                    className="
                                                        w-full
                                                        pl-10 pr-10
                                                        py-2.5
                                                        bg-white
                                                        border border-gray-200
                                                        rounded-xl
                                                        shadow-sm
                                                        placeholder-gray-400
                                                        transition-all
                                                        focus:outline-none
                                                        focus:border-blue-400
                                                        focus:ring-4
                                                        focus:ring-blue-100
                                                    "
                                                />

                                                {/* Botón limpiar */}
                                                {searchProductoInput && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchProductoInput('')
                                                            setSearchProducto('')
                                                            setProductosPage(1)
                                                        }}
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                    >
                                                        ✕
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                        {/* PAGINACIÓN */}
                                        {productosPagination.totalPages > 1 && (
                                            <div className="flex items-center justify-end gap-1 sm:gap-2 pt-4 pb-6">
                                                <button
                                                    onClick={() => setProductosPage(Math.max(1, productosPage - 1))}
                                                    disabled={productosPage <= 1}
                                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
                                                >
                                                    ‹
                                                </button>                                            
                                                <button
                                                    onClick={() => setProductosPage(Math.min(productosPagination.totalPages, productosPage + 1))}
                                                    disabled={productosPage >= productosPagination.totalPages}
                                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
                                                >
                                                    ›
                                                </button>
                                            </div>
                                        )}
                                    </div>                                 

                                    {/* BOTONES PRODUCTOS - ESTILO PREMIUM */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-6">
                                        {productos.map(producto => {
                                            const cantidadSeleccionada = selectedProductos.filter(p => p.id === producto.id)
                                                .reduce((total, p) => total + (p.cantidad || 1), 0);
                                            
                                            return (
                                                <button
                                                    key={producto.id}
                                                    onClick={() => handleAgregarProducto(producto)}
                                                    disabled={producto.cantidad_disponible === 0}
                                                    className="group p-4 sm:p-5 border-3 border-emerald-300 rounded-2xl hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-300/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed h-full flex flex-col items-start gap-2 shadow-lg hover:shadow-xl relative overflow-hidden"
                                                >
                                                    {cantidadSeleccionada > 0 && (
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-20">
                                                            <span className="text-sm">✓</span>
                                                            <span>{parseInt(cantidadSeleccionada)}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-emerald-700 leading-tight h-12 z-10 relative pr-8 sm:pr-0">
                                                        {producto.descripcion}
                                                    </div>
                                                    <div className="text-sm sm:text-base text-gray-600 z-10 relative pr-8 sm:pr-0">{producto.presentacion}</div>
                                                    <div className="font-bold text-emerald-600 text-lg sm:text-xl w-full text-left z-10 relative pr-8 sm:pr-0">
                                                        ${producto.precio_compra.toLocaleString('es-SV')}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 z-10 relative pr-8 sm:pr-0">
                                                        Stock <span className="text-base font-semibold">{parseInt(producto.cantidad_disponible)}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* PAGINACIÓN */}
                                    {productosPagination.totalPages > 1 && (
                                        <div className="flex items-center justify-end gap-1 sm:gap-2 pt-4 pb-6">
                                            <button
                                                onClick={() => setProductosPage(Math.max(1, productosPage - 1))}
                                                disabled={productosPage <= 1}
                                                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                onClick={() => setProductosPage(Math.min(productosPagination.totalPages, productosPage + 1))}
                                                disabled={productosPage >= productosPagination.totalPages}
                                                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* PRODUCTOS SELECCIONADOS */}
                                {selectedProductos.length > 0 && (
                                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
                                        <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                                            Productos ({selectedProductos.length})
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:gap-4 pb-4">
                                            {selectedProductos.map(producto => (
                                                <div key={producto.id} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center sm:gap-4 hover:shadow-md transition-all">
                                                    <div className="flex-1 mb-3 sm:mb-0">
                                                        <p className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2">{producto.descripcion}</p>
                                                        <p className="text-xs text-gray-600">{producto.presentacion}</p>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                                                            <button
                                                                onClick={() => handleDisminuirCantidad(producto.id)}
                                                                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl flex items-center justify-center font-bold hover:scale-105 transition-all disabled:opacity-50"
                                                                disabled={producto.cantidad <= 1}
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                // Permitimos que el valor sea el número o un string vacío
                                                                value={producto.cantidad} 
                                                                onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
                                                                // OnBlur asegura que si el usuario deja vacío y sale del input, se limpie o borre
                                                                onBlur={() => {
                                                                    if (producto.cantidad === "" || !producto.cantidad) {
                                                                        setSelectedProductos(selectedProductos.filter(p => p.id !== producto.id));
                                                                    }
                                                                }}
                                                                className="w-20 p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center font-bold text-base bg-white shadow-sm"
                                                                min="0"
                                                                step="any"
                                                            />
                                                            <button
                                                                onClick={() => handleAumentarCantidad(producto.id)}
                                                                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold hover:scale-105 transition-all shadow-md"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <div className="flex items-end sm:items-center gap-2 sm:gap-3">
                                                            <span className="font-bold text-lg sm:text-xl text-emerald-600 min-w-[70px] text-right sm:text-left">
                                                                ${(producto.precio_compra * producto.cantidad).toLocaleString('es-SV')}
                                                            </span>
                                                            <button
                                                                onClick={() => handleBorrarProducto(producto.id)}
                                                                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center font-bold hover:scale-105 transition-all shadow-md flex-shrink-0"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* ✅ botones */}
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
                                <button
                                    type="button"
                                    onClick={handleCerrarModal}  // ← Agrega tu función de cancelar aquí
                                    className="flex-1 sm:flex-none w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                                >
                                    Cancelar
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleCrearCompra}
                                    disabled={
                                        selectedProductos.length === 0 || 
                                        updating === 'new' || 
                                        (compraEditando?.estado === 'pagado')
                                    }
                                    className="flex-1 sm:flex-none w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:shadow-none text-sm sm:text-base"
                                >
                                    {updating === 'new' ? (
                                        <>
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                            </svg>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            {compraEditando ? (
                                                compraEditando.estado === 'pagado' 
                                                ? '✅ Compra Pagada' 
                                                : '💾 Guardar Cambios'
                                            ) : (
                                                '✅ Crear Compra'
                                            )}
                                            <span className="text-base sm:text-lg font-bold">
                                                {selectedProductos.length} {compraEditando ? 'items' : 'prods'}
                                            </span>
                                        </>
                                    )}
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