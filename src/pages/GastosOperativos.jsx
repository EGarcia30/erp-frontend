import React, { useState, useEffect, useCallback } from 'react';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const GastosOperativos = () => {
    // Estados principales
    const [gastos, setGastos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Usuario actual
    const [currentUser, setCurrentUser] = useState(null);
    
    // Modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingGasto, setEditingGasto] = useState(null);
    const [deletingGasto, setDeletingGasto] = useState(null);
    
    // Modal nuevo/editar gasto
    const [createForm, setCreateForm] = useState({
        descripcion: 'Consumo personal',
        tipo_gasto: 'consumo_personal'
    });
    const [selectedProductos, setSelectedProductos] = useState([]);
    const [creatingGasto, setCreatingGasto] = useState(false);
    const [editingGastoLoading, setEditingGastoLoading] = useState(false);

    const [productosPage, setProductosPage] = useState(1);
    const [productosPagination, setProductosPagination] = useState({ totalPages: 1 });
    const [gastosPage, setGastosPage] = useState(1);
    const [gastosPagination, setGastosPagination] = useState({ totalPages: 1 });
    const [updatingGasto, setUpdatingGasto] = useState(null);

    //categorias productos
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('N/A');

    //FETCH PRINCIPALES (gastos, categorías, productos)

     // FETCH FUNCTIONS
    const fetchGastos = useCallback(async (currentPage = 1) => {
        try {
            setLoading(true);
            let url = `${apiURL}/gastos-operativos?page=${currentPage}&limit=12`;
            if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setGastos(data.data);
                setGastosPagination(data.pagination || { 
                    totalPages: Math.ceil((data.total || 12) / 12) 
                });
            }
        } catch (error) {
            console.error('Error cargando gastos:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    // Fetch productos con paginación
    const fetchProductos = useCallback(async (currentPage = 1, categoria = 'N/A') => {
        try {
            const params = new URLSearchParams({ page: currentPage, limit: 10, categoria });
            const response = await fetch(`${apiURL}/productos?${params}`);
            const data = await response.json();
            if (data.success) {
                setProductos(data.data);
                setProductosPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    }, []);

    // ✅ Cargar categorías al abrir modal
    const fetchCategorias = useCallback(async () => {
        try {
            const response = await fetch(`${apiURL}/categorias`);
            const data = await response.json();
            if (data.success) setCategorias(data.data);
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    }, []);

    //USEEFFECTS PRINCIPALES
    
    //useEffect principal para gastos
    useEffect(() => {
        fetchGastos(gastosPage);
    }, [gastosPage, fetchGastos]);

    //UN SOLO useEffect para TODO el modal (evita cadenas)
    useEffect(() => {
    if (showCreateModal || showEditModal) {
        fetchCategorias();
        fetchProductos(1, 'N/A'); // Reset a N/A y página 1
        setCategoriaSeleccionada('N/A');
        setProductosPage(1);
    }
    }, [showCreateModal, showEditModal, fetchProductos, fetchCategorias]);

    useEffect(() => {
        fetchProductos(productosPage, categoriaSeleccionada);
    }, [productosPage, categoriaSeleccionada, fetchProductos]);

    //useEffect para cargar usuario actual (solo al montar)
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
        try {
            setCurrentUser(JSON.parse(userData));
        } catch (error) {}
        }
    }, []);

    //HANDLERS PRINCIPALES

    // Crear gasto
    const handleCrearGasto = async (e) => {
        e.preventDefault();
        if (!createForm.descripcion || selectedProductos.length === 0 || !currentUser) {
        alert('Complete descripción y seleccione productos');
        return;
        }

        try {
        setCreatingGasto(true);
        const response = await fetch(`${apiURL}/gastos-operativos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            ...createForm,
            usuario_id: currentUser.id,
            total: calcularTotal(),
            detalles: selectedProductos.map(p => ({
                producto_id: p.id,
                cantidad_consumida: p.cantidad,
                precio_unitario: p.precio_compra,
                valor_total: p.precio_compra * p.cantidad
            }))
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            setShowCreateModal(false);
            resetForm();
            fetchGastos(gastosPage);
        } else {
            alert('Error: ' + (data.message || 'Inténtalo de nuevo'));
        }
        } catch (error) {
        alert('Error de conexión');
        } finally {
        setCreatingGasto(false);
        }
    };

    const handleEditarGasto = async (e) => {
        e.preventDefault();
        if (!createForm.descripcion || selectedProductos.length === 0) {
            alert('Complete todos los campos');
            return;
        }

        try {
            setEditingGastoLoading(true);
            const response = await fetch(`${apiURL}/gastos-operativos/${editingGasto.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    descripcion: createForm.descripcion,
                    tipo_gasto: createForm.tipo_gasto,
                    total: calcularTotal(),
                    detalles: selectedProductos.map(p => ({
                        producto_id: p.id,
                        cantidad_consumida: p.cantidad,
                        precio_unitario: p.precio_compra,
                        valor_total: p.precio_compra * p.cantidad
                    }))
                })
            });

            const data = await response.json();
            if (data.success) {  // ✅ Solo data.success (no response.ok)
                setShowEditModal(false);
                resetForm();
                fetchGastos(gastosPage);  // ✅ gastosPage no page
            } else {
                alert('Error: ' + (data.message || 'Inténtalo de nuevo'));
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setEditingGastoLoading(false);
        }
    };

    const handleEliminarGasto = async () => {
        try {
        const response = await fetch(`${apiURL}/gastos-operativos/${deletingGasto.id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
            setShowDeleteModal(false);
            setDeletingGasto(null);
            fetchGastos(gastosPage);
        } else {
            alert('Error: ' + (data.message || 'No se pudo eliminar'));
        }
        } catch (error) {
            alert('Error de conexión');
        }
    };

    const handleAprobarGasto = async (gastoId) => {
        try {
            setUpdatingGasto(gastoId);
            const response = await fetch(`${apiURL}/gastos-operativos/${gastoId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'aprobado' })
            });
            
            const data = await response.json();
            if (data.success) {
            // Actualizar lista local
            setGastos(prev => prev.map(g => 
                g.id === gastoId ? { ...g, estado: 'aprobado', fecha_modificado: data.data.fecha_modificado } : g
            ));
            } else {
            alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setUpdatingGasto(null);
        }
    };

    const handleRechazarGasto = async (gastoId) => {
        try {
            setUpdatingGasto(gastoId);
            const response = await fetch(`${apiURL}/gastos-operativos/${gastoId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'rechazado' })
            });
            
            const data = await response.json();
            if (data.success) {
            setGastos(prev => prev.map(g => 
                g.id === gastoId ? { ...g, estado: 'rechazado', fecha_modificado: data.data.fecha_modificado } : g
            ));
            } else {
            alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setUpdatingGasto(null);
        }
    };

    // Handlers productos
    const handleAgregarProducto = (producto) => {
        const existe = selectedProductos.find(p => p.id === producto.id);
        if (existe) {
        setSelectedProductos(selectedProductos.map(p =>
            p.id === producto.id ? { ...p, cantidad: (p.cantidad || 0) + 1 } : p
        ));
        } else {
        setSelectedProductos([...selectedProductos, { 
            ...producto, 
            cantidad: 1 
        }]);
        }
    };

    const handleBorrarProducto = (productoId) => {
        setSelectedProductos(prev => prev.filter(p => p.id !== productoId));
    };

    const handleAumentarCantidad = (productoId) => {
        setSelectedProductos(prev => 
        prev.map(p => p.id === productoId 
            ? { ...p, cantidad: (p.cantidad || 1) + 1 } 
            : p
        )
        );
    };

    const handleDisminuirCantidad = (productoId) => {
        setSelectedProductos(prev => {
        const nuevo = prev.map(p => {
            if (p.id === productoId) {
            const nuevaCant = (p.cantidad || 1) - 1;
            return nuevaCant > 0 ? { ...p, cantidad: nuevaCant } : null;
            }
            return p;
        }).filter(Boolean);
        return nuevo;
        });
    };

    //Handlers modales

    // 3. ✅ Abrir modal optimizado
    const handleAbrirCrearModal = useCallback(() => {
        setShowCreateModal(true);
        setCategoriaSeleccionada('NA');
        setProductosPage(1);
        resetForm();
    }, []);

    const handleAbrirEditar = async (gasto) => {
        try {
            setEditingGasto(gasto);
            setShowEditModal(true);
            
            // Cargar detalles del gasto
            const response = await fetch(`${apiURL}/gastos-operativos/${gasto.id}`);
            const data = await response.json();
            
            if (data.success) {
                // ✅ FORMULARIO
                setCreateForm({
                    descripcion: data.data.descripcion,  // ← del API
                    tipo_gasto: data.data.tipo_gasto     // ← del API
                });
            
                // ✅ PRODUCTOS - MAPEAR JSON CORRECTAMENTE
                const detalles = data.data.detalles || [];
                setSelectedProductos(detalles.map(d => ({
                    id: d.producto_id,
                    descripcion: d.descripcion || gasto.descripcion, // fallback
                    presentacion: 'Unidad' || d.presentacion, // o del gasto original
                    precio_compra: d.precio_unitario,
                    cantidad_disponible: 0, // no editable
                    cantidad: d.cantidad_consumida,
                    valor_total: d.valor_total
                })));
            
                // Reset paginación
                setCategoriaSeleccionada('N/A');
                setProductosPage(1);
            }
        } catch (error) {
            console.error('Error cargando gasto:', error);
            alert('Error de conexión');
        }
    };

    // Eliminar gasto
    const handleAbrirEliminar = (gasto) => {
        setDeletingGasto(gasto);
        setShowDeleteModal(true);
    };

    // ✅ Handler categorías (SOLO cambia estado)
    const handleCategoriaChange = useCallback((codigo) => {
        setCategoriaSeleccionada(codigo);
        setProductosPage(1);
    }, []);

    // ✅ Paginación productos
    const handlePageChange = useCallback((page) => {
        setProductosPage(page);
        fetchProductos(page, categoriaSeleccionada);
    }, [fetchProductos, categoriaSeleccionada]);

    // Reset form
    const resetForm = () => {
        setCreateForm({ descripcion: 'Consumo personal', tipo_gasto: 'consumo_personal' });
        setSelectedProductos([]);
    };

    //UTILS PRINCIPALES
    const formatDinero = (numero) => {
        return Number(numero ?? 0).toLocaleString('es-SV', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
        });
    };

    const calcularTotal = () => {
        return selectedProductos.reduce((total, p) => {
        const precio = p.precio_compra || 0;
        return total + (precio * (p.cantidad || 1));
        }, 0);
    };

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

    if (loading && gastos.length === 0) {
        return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700">Cargando gastos...</p>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    💸 Gastos Operativos
                    </h1>
                    <p className="text-xl text-gray-600">Gestión completa de gastos operativos</p>
                </div>
                <button
                    onClick={handleAbrirCrearModal}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 text-lg"
                >
                    ➕ Nuevo Gasto
                </button>
            </div>

            {/* PAGINACIÓN GASTOS SUPERIOR - CORREGIDA */}
            {gastosPagination.totalPages > 1 && (
                <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-md lg:shadow-lg mb-8 lg:mb-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                    
                    {/* BOTÓN ANTERIOR */}
                    <button 
                    className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                    onClick={() => setGastosPage(Math.max(1, gastosPage - 1))}
                    disabled={gastosPage <= 1}
                    >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    </button>

                    {/* NÚMEROS PÁGINAS */}
                    <div className="hidden sm:flex gap-1 lg:gap-2 justify-center min-w-[120px] lg:min-w-[160px]">
                    {Array.from({ length: Math.min(5, gastosPagination.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, gastosPage - 2);
                        const pageNum = Math.min(startPage + i, gastosPagination.totalPages);
                        return (
                        <button
                            key={pageNum}
                            className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-sm lg:shadow-md flex items-center justify-center text-sm lg:text-base flex-shrink-0 ${
                            pageNum === gastosPage 
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
                                : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200'
                            }`}
                            onClick={() => setGastosPage(pageNum)}
                        >
                            {pageNum}
                        </button>
                        );
                    })}
                    </div>

                    {/* BOTÓN SIGUIENTE */}
                    <button 
                    className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                    onClick={() => setGastosPage(Math.min(gastosPagination.totalPages, gastosPage + 1))}
                    disabled={gastosPage >= gastosPagination.totalPages}
                    >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    </button>

                    {/* INDICADOR ACTUAL */}
                    <div className="hidden sm:block text-gray-700 font-semibold bg-gray-100 px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl border border-gray-200 text-sm lg:text-base whitespace-nowrap flex-shrink-0">
                    Pg. <span className="text-emerald-600 font-bold">{gastosPage}</span> de <span className="text-teal-600 font-bold">{gastosPagination.totalPages}</span>
                    </div>
                </div>
            )}

            {/* GRID GASTOS - DISEÑO ARMONIOSO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gastos.map(gasto => (
                    <div key={gasto.id} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 h-full">
                    
                    {/* HEADER - ID + ESTADO */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">Gasto #{gasto.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${
                        gasto.estado === 'aprobado' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : gasto.estado === 'rechazado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                        {gasto.estado === 'aprobado' ? '✅ Aprobado' : 
                        gasto.estado === 'rechazado' ? '❌ Rechazado' : '⏳ Pendiente'}
                        </span>
                    </div>
                    
                    {/* INFO - MÁS ESPACIO */}
                    <div className="space-y-3 mb-8 flex-1">
                        <p className="text-lg text-gray-600 font-medium">Descripción: 
                        <span className="block text-xl font-bold text-gray-900 mt-1">{gasto.descripcion}</span>
                        </p>
                        <p className="text-lg text-gray-600 font-medium flex items-center gap-2">
                        <span className="text-emerald-600">📋</span>
                        <span className="font-bold text-gray-900">{gasto.tipo_gasto?.replace('_', ' ').toUpperCase()}</span>
                        </p>
                        <div className="flex items-start">
                            <span className="text-sm font-bold text-gray-600">{formatFechaUTCWithTime(gasto.fecha_creado)}</span>
                        </div>
                    </div>

                    {/* TOTAL - DESTACADO */}
                    <div className="text-2xl lg:text-3xl font-black text-emerald-600 mb-6 bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl shadow-lg">
                        -${formatDinero(gasto.total)}
                    </div>

                    {/* BOTONES - ICONOS + TEXTO XS */}
                    <div className="space-y-2">
                    {/* PENDIENTE: 3 botones compactos */}
                    {gasto.estado === 'pendiente' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                            onClick={() => handleAprobarGasto(gasto.id)}
                            disabled={updatingGasto === gasto.id}
                            className="h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                        >
                            {updatingGasto === gasto.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            ) : (
                            <>
                                ✅ Aprobar
                            </>
                            )}
                        </button>
                        <button
                            onClick={() => handleRechazarGasto(gasto.id)}
                            disabled={updatingGasto === gasto.id}
                            className="h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                        >
                            {updatingGasto === gasto.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            ) : (
                            <>
                                ❌ Rechazar
                            </>
                            )}
                        </button>
                        <button
                            onClick={() => handleAbrirEditar(gasto)}
                            className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-1 text-xs"
                        >
                            👁️ Detalle
                        </button>
                        </div>
                    )}

                    {/* APROBADO/RECHAZADO: Botón grande */}
                    {gasto.estado !== 'pendiente' && (
                        <button 
                        onClick={() => handleAbrirEditar(gasto)}
                        className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                        >
                        👁️ Ver Detalle
                        </button>
                    )}
                    </div>
                    </div>
                ))}
            </div>

            {/* PAGINACIÓN GASTOS INFERIOR - EXACTA IGUAL SUPERIOR */}
            {gastosPagination.totalPages > 1 && (
                <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-md lg:shadow-lg mb-8 lg:mb-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                    {/* MISMO CÓDIGO QUE SUPERIOR */}
                    <button 
                    className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                    onClick={() => setGastosPage(Math.max(1, gastosPage - 1))}
                    disabled={gastosPage <= 1}
                    >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    </button>

                    <div className="hidden sm:flex gap-1 lg:gap-2 justify-center min-w-[120px] lg:min-w-[160px]">
                    {Array.from({ length: Math.min(5, gastosPagination.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, gastosPage - 2);
                        const pageNum = Math.min(startPage + i, gastosPagination.totalPages);
                        return (
                        <button
                            key={pageNum}
                            className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-sm lg:shadow-md flex items-center justify-center text-sm lg:text-base flex-shrink-0 ${
                            pageNum === gastosPage 
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
                                : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200'
                            }`}
                            onClick={() => setGastosPage(pageNum)}
                        >
                            {pageNum}
                        </button>
                        );
                    })}
                    </div>

                    <button 
                    className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md lg:shadow-lg text-xs lg:text-sm flex-shrink-0"
                    onClick={() => setGastosPage(Math.min(gastosPagination.totalPages, gastosPage + 1))}
                    disabled={gastosPage >= gastosPagination.totalPages}
                    >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    </button>

                    <div className="hidden sm:block text-gray-700 font-semibold bg-gray-100 px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl border border-gray-200 text-sm lg:text-base whitespace-nowrap flex-shrink-0">
                    Pg. <span className="text-emerald-600 font-bold">{gastosPage}</span> de <span className="text-teal-600 font-bold">{gastosPagination.totalPages}</span>
                    </div>
                </div>
            )}

            {gastos.length === 0 && !loading && (
                <div className="text-center py-20">
                <div className="text-6xl mb-4">💸</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay gastos operativos</h2>
                <p className="text-gray-600 mb-6">Crea el primer gasto operativo para empezar</p>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                    ➕ Nuevo Gasto Operativo
                </button>
                </div>
            )}
        </div>

        {/* MODAL CREAR/EDITAR - PANTALLA COMPLETA + SCROLL ÚNICO */}
        {(showCreateModal || showEditModal) && (
        <>
            <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999]" 
            onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
            }}
            />
            <div className="fixed inset-0 z-[1000] p-2 sm:p-4 flex items-center justify-center">
            <div className="w-full max-w-[95vw] lg:max-w-6xl h-[95vh] lg:h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
                
                {/* HEADER FIJO */}
                <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {showEditModal ? '✏️ Editar Gasto' : '💸 Nuevo Gasto Operativo'}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600">
                        Total: <span className="text-xl sm:text-2xl font-black text-emerald-600">-${formatDinero(calcularTotal())}</span>
                        {selectedProductos.length > 0 && (
                        <span className="ml-3 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
                            {selectedProductos.length} producto{selectedProductos.length !== 1 ? 's' : ''}
                        </span>
                        )}
                    </p>
                    </div>
                    <button 
                    onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        resetForm();
                    }}
                    className="p-2 sm:p-3 rounded-2xl hover:bg-emerald-200 hover:scale-110 transition-all duration-200 group"
                    >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>

                {/* FORM CABECERA - BOTONES MÁS CHICOS IGUAL CUENTAS */}
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-end pb-2">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Descripción *</label>
                    <textarea
                    className="w-full p-3 sm:p-4 text-base border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all resize-vertical min-h-[60px] sm:min-h-[80px]"
                    value={createForm.descripcion}
                    onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                    required
                    placeholder="Ej: Consumo personal cajero turno noche, Limpieza suministros, etc."
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">💳 Tipo de Gasto</label>
                    <div className="grid grid-cols-2 gap-3">
                    {[
                        { key: 'consumo_personal', label: 'Consumo Personal', icon: '👤' },
                        { key: 'limpieza', label: 'Limpieza', icon: '🧹' },
                        { key: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' },
                        { key: 'suministros', label: 'Suministros', icon: '📦' }
                    ].map(tipo => (
                        <button
                        key={tipo.key}
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, tipo_gasto: tipo.key })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                            createForm.tipo_gasto === tipo.key
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-emerald-300'
                        }`}
                        >
                        <span className="text-lg leading-none">{tipo.icon}</span>
                        <span className="font-medium text-xs">{tipo.label}</span>
                        </button>
                    ))}
                    </div>
                </div>
                </form>
                </div>

                {/* CONTENIDO PRINCIPAL - SCROLL ÚNICO */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                
                <div className="p-6 sm:p-8 border-b-4 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    {/* TÍTULO MÁS PEQUEÑO EN MÓVIL */}
                    <h3 className="text-base sm:text-2xl font-bold flex items-center gap-2 text-emerald-800">
                    🛍️ Lista de Productos
                    <span className="text-sm sm:text-lg bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-semibold">
                        {selectedProductos.length} seleccionado{selectedProductos.length !== 1 ? 's' : ''}
                    </span>
                    </h3>
                </div>

                {/* PAGINACIÓN SUPERIOR */}
                <div className="mb-6 space-y-3">
                    {productosPagination.totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2 pb-4 mb-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, productosPage - 1))}
                            disabled={productosPage === 1}
                            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => handlePageChange(Math.min(productosPagination.totalPages || 1, productosPage + 1))}
                            disabled={productosPage === (productosPagination.totalPages || 1)}
                            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            ›
                        </button>
                        </div>
                    )}
                    {/* CATEGORÍAS - Scroll horizontal NATURAL */}
                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                            {/* N/A */}
                            <button 
                                onClick={() => handleCategoriaChange('N/A')}
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
                                        onClick={() => handleCategoriaChange(cat.codigo)}
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {productos.map(producto => {
                    // Calcular cantidad seleccionada de este producto
                    const cantidadSeleccionada = selectedProductos.filter(p => p.id === producto.id)
                        .reduce((total, p) => total + (p.cantidad || 1), 0);
                    
                    return (
                        <button
                        key={producto.id}
                        onClick={() => handleAgregarProducto(producto)}
                        disabled={producto.cantidad_disponible === 0}
                        className="group p-4 sm:p-5 border-3 border-emerald-300 rounded-2xl hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-300/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed h-full flex flex-col items-start gap-2 shadow-lg hover:shadow-xl relative overflow-hidden"
                        >
                        {/* BADGE SELECCIONADO CON CANTIDAD */}
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
                            ${formatDinero(producto.precio_compra)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 z-10 relative pr-8 sm:pr-0">
                            📦 <span className="font-semibold">{Math.trunc(producto.cantidad_disponible).toString()}</span>
                        </div>
                        </button>
                    );
                    })}
                </div>

                {/* PAGINACIÓN INFERIOR */}
                {productosPagination.totalPages > 1 && (
                    <div className="flex items-center justify-end gap-2 pt-4 mb-2">
                    <button
                        onClick={() => handlePageChange(Math.max(1, productosPage - 1))}
                        disabled={productosPage === 1}
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => handlePageChange(Math.min(productosPagination.totalPages || 1, productosPage + 1))}
                        disabled={productosPage === (productosPagination.totalPages || 1)}
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        ›
                    </button>
                    </div>
                )}
                </div>

                {/* DETALLE DE GASTOS */}
                {selectedProductos.length > 0 && (
                <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                    📋 Detalle de Gastos ({selectedProductos.length})
                    </h3>
                    <div className="space-y-4">
                    {selectedProductos.map(producto => (
                        <div key={producto.id} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center lg:gap-6">
                        
                        {/* COLUMNA IZQUIERDA - Descripción */}
                        <div className="flex-1 mb-6 lg:mb-0 lg:mr-6">
                            <p className="font-bold text-lg text-gray-900 line-clamp-2">{producto.descripcion}</p>
                            <p className="text-base text-gray-600 mt-1">{producto.presentacion}</p>
                        </div>

                        {/* CONTROLES */}
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4 w-full lg:w-auto order-last lg:order-none">
                            <div className="flex items-center justify-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
                            <button
                                onClick={() => handleDisminuirCantidad(producto.id)}
                                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all"
                            >
                                -
                            </button>
                            <span className="w-20 p-2 border border-gray-300 rounded-xl text-center font-bold text-base bg-white shadow-sm">
                                {producto.cantidad}
                            </span>
                            <button
                                onClick={() => handleAumentarCantidad(producto.id)}
                                className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold hover:scale-110 transition-all shadow-md"
                            >
                                +
                            </button>
                            </div>
                            
                            <div className="flex items-end lg:items-center gap-3">
                            <span className="font-bold text-2xl text-emerald-600 min-w-[80px] text-right lg:text-left">
                                -${formatDinero(producto.precio_compra * producto.cantidad)}
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
                <div className="p-4 sm:p-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
                <button
                    type="button"
                    onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        resetForm();
                    }}
                    className="flex-1 sm:flex-none w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                >
                    Cancelar
                </button>
                <button
                onClick={showEditModal ? handleEditarGasto : handleCrearGasto}
                disabled={
                    !createForm.descripcion || 
                    selectedProductos.length === 0 || 
                    creatingGasto || 
                    editingGastoLoading ||
                    (showEditModal && editingGasto?.estado !== 'pendiente')  // ✅ NUEVA CONDICIÓN
                }
                className="flex-1 sm:flex-none w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:shadow-none text-sm sm:text-base"
                >
                {creatingGasto || editingGastoLoading ? (
                    <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Guardando...
                    </>
                ) : (
                    <>
                    {showEditModal ? (
                        <>
                        ✏️ {selectedProductos.length} producto{selectedProductos.length !== 1 ? 's' : ''}
                        </>
                    ) : (
                        <>
                        💸 Registrar Gasto 
                        <span className="text-base sm:text-lg font-bold">{selectedProductos.length}</span>
                        </>
                    )}
                    </>
                )}
                </button>
                </div>
            </div>
            </div>
        </>
        )}

        {/* MODAL ELIMINAR - TAMAÑO VISTA */}
        {showDeleteModal && (
            <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]" onClick={() => setShowDeleteModal(false)} />
            <div className="fixed inset-0 z-[1000] p-4 flex items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-300">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Eliminar Gasto</h3>
                    <p className="text-lg text-gray-600 mb-4">
                    ¿Estás seguro de eliminar el gasto <br />
                    <span className="font-bold text-emerald-600">#{deletingGasto?.id}</span>?
                    </p>
                    <div className="text-3xl font-black text-red-600 mb-2">-${formatDinero(deletingGasto?.total)}</div>
                    <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                </div>
                
                <div className="flex gap-4 pt-4">
                    <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all"
                    >
                    Cancelar
                    </button>
                    <button
                    onClick={handleEliminarGasto}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                    >
                    🗑️ Eliminar
                    </button>
                </div>
                </div>
            </div>
            </>
        )}
        </div>
    );
};

export default GastosOperativos;
