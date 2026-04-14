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

    // GastosOperativos.jsx — fragmento return (reemplaza desde el loading hasta el final)
// El resto del componente (estados, handlers, fetches) permanece igual.

    if (loading && gastos.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
                <p className="text-sm" style={{ color: '#888' }}>Cargando gastos...</p>
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
                        <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Gastos Operativos</h1>
                        <p className="text-sm" style={{ color: '#888' }}>Gestión de gastos del negocio</p>
                    </div>
                    <button onClick={handleAbrirCrearModal}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                        + Nuevo Gasto
                    </button>
                </div>

                {/* PAGINACIÓN SUPERIOR */}
                {gastosPagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setGastosPage(Math.max(1, gastosPage - 1))} disabled={gastosPage <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                        {Array.from({ length: Math.min(5, gastosPagination.totalPages) }, (_, i) => {
                            const pageNum = Math.min(Math.max(1, gastosPage - 2) + i, gastosPagination.totalPages);
                            return (
                                <button key={pageNum} onClick={() => setGastosPage(pageNum)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                                    style={pageNum === gastosPage ? { background: '#222', color: '#fff' } : { background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button onClick={() => setGastosPage(Math.min(gastosPagination.totalPages, gastosPage + 1))} disabled={gastosPage >= gastosPagination.totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                        <span className="text-xs ml-1" style={{ color: '#aaa' }}>Pág. {gastosPage} de {gastosPagination.totalPages}</span>
                    </div>
                )}

                {/* GRID GASTOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {gastos.map(gasto => (
                        <div key={gasto.id} className="rounded-2xl p-5 transition-all duration-200"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

                            {/* Cabecera */}
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium" style={{ color: '#111' }}>Gasto #{gasto.id}</p>
                                <span className="text-xs px-2 py-0.5 rounded-md"
                                    style={gasto.estado === 'aprobado'
                                        ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                        : gasto.estado === 'rechazado'
                                        ? { background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }
                                        : { background: '#fdfaf4', color: '#7a6a2a', border: '0.5px solid #e6d8a0' }}>
                                    {gasto.estado === 'aprobado' ? 'Aprobado' : gasto.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 mb-4">
                                <p className="text-sm font-medium line-clamp-2" style={{ color: '#333' }}>{gasto.descripcion}</p>
                                <p className="text-xs" style={{ color: '#aaa' }}>{gasto.tipo_gasto?.replace('_', ' ').toUpperCase()}</p>
                                <p className="text-xs" style={{ color: '#bbb' }}>{formatFechaUTCWithTime(gasto.fecha_creado)}</p>
                            </div>

                            {/* Total */}
                            <p className="text-2xl font-medium mb-4" style={{ color: '#a03030' }}>-${formatDinero(gasto.total)}</p>

                            {/* Botones */}
                            <div className="flex gap-2">
                                {gasto.estado === 'pendiente' && (
                                    <>
                                    <button onClick={() => handleAprobarGasto(gasto.id)} disabled={updatingGasto === gasto.id}
                                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                                        style={{ background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }}>
                                        Aprobar
                                    </button>
                                    <button onClick={() => handleRechazarGasto(gasto.id)} disabled={updatingGasto === gasto.id}
                                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                                        style={{ background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>
                                        Rechazar
                                    </button>
                                    </>
                                )}
                                <button onClick={() => handleAbrirEditar(gasto)}
                                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                                    style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                    Detalle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PAGINACIÓN INFERIOR */}
                {gastosPagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setGastosPage(Math.max(1, gastosPage - 1))} disabled={gastosPage <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                        {Array.from({ length: Math.min(5, gastosPagination.totalPages) }, (_, i) => {
                            const pageNum = Math.min(Math.max(1, gastosPage - 2) + i, gastosPagination.totalPages);
                            return (
                                <button key={pageNum} onClick={() => setGastosPage(pageNum)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                                    style={pageNum === gastosPage ? { background: '#222', color: '#fff' } : { background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button onClick={() => setGastosPage(Math.min(gastosPagination.totalPages, gastosPage + 1))} disabled={gastosPage >= gastosPagination.totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                    </div>
                )}

                {/* VACÍO */}
                {gastos.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <p className="text-sm mb-4" style={{ color: '#aaa' }}>No hay gastos operativos registrados</p>
                        <button onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium"
                            style={{ background: '#222', color: '#fff' }}>
                            + Nuevo Gasto Operativo
                        </button>
                    </div>
                )}
            </div>

            {/* ── MODAL CREAR / EDITAR ─────────────────────────────── */}
            {(showCreateModal || showEditModal) && (
                <>
                <div className="fixed inset-0 z-[999]" style={{ background: 'rgba(0,0,0,0.4)' }}
                    onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }} />
                <div className="fixed inset-0 z-[1000] p-4 flex items-center justify-center">
                    <div className="w-full max-w-5xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden"
                        style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                        {/* Header fijo */}
                        <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-base font-medium" style={{ color: '#111' }}>
                                        {showEditModal ? 'Editar Gasto' : 'Nuevo Gasto Operativo'}
                                    </h2>
                                    <p className="text-xs" style={{ color: '#aaa' }}>
                                        Total: <span className="font-medium" style={{ color: '#a03030' }}>-${formatDinero(calcularTotal())}</span>
                                        {selectedProductos.length > 0 && ` · ${selectedProductos.length} productos`}
                                    </p>
                                </div>
                                <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                    <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Campos cabecera */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>DESCRIPCIÓN *</label>
                                    <textarea rows="2" value={createForm.descripcion} required
                                        onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                                        placeholder="Ej: Consumo personal cajero turno noche..."
                                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                                        style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }} />
                                </div>
                                <div>
                                    <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>TIPO DE GASTO</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { key: 'consumo_personal', label: 'Consumo Personal' },
                                            { key: 'limpieza',         label: 'Limpieza' },
                                            { key: 'mantenimiento',    label: 'Mantenimiento' },
                                            { key: 'suministros',      label: 'Suministros' },
                                        ].map(tipo => (
                                            <button key={tipo.key} type="button" onClick={() => setCreateForm({ ...createForm, tipo_gasto: tipo.key })}
                                                className="py-2 rounded-lg text-xs font-medium transition-all"
                                                style={createForm.tipo_gasto === tipo.key
                                                    ? { background: '#222', color: '#fff', border: '0.5px solid #222' }
                                                    : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                                {tipo.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contenido scrollable */}
                        <div className="flex-1 overflow-y-auto min-h-0">

                            {/* Grid productos */}
                            <div className="p-6" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                                <p className="text-sm font-medium mb-4" style={{ color: '#111' }}>
                                    Productos
                                    {selectedProductos.length > 0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f0ea', color: '#666' }}>{selectedProductos.length} seleccionados</span>}
                                </p>

                                {/* Paginación productos superior */}
                                {productosPagination.totalPages > 1 && (
                                    <div className="flex gap-2 mb-4">
                                        <button onClick={() => handlePageChange(Math.max(1, productosPage - 1))} disabled={productosPage === 1}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                            style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                                        <button onClick={() => handlePageChange(Math.min(productosPagination.totalPages, productosPage + 1))} disabled={productosPage === productosPagination.totalPages}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                            style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                                    </div>
                                )}

                                {/* Categorías */}
                                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                    <button onClick={() => handleCategoriaChange('N/A')}
                                        className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                                        style={categoriaSeleccionada === 'N/A' ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                        Todos
                                    </button>
                                    {categorias.map((cat) => (
                                        <button key={cat.id} onClick={() => handleCategoriaChange(cat.codigo)}
                                            className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                                            style={categoriaSeleccionada === cat.codigo ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                            {cat.codigo}
                                        </button>
                                    ))}
                                </div>

                                {/* Grid */}
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
                                                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{cantidadSeleccionada}</span>
                                                )}
                                                <p className="text-xs font-medium mb-1 line-clamp-2 pr-6" style={{ color: cantidadSeleccionada > 0 ? '#fff' : '#222' }}>{producto.descripcion}</p>
                                                <p className="text-xs mb-1" style={{ color: cantidadSeleccionada > 0 ? 'rgba(255,255,255,0.6)' : '#aaa' }}>{producto.presentacion}</p>
                                                <p className="text-sm font-medium" style={{ color: cantidadSeleccionada > 0 ? '#fff' : '#111' }}>${formatDinero(producto.precio_compra)}</p>
                                                <p className="text-xs mt-1" style={{ color: cantidadSeleccionada > 0 ? 'rgba(255,255,255,0.5)' : '#ccc' }}>Stock {Math.trunc(producto.cantidad_disponible)}</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Paginación inferior */}
                                {productosPagination.totalPages > 1 && (
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => handlePageChange(Math.max(1, productosPage - 1))} disabled={productosPage === 1}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                            style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                                        <button onClick={() => handlePageChange(Math.min(productosPagination.totalPages, productosPage + 1))} disabled={productosPage === productosPagination.totalPages}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                            style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                                    </div>
                                )}
                            </div>

                            {/* Detalle productos seleccionados */}
                            {selectedProductos.length > 0 && (
                                <div className="p-6" style={{ background: '#fafafa' }}>
                                    <p className="text-sm font-medium mb-4" style={{ color: '#111' }}>Detalle ({selectedProductos.length})</p>
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
                                                        <button onClick={() => handleDisminuirCantidad(producto.id)}
                                                            className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
                                                            style={{ background: '#fff', color: '#555' }}>-</button>
                                                        <span className="w-10 text-center text-sm font-medium" style={{ color: '#222' }}>{producto.cantidad}</span>
                                                        <button onClick={() => handleAumentarCantidad(producto.id)}
                                                            className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
                                                            style={{ background: '#222', color: '#fff' }}>+</button>
                                                    </div>
                                                    <span className="text-sm font-medium min-w-[70px] text-right" style={{ color: '#a03030' }}>
                                                        -${formatDinero(producto.precio_compra * producto.cantidad)}
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
                            <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium"
                                style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                Cancelar
                            </button>
                            <button onClick={showEditModal ? handleEditarGasto : handleCrearGasto}
                                disabled={!createForm.descripcion || selectedProductos.length === 0 || creatingGasto || editingGastoLoading || (showEditModal && editingGasto?.estado !== 'pendiente')}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center gap-2"
                                style={{ background: '#222', color: '#fff', border: 'none' }}>
                                {creatingGasto || editingGastoLoading
                                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                                    : showEditModal
                                        ? `Guardar Cambios · ${selectedProductos.length}`
                                        : `Registrar Gasto · ${selectedProductos.length}`
                                }
                            </button>
                        </div>
                    </div>
                </div>
                </>
            )}

            {/* ── MODAL ELIMINAR ───────────────────────────────────── */}
            {showDeleteModal && (
                <>
                <div className="fixed inset-0 z-[999]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowDeleteModal(false)} />
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-2xl p-6 text-center"
                        style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                            style={{ background: '#fdf4f4', border: '0.5px solid #f0d0d0' }}>
                            <svg className="w-5 h-5" style={{ color: '#a03030' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        <h3 className="text-base font-medium mb-2" style={{ color: '#111' }}>Eliminar Gasto</h3>
                        <p className="text-xs mb-1" style={{ color: '#888' }}>Gasto #{deletingGasto?.id}</p>
                        <p className="text-sm font-medium mb-1" style={{ color: '#a03030' }}>-${formatDinero(deletingGasto?.total)}</p>
                        <p className="text-xs mb-6" style={{ color: '#bbb' }}>Esta acción no se puede deshacer.</p>

                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                Cancelar
                            </button>
                            <button onClick={handleEliminarGasto}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                                style={{ background: '#a03030', color: '#fff', border: 'none' }}>
                                Eliminar
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