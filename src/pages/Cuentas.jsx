import React, { useState, useEffect, useCallback } from 'react';
import CorteCajaModal from '../components/CorteCajaModal';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Cuentas = () => {
  // Estados principales
    const [cuentas, setCuentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [pagination, setPagination] = useState({});
    const [productosPagination, setProductosPagination] = useState({});
    const [page, setPage] = useState(1);
    const [productosPage, setProductosPage] = useState(1);
    const [mesasPage, setMesasPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    // Modal nueva cuenta
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        cliente: '',
        tipo_cuenta: 'individual',
        mesa_id: null
    });
    const [selectedProductos, setSelectedProductos] = useState([]);
    const [creatingCuenta, setCreatingCuenta] = useState(false);

    // Modal detalle - REFACTORIZADO
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCuenta, setSelectedCuenta] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [editForm, setEditForm] = useState({ cliente: '', tipo_cuenta: '' , mesa_id: '', mesa_original: '' });
    const [detalleProductos, setDetalleProductos] = useState([]); // Productos originales editables
    const [editProductos, setEditProductos] = useState([]); // Productos nuevos
    const [creatingCuentaDetalle, setCreatingCuentaDetalle] = useState(false);

    // Promociones
    const [promocionesPorProducto, setPromocionesPorProducto] = useState({});
    const [promocionesPorProductoDetalle, setPromocionesPorProductoDetalle] = useState({});

    //mesas
    const [mesasTotalPages, setMesasTotalPages] = useState(1);

    //Corte de caja
    const [showCorteModal, setShowCorteModal] = useState(false);

    //categorias
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('N/A');

    // ✅ HANDLERS DETALLE SIMPLIFICADOS
    const handleAumentarCantidadDetalle = (id) => {
        // Actualizar productos originales
        setDetalleProductos(prev => prev.map(p => 
        p.id === id ? { ...p, cantidad: (Number(p.cantidad || 0) + 1) } : p
        ));
        // Actualizar productos nuevos
        setEditProductos(prev => prev.map(p => 
        p.id === id ? { ...p, cantidad: (Number(p.cantidad || 0) + 1) } : p
        ));
    };

    const handleDisminuirCantidadDetalle = (id) => {
        // Actualizar productos originales
        setDetalleProductos(prev => prev
        .map(p => p.id === id ? { ...p, cantidad: Math.max(1, (p.cantidad || 1) - 1) } : p)
        .filter(p => p.cantidad > 0)
        );
        // Actualizar productos nuevos
        setEditProductos(prev => prev
        .map(p => p.id === id ? { ...p, cantidad: Math.max(1, (p.cantidad || 1) - 1) } : p)
        .filter(p => p.cantidad > 0)
        );
    };

    const handleEliminarProductoDetalle = (id) => {
        setDetalleProductos(prev => prev.filter(p => p.id !== id));
        setEditProductos(prev => prev.filter(p => p.id !== id));
    };

    const handleAgregarProductoDetalle = (producto) => {
        const existe = editProductos.find(p => p.id === producto.id);
        if (existe) {
            setEditProductos(prev => prev.map(p => 
            p.id === producto.id ? { ...p, cantidad: (p.cantidad || 0) + 1 } : p
        ));
        } else {
            setEditProductos(prev => [...prev, { ...producto, cantidad: 1 }]);
        }
    };

    // ✅ GUARDAR DETALLE
    const handleGuardarDetalle = async () => {
        if (!editForm.cliente) {
            alert('El cliente es requerido');
            return;
        }

        try {
            setCreatingCuentaDetalle(true);
            const todosProductos = [...detalleProductos, ...editProductos];

            console.log(todosProductos);
            const response = await fetch(`${apiURL}/cuentas/${selectedCuenta.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                cliente: editForm.cliente,
                tipo_cuenta: editForm.tipo_cuenta,
                mesa_id: editForm.mesa_id || null,
                detalles: todosProductos.map(p => ({
                    producto_id: p.producto_id || p.id,
                    cantidad_vendida: p.cantidad,
                    precio_compra_actual: p.precio_compra_actual || p.precio_compra,
                    precio_venta: p.precio_venta || p.precioventa,
                    promocion_id: p.promocion_activa?.id || null,
                    descripcion: p.descripcion
                }))
                })
            });

            const data = await response.json();
            if (data.success) {
                handleCerrarDetalle();
                fetchCuentas(page);
                fetchMesas();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        } finally {
            setCreatingCuentaDetalle(false);
        }
    };

    // Fetch data (TODO IGUAL)
    const fetchCuentas = async (currentPage = 1) => {
        try {
        setLoading(true);
        const response = await fetch(`${apiURL}/cuentas?page=${currentPage}&limit=10`);
        const data = await response.json();
        if (data.success) {
            setCuentas(data.data);
            setPagination(data.pagination);
        }
        } catch (error) {
        console.error('Error cargando cuentas:', error);
        } finally {
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

    const fetchProductos = async (currentPage = 1, categoria = 'N/A') => {
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                categoria: categoria
            });
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

    const fetchMesas = async (currentPage = 1) => {
        try {
        const response = await fetch(`${apiURL}/mesas?page=${currentPage}&limit=10`);
        const data = await response.json();
        
        if (data.success){
            setMesas(data.data)
            setMesasTotalPages(data.pagination.totalPages)
        }
        } catch (error) {
        console.error('Error cargando mesas:', error);
        }
    };

    // Handlers Modal Nueva Cuenta (TODO IGUAL)
    const handleTipoChange = (e) => {
        setCreateForm({ ...createForm, tipo_cuenta: e.target.value, mesa_id: null });
        setMesasPage(1)
    };

    const handleEditTipoChange = (e) => {
        const value = e.target.value;
        setEditForm(prev => ({
            ...prev,
            tipo_cuenta: value, mesa_id: value !== 'mesa' ? null : prev.mesa_original 
        }));
    };



    const handleMesaSelect = (mesaId) => {
        setCreateForm({ ...createForm, mesa_id: mesaId });
    };

    const handleCantidadChange = (productoId, nuevaCantidad) => {
        setSelectedProductos(prev => 
        prev.map(p => 
            p.id === productoId 
            ? { ...p, cantidad: nuevaCantidad || 1 }
            : p
        )
        );
    };

    const handleAumentarCantidad = (productoId) => {
        setSelectedProductos(prev => 
        prev.map(p => 
            p.id === productoId 
            ? { 
                ...p, 
                cantidad: parseFloat((Number(p.cantidad || 1) + 1).toFixed(2))
                } 
            : p
        )
        );
    };

    const handleDisminuirCantidad = (productoId) => {
        setSelectedProductos(prev => {
        const cantidadActual = Number(prev.find(p => p.id === productoId)?.cantidad || 1);
        if (cantidadActual <= 1) {
            return prev.filter(p => p.id !== productoId);
        }
        
        const nuevaCantidad = parseFloat((cantidadActual - 1).toFixed(2));
        if (nuevaCantidad <= 0) {
            return prev.filter(p => p.id !== productoId);
        }

        return prev.map(p => 
            p.id === productoId 
            ? { ...p, cantidad: nuevaCantidad } 
            : p
        );
        });
    };

    const handleAgregarProducto = (producto) => {
        const existe = selectedProductos.find(p => p.id === producto.id);
        if (existe) {
            setSelectedProductos(selectedProductos.map(p =>
            p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
            ));
        } else {
            setSelectedProductos([
            ...selectedProductos,
            { 
                ...producto, 
                cantidad: 1,
                precioventa_original: producto.precio_venta, // guardar precio normal
                promocion_activa: null                       // sin promo al inicio
            }
            ]);
        }
    };

    const handlePromocionChange = (productoId, promocion) => {
        setSelectedProductos(prev =>
            prev.map(p => {
            if (p.id !== productoId) return p;

            const precioBase = p.precioventa_original ?? p.precio_venta;
            return {
                ...p,
                promocion_activa: promocion,
                precio_venta: promocion ? promocion.nuevo_precio_venta : precioBase
            };
            })
        );
    };

    const handlePromocionChangeDetalle = (cuentaDetalleId, promocion) => {
        // Actualizar productos originales
        setDetalleProductos(prev =>
            prev.map(p => {
                //p es modelo de cuenta_detalle no producto
                if (p.id !== cuentaDetalleId) return p;
                
                const precioBase = p.precioventa_original;
                return {
                    ...p,
                    promocion_activa: promocion,
                    precio_venta: promocion ? promocion.nuevo_precio_venta : precioBase
                };
            })
        );

    };


    const handleBorrarProducto = (productoId) => {
        setSelectedProductos(selectedProductos.filter(p => p.id !== productoId));
    };

    const calcularTotal = () => {
        return selectedProductos.reduce((total, p) => total + (p.precio_venta * p.cantidad), 0);
    };

    // Handlers Cuentas (CORREGIDO)
    const handlePagarCuenta = async (cuentaId) => {
        try {
        setUpdating(cuentaId);
        const response = await fetch(`${apiURL}/cuentas/${cuentaId}/pagar`, {
            method: 'PATCH'
        });
        const data = await response.json();
        
        if (data.success) {
            await Promise.all([
            fetchCuentas(page),
            fetchMesas()
            ]);
        }
        } catch (error) {
        console.error('Error pagar:', error);
        } finally {
        setUpdating(null);
        }
    };

    const handleVerDetalle = async (cuentaId) => {
        try {
            setLoadingDetail(cuentaId);
            const response = await fetch(`${apiURL}/cuentas/${cuentaId}`);
            const data = await response.json();
            if (data.success) {
                handleAbrirDetalle(data.data);
            }
        } catch (error) {
            console.error('Error detalle:', error);
        } finally {
            setLoadingDetail(null);
        }
    };

    // ✅ handleAbrirDetalle
    const handleAbrirDetalle = useCallback(async (cuenta) => {
        // Inicializar estados
        setSelectedCuenta(cuenta);
        setEditForm({ cliente: cuenta.cliente, tipo_cuenta: cuenta.tipo_cuenta, mesa_id: cuenta.mesa_id || '', mesa_original: cuenta.mesa_id || '' });
        setDetalleProductos(cuenta.detalles?.map(d => ({ 
            ...d, 
            cantidad: d.cantidad_vendida || d.cantidad || 1 
        })) || []);
        setEditProductos([]);
        
        // ✅ CARGAR PRODUCTOS ANTES de abrir modal
        setProductosPage(1);
        await Promise.all([fetchProductos(1), fetchCategorias()]);
        
        setShowDetailModal(true);
    }, [fetchProductos]);

    const handleCrearCuenta = async (e) => {
        e.preventDefault();
        if (!createForm.cliente || selectedProductos.length === 0) return;
        
        try {
            setCreatingCuenta(true);
        const response = await fetch(`${apiURL}/cuentas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            ...createForm,
            total: calcularTotal(),
            detalles: selectedProductos.map(p => ({
                producto_id: p.id,
                cantidad_vendida: p.cantidad,
                precio_compra_actual: p.precio_compra,
                precio_venta: p.precio_venta || p.precio_compra * 1.3,
                promocion_id: p.promocion_activa?.id || null
            }))
            })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            setShowCreateModal(false);
            setSelectedProductos([]);
            setCreateForm({ cliente: '', tipo_cuenta: 'individual', mesa_id: null });
            setProductosPage(1);
            fetchCuentas(page);
            fetchMesas();
        } else {
            console.error('Error API:', data.error);
            alert('Error creando cuenta: ' + (data.error || 'Inténtalo de nuevo'));
        }
        } catch (error) {
            console.error('Error creando cuenta:', error);
            alert('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setCreatingCuenta(false);
        }
    };

    const handleCerrarModal = () => {
        setShowCreateModal(false);
        setSelectedProductos([]);
        setCreateForm({ cliente: '', tipo_cuenta: 'individual', mesa_id: null });
        setProductosPage(1);
        setCategoriaSeleccionada('N/A');  // ✅ Reset a N/A
        fetchProductos(1, 'N/A');   
    };

    const handleCerrarDetalle = () => {
        setShowDetailModal(false);
        setSelectedCuenta(null);
        setEditForm({ cliente: '', mesa_id: '' });
        setDetalleProductos([]);
        setEditProductos([]);
    };

    // ✅ 1. PROMOCIONES - SOLO editProductos
    const handlePromocionChangeEdit = (productoId, promocion) => {
        setEditProductos(prev =>
            prev.map(p =>
                p.id === productoId
                    ? { ...p, promocion_activa: promocion, precio_venta: promocion?.nuevo_precio_venta || p.precio_venta_original}
                    : p
            
            )
        );
    };

    // ✅ 2. CANTIDAD - SOLO editProductos
    const handleAumentarCantidadEdit = (productoId) => {
        setEditProductos(prev =>
            prev.map(p =>
                p.id === productoId ? { ...p, cantidad: (p.cantidad || 1) + 1 } : p
            )
        );
    };

    const handleDisminuirCantidadEdit = (productoId) => {
        setEditProductos(prev =>
            prev.map(p =>
                p.id === productoId && (p.cantidad || 1) > 1
                    ? { ...p, cantidad: (p.cantidad || 1) - 1 }
                    : p
            )
        );
    };

    // ✅ 3. ELIMINAR - SOLO editProductos
    const handleEliminarProductoEdit = (productoId) => {
        setEditProductos(prev => prev.filter(p => p.id !== productoId));
    };

    const formatDinero = (numero) => {
        return Number(numero ?? 0).toLocaleString('es-SV', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
        });
    };

    // Effects
    useEffect(() => {
        fetchCuentas(page);
        fetchMesas();
    }, [page]);

    useEffect(() => {
        if (showDetailModal) {
            fetchCategorias(); 
            fetchProductos(productosPage,categoriaSeleccionada);
        }
    }, [showDetailModal, productosPage, categoriaSeleccionada]);

    useEffect(() => {
        if (showCreateModal) {
            fetchCategorias(); 
            fetchProductos(productosPage, categoriaSeleccionada);
        }
    }, [showCreateModal, productosPage, categoriaSeleccionada]);

    useEffect(() => {
        if (selectedProductos.length === 0) return;

        const cargarPromociones = async () => {
            try {
            const ids = selectedProductos.map(p => p.id);
            const response = await fetch(`${apiURL}/promociones?ids=${ids.join(',')}`);
            const data = await response.json();

            if (data.success) {
                const map = {};
                data.data.forEach(promo => {
                if (!map[promo.producto_id]) map[promo.producto_id] = [];
                map[promo.producto_id].push(promo);
                });
                setPromocionesPorProducto(map);
            }
            } catch (error) {
                console.error('Error cargando promociones:', error);
            }
        };

        cargarPromociones();
    }, [selectedProductos]);

    // ✅useEffect de promociones detalle:
    useEffect(() => {
        if (showDetailModal) {
            // ✅ Endpoint nuevo: /api/promociones/all
            fetch(`${apiURL}/promociones/all`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        const map = {};
                        data.data.forEach(promo => {
                            const prodId = String(promo.producto_id);
                            if (!map[prodId]) map[prodId] = [];
                            map[prodId].push(promo);
                        });
                        setPromocionesPorProductoDetalle(map);
                    }
                })
                .catch(err => console.error('❌ Error:', err));
        }
    }, [showDetailModal]);

    useEffect(() => {
        fetchMesas(mesasPage);
    }, [mesasPage])

    //Utils
    const formatFechaUTCWithTime = (fechaUTC) => {
        const date = new Date(fechaUTC);
        const day = String(date.getDate()).padStart(2, '0');        // Local day
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Local month
        const year = date.getFullYear();                            // Local year
        
        // Formato 12 horas con AM/PM - HORA LOCAL
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 -> 12
        const hoursStr = String(hours).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
    };


    if (loading && cuentas.length === 0) {
        return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:py-20">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200/50 border-t-blue-600 rounded-full animate-spin mb-6" />
            <p className="text-lg sm:text-xl font-medium text-gray-700 text-center">Cargando cuentas...</p>
        </div>
        );
    }

    return (
        <>      
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-6 px-4 sm:py-8 sm:px-6 lg:py-12">
            <div className="max-w-7xl mx-auto">
                {/* HEADER CON BOTÓN CORTE DE CAJA */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 lg:mb-12 gap-4">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">💰 Cuentas</h1>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {/* BOTÓN NUEVA CUENTA (sin cambios) */}
                        <button
                            onClick={() => {
                                setShowCreateModal(true);
                                setProductosPage(1);
                                setCategoriaSeleccionada('N/A');
                            }}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
                        >
                            ➕ Nueva Cuenta
                        </button>
                        
                        {/* ✅ BOTÓN CORTE DE CAJA NUEVO */}
                        <button
                            onClick={() => setShowCorteModal(true)}
                            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
                            title="Solo 1 corte por turno (18:00-06:00)"
                        >
                            🖨️ Corte de Caja
                        </button>
                    </div>
                </div>

                {/* PAGINACIÓN CUENTAS */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-md lg:shadow-lg mb-8 lg:mb-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                    <button 
                        className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="hidden sm:flex gap-1 lg:gap-2 justify-center min-w-[120px] lg:min-w-[160px]">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, page - 2);
                        const pageNum = Math.min(startPage + i, pagination.totalPages);
                        return (
                            <button
                            key={pageNum}
                            className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-sm lg:shadow-md flex items-center justify-center text-sm lg:text-base flex-shrink-0 ${
                                pageNum === page 
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-200'
                            }`}
                            onClick={() => setPage(pageNum)}
                            >
                            {pageNum}
                            </button>
                        );
                        })}
                    </div>

                    <button 
                        className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                        onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                        disabled={page >= pagination.totalPages}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="hidden sm:block text-gray-700 font-semibold bg-gray-100 px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl border border-gray-200 text-sm lg:text-base whitespace-nowrap flex-shrink-0">
                        Pg. <span className="text-blue-600 font-bold">{page}</span> de <span className="text-purple-600 font-bold">{pagination.totalPages}</span>
                    </div>
                    </div>
                )}

                {/* GRID CUENTAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cuentas.map(cuenta => (
                    <div key={cuenta.id} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">Cuenta #{cuenta.id}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                cuenta.estado === 'pagado' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                                {cuenta.estado === 'pagado' ? '✅ Pagada' : '⏳ Pendiente'}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 mb-6">
                            <div className="flex items-center">
                                <span className="text-lg text-gray-600 font-medium min-w-[80px]">Cliente:</span>
                                <span className="text-lg font-bold text-gray-600 ms-2">{cuenta.cliente.toUpperCase()}</span>
                            </div>

                            {cuenta.mesa_id && (
                                <div className="flex items-center">
                                <span className="text-lg text-gray-600 font-medium min-w-[80px]">🪑 Mesa:</span>
                                <span className="text-lg font-bold text-gray-600 ms-2">{cuenta.numero_mesa}</span>
                                </div>
                            )}

                            <div className="flex items-start">
                                <span className="text-sm font-bold text-gray-600">{formatFechaUTCWithTime(cuenta.fecha_creado)}</span>
                            </div>
                        </div>

                        <div className="text-2xl lg:text-3xl font-bold text-emerald-600 mb-6 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                        ${formatDinero(cuenta.total)}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {cuenta.estado === 'pendiente' && (
                            <button
                            onClick={() => handlePagarCuenta(cuenta.id)}
                            disabled={updating === cuenta.id}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                            {updating === cuenta.id ? (
                                <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Pagando...
                                </>
                            ) : (
                                '💰 Marcar Pagado'
                            )}
                            </button>
                        )}
                        
                        <button 
                            onClick={() => handleVerDetalle(cuenta.id)}
                            disabled={loadingDetail === cuenta.id}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            👁️ Ver Detalle
                        </button>
                        </div>
                    </div>
                    ))}
                </div>

                {/* PAGINACIÓN CUENTAS */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-md lg:shadow-lg mb-8 lg:mb-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                    <button 
                        className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="hidden sm:flex gap-1 lg:gap-2 justify-center min-w-[120px] lg:min-w-[160px]">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, page - 2);
                        const pageNum = Math.min(startPage + i, pagination.totalPages);
                        return (
                            <button
                            key={pageNum}
                            className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-sm lg:shadow-md flex items-center justify-center text-sm lg:text-base flex-shrink-0 ${
                                pageNum === page 
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-200'
                            }`}
                            onClick={() => setPage(pageNum)}
                            >
                            {pageNum}
                            </button>
                        );
                        })}
                    </div>

                    <button 
                        className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                        onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                        disabled={page >= pagination.totalPages}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="hidden sm:block text-gray-700 font-semibold bg-gray-100 px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl border border-gray-200 text-sm lg:text-base whitespace-nowrap flex-shrink-0">
                        Pg. <span className="text-blue-600 font-bold">{page}</span> de <span className="text-purple-600 font-bold">{pagination.totalPages}</span>
                    </div>
                    </div>
                )}

                {cuentas.length === 0 && !loading && (
                    <div className="text-center py-20">
                    <div className="text-6xl mb-4">💸</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay cuentas</h2>
                    <p className="text-gray-600 mb-6">Crea la primera cuenta para empezar</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                        ➕ Nueva Cuenta
                    </button>
                    </div>
                )}
            </div>
        </div>

        {/* MODAL NUEVA CUENTA */}
        {showCreateModal && (
            <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-in fade-in-0 zoom-in-95 duration-200" onClick={handleCerrarModal} />
            <div className="fixed inset-0 z-[60] p-4 sm:p-6 flex items-center justify-center">
                <div className="w-full max-w-6xl max-h-[95vh] flex flex-col bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                    
                    {/* HEADER PEQUEÑO FIJO */}
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50 flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Nueva Cuenta</h2>
                                <p className="text-base text-gray-600">
                                    Total: <span className="text-xl font-bold text-emerald-600">${formatDinero(calcularTotal())}</span>
                                    {selectedProductos.length > 0 && ` (${selectedProductos.length} productos)`}
                                </p>
                            </div>
                            <button onClick={handleCerrarModal} className="p-2 rounded-2xl hover:bg-gray-200 transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* FORM CABECERA */}
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            {/* Contenedor Cliente */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Cliente *</label>
                                <input
                                    className="w-full p-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    value={createForm.cliente}
                                    onChange={(e) => setCreateForm({ ...createForm, cliente: e.target.value })}
                                    required
                                    placeholder="Nombre del cliente"
                                />
                            </div>
                            {/* Contenedor Tipo de Cuenta */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Tipo de Cuenta
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleTipoChange({ target: { value: 'individual' } })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                                            createForm.tipo_cuenta === 'individual'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-lg leading-none">👤</span>
                                        <span className="font-medium">Individual</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTipoChange({ target: { value: 'mesa' } })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                                            createForm.tipo_cuenta === 'mesa'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-lg leading-none">🪑</span>
                                        <span className="font-medium">Mesa</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* CONTENIDO SCROLLABLE */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        
                        {/* MESAS */}
                        {createForm.tipo_cuenta === 'mesa' && (
                            <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">🪑 Seleccionar Mesa</h3>
                                {/* Paginacion mesas */}
                                { mesasTotalPages > 1 && (
                                    <div className="flex items-center justify-end gap-2 pb-4 mb-2">
                                        <button 
                                            onClick={() => setMesasPage(p => Math.max(1, p - 1))}
                                            disabled={mesasPage === 1}
                                            className="w-12 h-12 bg-gradient-to-r from-orange-800 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                        >
                                            ‹
                                        </button>
                                        <button 
                                            onClick={() => setMesasPage(p => Math.min(mesasTotalPages, p + 1))}
                                            disabled={mesasPage === mesasTotalPages}
                                            className="w-12 h-12 bg-gradient-to-r from-orange-800 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                        >
                                            ›
                                        </button>
                                    </div> 
                                )}                                     
                                {/* Grid mesas */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                    {mesas.map(mesa => (
                                        <button
                                            key={mesa.id}
                                            type="button"
                                            onClick={() => handleMesaSelect(mesa.id)}
                                            className={`group p-4 sm:p-5 rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg border-4 h-full flex flex-col items-center justify-center gap-3 ${
                                                createForm.mesa_id === mesa.id
                                                    ? 'ring-4 ring-blue-500 bg-blue-50 border-blue-400 shadow-2xl shadow-blue-200/50'
                                                    : mesa.estado === 'disponible'
                                                    ? 'bg-emerald-100 border-emerald-400 hover:bg-emerald-200 hover:shadow-xl hover:shadow-emerald-200/50'
                                                    : 'bg-orange-100 border-orange-400 hover:bg-orange-200 hover:shadow-xl hover:shadow-orange-200/50'
                                            }`}
                                        >
                                            <div className="text-2xl font-bold">Mesa {mesa.numero_mesa}</div>
                                            <span className={`px-3 py-2 rounded-xl text-xs font-bold ${
                                                mesa.estado === 'disponible' 
                                                    ? 'bg-emerald-200 text-emerald-800 shadow-emerald-200/50' 
                                                    : 'bg-orange-200 text-orange-800 shadow-orange-200/50'
                                            }`}>
                                                {mesa.estado === 'disponible' ? '✅ LIBRE' : '🪑 OCUPADA'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {/* Paginacion mesas */}
                                {mesasTotalPages > 1 && (
                                    <div className="flex items-center justify-end gap-2 pt-4 mb-2">
                                        <button 
                                            onClick={() => setMesasPage(p => Math.max(1, p - 1))}
                                            disabled={mesasPage === 1}
                                            className="w-12 h-12 bg-gradient-to-r from-orange-800 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                        >
                                            ‹
                                        </button>
                                        <button 
                                            onClick={() => setMesasPage(p => Math.min(mesasTotalPages, p + 1))}
                                            disabled={mesasPage === mesasTotalPages}
                                            className="w-12 h-12 bg-gradient-to-r from-orange-800 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                        >
                                            ›
                                        </button>
                                    </div>  
                                )}
                            </div>
                        )}

                       {/* LISTA PRODUCTOS DESTACADA - CORREGIDA */}
                        <div className="p-6 sm:p-8 border-b-4 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                                {/* TÍTULO */}
                                <h3 className="text-base sm:text-2xl font-bold flex items-center gap-2 text-emerald-800">
                                    🛍️ Lista de Productos
                                    <span className="text-sm sm:text-lg bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-semibold">
                                        {selectedProductos.length} seleccionado{selectedProductos.length !== 1 ? 's' : ''}
                                    </span>
                                </h3>
                            </div>

                            {/* CONTENEDOR SIMPLE */}
                            <div className="mb-6 space-y-3">
                                {/* PAGINACIÓN SUPERIOR */}
                                {productosPagination.totalPages > 1 && (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => (
                                            setProductosPage(Math.max(1, productosPage - 1))
                                            )} 
                                                disabled={productosPage === 1}
                                                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center">
                                            ‹
                                        </button>
                                        <button onClick={() => setProductosPage(Math.min(productosPagination.totalPages || 1, productosPage + 1))} 
                                                disabled={productosPage === (productosPagination.totalPages || 1)}
                                                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center">
                                            ›
                                        </button>
                                    </div>
                                )}

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
                            </div>

                            {/* GRID PRODUCTOS */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                                                    <span>{cantidadSeleccionada}</span>
                                                </div>
                                            )}
                                            
                                            <div className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-emerald-700 leading-tight h-12 z-10 relative pr-8 sm:pr-0">
                                                {producto.descripcion}
                                            </div>
                                            <div className="text-sm sm:text-base text-gray-600 z-10 relative pr-8 sm:pr-0">{producto.presentacion}</div>
                                            <div className="font-bold text-emerald-600 text-lg sm:text-xl w-full text-left z-10 relative pr-8 sm:pr-0">
                                                ${formatDinero(producto.precio_venta || producto.precioventa)}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 z-10 relative pr-8 sm:pr-0">
                                                Stock <span className="text-base font-semibold">{Math.trunc(producto.cantidad_disponible).toString()}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* PAGINACIÓN INFERIOR */}
                            {productosPagination.totalPages > 1 && (
                                <div className="flex items-center justify-end gap-2 pt-4 mb-2">
                                    <button
                                        onClick={() => setProductosPage(Math.max(1, productosPage - 1))}
                                        disabled={productosPage === 1}
                                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={() => setProductosPage(Math.min(productosPagination.totalPages || 1, productosPage + 1))}
                                        disabled={productosPage === (productosPagination.totalPages || 1)}
                                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        ›
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* DETALLES DE PRODUCTOS SELECCIONADOS */}
                        {selectedProductos.length > 0 && (
                            <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                                    📋 Detalles de Productos ({selectedProductos.length})
                                </h3>
                                <div className="space-y-4">
                                    {selectedProductos.map(producto => (
                                        <div key={producto.id} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center lg:gap-6">
                                            {/* COLUMNA IZQUIERDA - Descripción + Chip */}
                                            <div className="flex-1 mb-6 lg:mb-0 lg:mr-6">
                                                <p className="font-bold text-lg text-gray-900 line-clamp-2">{producto.descripcion}</p>
                                                <p className="text-base text-gray-600 mt-1">{producto.presentacion}</p>
                                                
                                                {/* CHIP PROMOCIÓN ACTIVA */}
                                                {producto.promocion_activa && (
                                                    <p className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                                                        🎉 {producto.promocion_activa.nombre_promocion}{' '}
                                                        <span className="font-normal">
                                                            ({formatDinero(producto.promocion_activa.nuevo_precio_venta)} c/u)
                                                        </span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* BOTONES PROMOCIONES */}
                                            {promocionesPorProducto[producto.id] && (
                                                <div className="flex flex-wrap gap-1 lg:gap-2 mb-4 lg:mb-0 lg:w-32 order-1 lg:order-none">
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePromocionChange(producto.id, null)}
                                                        className={`px-3 py-2 m-1.5 md:m-0 rounded-full text-base font-medium transition-all shadow-md flex-shrink-0 ${
                                                            !producto.promocion_activa
                                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/50 scale-105'
                                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-lg'
                                                        }`}
                                                    >
                                                        💰 Individual
                                                    </button>
                                                    {promocionesPorProducto[producto.id].map((promo) => (
                                                        <button
                                                            key={promo.id}
                                                            type="button"
                                                            onClick={() => handlePromocionChange(producto.id, promo)}
                                                            className={`px-3 py-2 m-1.5 md:m-0 rounded-full text-base font-medium transition-all shadow-md flex-shrink-0 ${
                                                                producto.promocion_activa?.id === promo.id
                                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/50 scale-105'
                                                                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200 hover:shadow-lg'
                                                            }`}
                                                        >
                                                            {promo.nombre_promocion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* CONTROLES */}
                                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4 w-full lg:w-auto order-last lg:order-none">
                                                <div className="flex items-center justify-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
                                                    <button
                                                        onClick={() => handleDisminuirCantidad(producto.id)}
                                                        className="w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={producto.cantidad?.toString() || '1'}
                                                        onChange={(e) => handleCantidadChange(producto.id, parseFloat(e.target.value) || 1)}
                                                        className="w-20 p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center font-bold text-base bg-white shadow-sm"
                                                    />
                                                    <button
                                                        onClick={() => handleAumentarCantidad(producto.id)}
                                                        className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all shadow-md"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                
                                                <div className="flex items-end lg:items-center gap-3">
                                                    <span className="font-bold text-2xl text-emerald-600 min-w-[80px] text-right lg:text-left">
                                                        ${formatDinero((producto.precio_venta || producto.precioventa) * (producto.cantidad || 1))}
                                                    </span>
                                                    <button
                                                        onClick={() => handleBorrarProducto(producto.id)}
                                                        className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all shadow-md"
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

                    {/* BOTONES MÁS PEQUEÑOS EN MÓVIL */}
                    <div className="p-4 sm:p-8 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
                        <button
                            onClick={handleCerrarModal}
                            className="flex-1 sm:flex-none w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCrearCuenta}
                            disabled={!createForm.cliente || selectedProductos.length === 0 || creatingCuenta}
                            className="flex-1 sm:flex-none w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:shadow-none text-sm sm:text-base"
                        >
                            {creatingCuenta ? (
                                <>
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    Crear Cuenta 
                                    <span className="text-base sm:text-lg font-bold">{selectedProductos.length}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            </>
        )}

        {/* ✅ MODAL DETALLE - CATEGORÍAS ARRIBA DE PAGINACIÓN SUPERIOR */}
        {showDetailModal && selectedCuenta && (
            <div>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] animate-in fade-in-0 zoom-in-95 duration-200" onClick={handleCerrarDetalle} />
            <div className="fixed inset-0 z-[70] p-4 sm:p-6 flex items-center justify-center">
                <div className="w-full max-w-6xl max-h-[95vh] flex flex-col bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                    
                    {/* HEADER PEQUEÑO FIJO */}
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                    Editar Cuenta #{selectedCuenta.id}
                                </h2>
                                <p className="text-base text-gray-600">
                                    Total <span className="text-xl font-bold text-emerald-600">
                                        ${formatDinero([...detalleProductos, ...editProductos].reduce((total, p) => total + (p.precio_venta || p.precioventa || 0) * (p.cantidad || 1), 0))}
                                    </span>
                                    ({detalleProductos.length + editProductos.length} productos)
                                </p>
                            </div>
                            <button onClick={handleCerrarDetalle} className="p-2 rounded-2xl hover:bg-gray-200 transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* FORM CABECERA - SIN CATEGORÍAS */}
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-6">
                            {/* 1. CLIENTE */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Cliente *</label>
                                <input
                                    className="w-full p-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    value={editForm.cliente}
                                    onChange={(e) => setEditForm({ ...editForm, cliente: e.target.value })}
                                    required
                                    placeholder="Nombre del cliente"
                                />
                            </div>

                            {/* 2. TIPO DE CUENTA */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Tipo de Cuenta
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleEditTipoChange({ target: { value: 'individual' } })}
                                        className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                                            editForm.tipo_cuenta === 'individual'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500'
                                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-base">👤</span>
                                        <span className="font-medium text-sm">Individual</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleEditTipoChange({ target: { value: 'mesa' } })}
                                        className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                                            editForm.tipo_cuenta === 'mesa'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500'
                                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-base">🪑</span>
                                        <span className="font-medium text-sm">Mesa</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* CONTENIDO SCROLLABLE */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {/* MESAS */}
                        {editForm.tipo_cuenta === 'mesa' && (
                            <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">🪑 Seleccionar Mesa</h3>
                                {/* Paginacion mesas */}
                                    {mesasTotalPages > 1 && (
                                        <div className="flex items-center justify-end gap-2 pb-4 mb-2">
                                            <button 
                                                onClick={() => setMesasPage(p => Math.max(1, p - 1))}
                                                disabled={mesasPage === 1}
                                                className="w-12 h-12 bg-gradient-to-r from-orange-800 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                            >
                                                ‹
                                            </button>
                                            <button 
                                                onClick={() => setMesasPage(p => Math.min(mesasTotalPages, p + 1))}
                                                disabled={mesasPage === mesasTotalPages}
                                                className="w-12 h-12 bg-gradient-to-r from-orange-800 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    )}                                          
                                    {/*Grid de mesas */}                          
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                        {mesas.map(mesa => (
                                            <button
                                                key={mesa.id}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, mesa_id: mesa.id })}
                                                className={`group p-4 sm:p-5 rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg border-4 h-full flex flex-col items-center justify-center gap-3 ${
                                                    editForm.mesa_id === mesa.id
                                                        ? 'ring-4 ring-blue-500 bg-blue-50 border-blue-400 shadow-2xl shadow-blue-200/50'
                                                        : mesa.estado === 'disponible'
                                                        ? 'bg-emerald-100 border-emerald-400 hover:bg-emerald-200 hover:shadow-xl hover:shadow-emerald-200/50'
                                                        : 'bg-orange-100 border-orange-400 hover:bg-orange-200 hover:shadow-xl hover:shadow-orange-200/50'
                                                }`}
                                            >
                                                <div className="text-2xl font-bold">Mesa {mesa.numero_mesa}</div>
                                                <span className={`px-3 py-2 rounded-xl text-xs font-bold ${
                                                    mesa.estado === 'disponible' 
                                                        ? 'bg-emerald-200 text-emerald-800 shadow-emerald-200/50' 
                                                        : 'bg-orange-200 text-orange-800 shadow-orange-200/50'
                                                }`}>
                                                    {mesa.estado === 'disponible' ? '✅ LIBRE' : '🪑 OCUPADA'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    {/* Paginacion mesas */}
                                    {mesasTotalPages > 1 && (
                                        <div className="flex items-center justify-end gap-2 pt-4 mb-2">
                                            <button 
                                                onClick={() => setMesasPage(p => Math.max(1, p - 1))}
                                                disabled={mesasPage === 1}
                                                className="w-12 h-12 bg-gradient-to-r from-orange-800 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                            >
                                                ‹
                                            </button>
                                            <button 
                                                onClick={() => setMesasPage(p => Math.min(mesasTotalPages, p + 1))}
                                                disabled={mesasPage === mesasTotalPages}
                                                className="w-12 h-12 bg-gradient-to-r from-orange-800 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    )}   
                            </div>
                        )}

                        {/* LISTA PRODUCTOS DESTACADA - CATEGORÍAS ARRIBA PAGINACIÓN */}
                        <div className="p-6 sm:p-8 border-b-4 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                                <h3 className="text-base sm:text-2xl font-bold flex items-center gap-2 text-blue-800">
                                    🛍️ Lista de Productos
                                    <span className="text-sm sm:text-lg bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold">
                                        {detalleProductos.length + editProductos.length} total
                                    </span>
                                </h3>
                            </div>

                            {/* ✅ PAGINACIÓN SUPERIOR */}
                            {productosPagination.totalPages > 1 && (
                                <div className="flex items-center justify-end gap-2 pb-4 mb-4">
                                    <button
                                        onClick={() => setProductosPage(Math.max(1, productosPage - 1))}
                                        disabled={productosPage === 1}
                                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={() => setProductosPage(Math.min(productosPagination.totalPages || 1, productosPage + 1))}
                                        disabled={productosPage === (productosPagination.totalPages || 1)}
                                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        ›
                                    </button>
                                </div>
                            )}

                            {/* ✅ CATEGORÍAS JUSTO ARRIBA DEL GRID (PARA COHERENCIA) */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-blue-700 mb-3">📂 Categorías</label>
                                <div className="flex gap-2 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                    {/* N/A */}
                                    <button 
                                        onClick={() => {
                                            setCategoriaSeleccionada('N/A');
                                            fetchProductos(1, 'N/A');
                                            setProductosPage(1);
                                        }}
                                        className={`flex-none min-w-[60px] px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap shadow-md transition-all duration-300 flex items-center justify-center hover:scale-[1.02] ${
                                            categoriaSeleccionada === 'N/A'
                                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/50 ring-2 ring-emerald-400/50'
                                                : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-800 hover:shadow-emerald-100/50'
                                        }`}
                                    >
                                        N/A
                                    </button>
                                    
                                    {/* Categorías */}
                                    {categorias.map((cat) => (
                                        <button 
                                            key={cat.id}
                                            onClick={() => {
                                                setCategoriaSeleccionada(cat.codigo);
                                                fetchProductos(1, cat.codigo);
                                                setProductosPage(1);
                                            }}
                                            className={`flex-none min-w-[80px] px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap shadow-md transition-all duration-300 flex items-center justify-center hover:scale-[1.02] ${
                                                categoriaSeleccionada === cat.codigo
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/50 ring-2 ring-emerald-400/50'
                                                    : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-800 hover:shadow-emerald-100/50'
                                            }`}
                                        >
                                            {cat.codigo}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* GRID PRODUCTOS */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {productos.map(producto => {
                                        // 1. Buscamos el producto en ambos arrays
                                        const enDetalle = detalleProductos.find(p => p.id === producto.id);
                                        const enEdit = editProductos.find(p => p.id === producto.id);

                                        // 2. Cantidad: Si quieres mostrar el TOTAL acumulado
                                        const cantidadSeleccionada = Number(enDetalle?.cantidad || 0) + Number(enEdit?.cantidad || 0);
                                        const yaExiste = enEdit ? true : false;
                                        return (
                                            <button
                                                key={producto.id}
                                                onClick={() => handleAgregarProductoDetalle(producto)}
                                                disabled={yaExiste}
                                                className="group p-4 sm:p-5 border-3 border-blue-300 rounded-2xl hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-300/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-blue-50 disabled:opacity-50 disabled:cursor-not-allowed h-full flex flex-col items-start gap-2 shadow-lg hover:shadow-xl relative overflow-hidden"
                                            >
                                                {/* BADGE SELECCIONADO CON CANTIDAD */}
                                                {cantidadSeleccionada > 0 && (
                                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-20">
                                                        <span className="text-sm">✓</span>
                                                        <span>{cantidadSeleccionada}</span>
                                                    </div>
                                                )}
                                                
                                                <div className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-blue-700 leading-tight h-12 z-10 relative pr-8 sm:pr-0">
                                                    {producto.descripcion}
                                                </div>
                                                <div className="text-sm sm:text-base text-gray-600 z-10 relative pr-8 sm:pr-0">{producto.presentacion}</div>
                                                <div className="font-bold text-emerald-600 text-lg sm:text-xl w-full text-left z-10 relative pr-8 sm:pr-0">
                                                    ${formatDinero(producto.precio_venta)}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 z-10 relative pr-8 sm:pr-0">
                                                    Stock <span className="text-base font-semibold">{Math.trunc(producto.cantidad_disponible).toString()}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                            {/* PAGINACIÓN*/}
                                {productosPagination.totalPages > 1 && (
                                    <div className="flex items-center justify-end gap-2 pt-4 mb-2">
                                        <button
                                            onClick={() => setProductosPage(Math.max(1, productosPage - 1))}
                                            disabled={productosPage === 1}
                                            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            onClick={() => setProductosPage(Math.min(productosPagination.totalPages || 1, productosPage + 1))}
                                            disabled={productosPage === (productosPagination.totalPages || 1)}
                                            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                        >
                                            ›
                                        </button>
                                </div>
                            )}
                        </div>

                        {(detalleProductos.length > 0 || editProductos.length > 0) && (
                            <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                                    📋 Detalles de Productos ({detalleProductos.length + editProductos.length})
                                </h3>
                                <div className="space-y-4">
                                    {/* NUEVOS */}
                                    {editProductos.map(producto => (
                                        <div key={producto.id} className="bg-white/80 p-5 rounded-2xl border-l-4 border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center lg:gap-6">
                                            <div className="flex-1 mb-6 lg:mb-0 lg:mr-6">
                                                <p className="font-bold text-lg text-gray-900 line-clamp-2">{producto.descripcion}</p>
                                                <p className="text-base text-gray-600 mt-1">{producto.presentacion}</p>
                                                {producto.promocion_activa && (
                                                    <p className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                                                        🎉 {producto.promocion_activa.nombre_promocion}{' '}
                                                        <span className="font-normal">({formatDinero(producto.promocion_activa.nuevo_precio_venta)} c/u)</span>
                                                    </p>
                                                )}                                                  
                                    </div>
                                    {promocionesPorProductoDetalle[producto.id] && (
                                        <div className="flex flex-wrap gap-1 lg:gap-2 mb-4 lg:mb-0 lg:w-32 order-1 lg:order-none">
                                            <button
                                                type="button"
                                                onClick={() => handlePromocionChangeEdit(producto.id, null)}
                                                className={`px-3 py-2 m-1.5 md:m-0  rounded-full text-base font-medium transition-all shadow-md flex-shrink-0 ${
                                                    !producto.promocion_activa
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/50 scale-105'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-lg'
                                                }`}
                                            >
                                                💰 Individual
                                            </button>
                                            {promocionesPorProductoDetalle[producto.id].map((promo) => (
                                                <button
                                                    key={promo.id}
                                                    type="button"
                                                    onClick={() => handlePromocionChangeEdit(producto.id, promo)}
                                                    className={`px-3 py-2 m-1.5 md:m-0 rounded-full text-base font-medium transition-all shadow-md flex-shrink-0 ${
                                                        producto.promocion_activa?.id == promo.id
                                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/50 scale-105'
                                                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200 hover:shadow-lg'
                                                    }`}
                                                >
                                                    {promo.nombre_promocion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4 w-full lg:w-auto order-last lg:order-none">
                                                    <div className="flex items-center justify-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
                                                        <button
                                                            onClick={() => handleDisminuirCantidadEdit(producto.id)}
                                                            className="w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-20 p-2 border border-gray-300 rounded-xl text-center font-bold text-base bg-white shadow-sm">
                                                            {producto.cantidad || 1}
                                                        </span>
                                                        <button
                                                            onClick={() => handleAumentarCantidadEdit(producto.id)}
                                                            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all shadow-md"
                                                        >
                                                            +
                                                        </button>
                                    </div>
                                    <div className="flex items-end lg:items-center gap-3">
                                                        <span className="font-bold text-2xl text-emerald-600 min-w-[80px] text-right lg:text-left">
                                                            ${formatDinero((producto.precio_venta || producto.precioventa || 0) * (producto.cantidad || 1))}
                                                        </span>
                                                        <button
                                                            onClick={() => handleEliminarProductoEdit(producto.id)}
                                                            className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all shadow-md"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 text-emerald-700 font-medium my-2">Nuevo</p>
                                            </div>
                                        ))}

                                        {/* ORIGINALES */}
                                        {detalleProductos.map(producto => (
                                            <div key={producto.id} className="bg-white/80 p-5 rounded-2xl border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center lg:gap-6">
                                                <div className="flex-1 mb-6 lg:mb-0 lg:mr-6">
                                                    <p className="font-bold text-lg text-gray-900 line-clamp-2">{producto.descripcion}</p>
                                                    <p className="text-base text-gray-600 mt-1">{producto.presentacion}</p>
                                                    {producto.promocion_activa && (
                                                        <p className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                                                            🎉 {producto.promocion_activa.nombre_promocion}{' '}
                                                            <span className="font-normal">({formatDinero(producto.promocion_activa.nuevo_precio_venta)} c/u)</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {promocionesPorProductoDetalle[String(producto.producto_id)] && (
                                                    <div className="flex flex-wrap gap-1 lg:gap-2 mb-4 lg:mb-0 lg:w-32 order-1 lg:order-none">
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePromocionChangeDetalle(String(producto.id), null)}
                                                            className={`px-3 py-2 m-1.5 md:m-0 rounded-full text-base font-medium transition-all shadow-md flex-shrink-0 ${
                                                                !producto.promocion_activa 
                                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/50 scale-105'
                                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-lg'
                                                            }`}
                                                        >
                                                            💰 Individual
                                                        </button>
                                                        {promocionesPorProductoDetalle[String(producto.producto_id)].map((promo) => (
                                                            <button
                                                                key={promo.id}
                                                                type="button"
                                                                onClick={() => handlePromocionChangeDetalle(String(producto.id), promo)}
                                                                className={`px-3 py-2 m-1.5 md:m-0  rounded-full text-base font-medium transition-all shadow-md flex-shrink-0 ${
                                                                    producto.promocion_activa?.id == promo.id
                                                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/50 scale-105'
                                                                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200 hover:shadow-lg'
                                                                }`}
                                                            >
                                                                {promo.nombre_promocion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4 w-full lg:w-auto order-last lg:order-none">
                                                    <div className="flex items-center justify-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
                                                        <button
                                                            onClick={() => handleDisminuirCantidadDetalle(producto.id)}
                                                            className="w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-20 p-2 border border-gray-300 rounded-xl text-center font-bold text-base bg-white shadow-sm">
                                                            {producto.cantidad || 1}
                                                        </span>
                                                        <button
                                                            onClick={() => handleAumentarCantidadDetalle(producto.id)}
                                                            className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all shadow-md"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="flex items-end lg:items-center gap-3">
                                                        <span className="font-bold text-2xl text-emerald-600 min-w-[80px] text-right lg:text-left">
                                                            ${formatDinero((producto.precio_venta || 0) * (producto.cantidad || 1))}
                                                        </span>
                                                        <button
                                                            onClick={() => handleEliminarProductoDetalle(producto.id)}
                                                            className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all shadow-md"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 my-2">Original</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    {/* BOTONES */}
                    <div className="p-4 sm:p-8 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
                            <button
                                onClick={handleCerrarDetalle}
                                className="flex-1 sm:flex-none w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGuardarDetalle}
                                disabled={!editForm.cliente || creatingCuentaDetalle}
                                className="flex-1 sm:flex-none w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:shadow-none text-sm sm:text-base"
                            >
                                {creatingCuentaDetalle ? (
                                    <>
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
        )}
        <CorteCajaModal 
                isOpen={showCorteModal} 
                onClose={() => setShowCorteModal(false)}
            />
        </>
    );
};

export default Cuentas;