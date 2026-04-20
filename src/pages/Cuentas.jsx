import React, { useState, useEffect, useCallback } from 'react';
import CorteCajaModal from '../components/CorteCajaModal';
import { SelectFormaPago } from '../components/selects';

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

    //Buscador de cuentas
    const [searchCuenta, setSearchCuenta] = useState('');
    const [searchCuentaInput, setSearchCuentaInput] = useState('');

    //Buscador productos
    const [searchProducto, setSearchProducto] = useState('');
    const [searchProductoInput, setSearchProductoInput] = useState('');

    // 🆕 NUEVO MODAL DE ABONOS - CORREGIDO PARA ENDPOINT REAL
    const [showAbonosModal, setShowAbonosModal] = useState(false);
    // 🆕 1. INICIALIZAR MONTO CON total_pendiente
    const [abonosForm, setAbonosForm] = useState({
        total_abonado: 0, // ✅ Auto-monto
        tipo_pago_id: 1,
        forma_pago_id: null, // Se asigna después de cargar formas de pago
        referencia: '',
        nota: ''
    });
    const [tiposPago, setTiposPago] = useState([]);
    const [formasPago, setFormasPago] = useState([]);
    const [abonosLoading, setAbonosLoading] = useState(false);
    const [mensajeResultado, setMensajeResultado] = useState('');
    const [mostrarVuelto, setMostrarVuelto] = useState(false);
    const [pagoParcial, setPagoParcial] = useState(false);

    //pestaña activa
    const [pestañaActiva, setPestañaActiva] = useState('contado');
    const [totalesCuentas, setTotalesCuentas] = useState({ contado: 0, credito: 0 });

    //FETCH PRINCIPALES
    const fetchCuentas = async (currentPage = 1, searchTerm = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
            page: currentPage,
            limit: 10,
            });

            if (searchTerm.trim()) {
            params.append('search', searchTerm);
            }

            // 👇 NUEVO FILTRO por pestaña (contado o credito)
            params.append('tipo_pago', pestañaActiva);

            const response = await fetch(`${apiURL}/cuentas?${params.toString()}`);
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

    const fetchTotalesCuentas = async () => {
        try {
            const response = await fetch(`${apiURL}/cuentas/totales`);
            const data = await response.json();
            if (data.success) {
            setTotalesCuentas(data.data);
            }
        } catch (error) {
            console.error('Error cargando totales:', error);
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
                setProductosPagination(data.pagination);
            } else {
                throw new Error(data.message || 'Error al obtener productos');
            }

        } catch (err) {
            console.error('Error fetchProductos:', err);
        } finally {
            setLoading(false);
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

    //USEEFFECT PRINCIPALES
    // Effects
    useEffect(() => {
        fetchCuentas(page, searchCuenta);
        fetchTotalesCuentas();
    }, [page, searchCuenta, pestañaActiva]);

   // 🆕 Solo cargar forma_pago (no tipo_pago)
    useEffect(() => {
        const cargarPagos = async () => {
            try {
            const formasRes = await fetch(`${apiURL}/forma_pago`).then(r => r.json());

            if (formasRes.success) setFormasPago(formasRes.data);
            } catch (error) {
            console.error('Error cargando formas de pago:', error);
            }
        };
        cargarPagos();
    }, []);


    // useEffect(() => {
    //     const delayDebounceCuenta = setTimeout(() => {
    //         setSearchCuenta(searchCuentaInput)
    //         setPage(1)
    //     }, 4000)

    //     return () => clearTimeout(delayDebounceCuenta)

    // }, [searchCuentaInput]);

    useEffect(() => {
        if (showDetailModal || showCreateModal) {
            console.log('fetchProductos triggered by modal open with:', { productosPage, searchProducto, categoriaSeleccionada });
            fetchProductos(productosPage, searchProducto, categoriaSeleccionada)
        }
    }, [showCreateModal, showDetailModal, productosPage, categoriaSeleccionada, searchProducto])

    useEffect(() => {
        if (showDetailModal || showCreateModal) {
            fetchCategorias()
        }
    }, [showCreateModal, showDetailModal]);

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

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setSearchProducto(searchProductoInput)
            setProductosPage(1)
        }, 4000)

        return () => clearTimeout(delayDebounce)

    }, [searchProductoInput]);

    //HANDLERS PRINCIPALES

    //HANDLER para cambiar pestaña:
    const handleCambiarPestaña = (nuevaPestaña) => {
        setPestañaActiva(nuevaPestaña);
        setPage(1); // Reset a página 1
        setSearchCuenta(''); // Limpiar búsqueda
    };

    // ✅ handleCambiarTipoPago - SILENCIOSO
    const handleCambiarTipoPago = async (cuentaId, nuevoTipo) => {
        setUpdating(cuentaId);

        try {
            const response = await fetch(`${apiURL}/cuentas/${cuentaId}/tipo-pago`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo_pago: nuevoTipo })
            });

            const data = await response.json();

            if (data.success) {
                // 👇 RECARGAR TODO DESDE API (sin actualizar local)
                await Promise.all([
                    fetchTotalesCuentas(), // Actualiza totales en header
                    fetchCuentas(page, searchCuenta)  // Recarga lista actual
                ]);
            }
            
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setUpdating(null);
        }
    };

    // ✅ HANDLER REFERENCIA AUTOMÁTICA
    const handleFormaPagoChange = (formaId) => {
        const formaSeleccionada = formasPago.find(f => f.id === formaId);
        
        setAbonosForm(prev => ({
            ...prev,
            forma_pago_id: formaId,
            referencia: formaSeleccionada?.codigo || 'EFECTIVO'  // ✅ AUTO-referencia
        }));
    };

    // 🆕 FUNCIÓN PARA ABRIR MODAL DE ABONOS
    const handleAbrirAbonosModal = useCallback((cuenta) => {
        setSelectedCuenta(cuenta);
        setAbonosForm({
            cuenta_id: cuenta.id,
            total_abonado: '',
            forma_pago_id: formasPago.length > 0 ? formasPago[0].id : null,
            referencia: '',
            nota: ''
        });
        setMensajeResultado('');
        setMostrarVuelto(false);
        setPagoParcial(false);
        setShowAbonosModal(true);
    }, []);

    const handleProcesarAbono = async (e) => {
        e.preventDefault();

        if (!abonosForm.total_abonado || parseFloat(abonosForm.total_abonado) <= 0) {
            alert('Ingresa un monto válido');
            return;
        }

        try {
            setAbonosLoading(true);

            const response = await fetch(`${apiURL}/abonos-cuenta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cuenta_id: selectedCuenta.id,
                total_abonado: parseFloat(abonosForm.total_abonado),
                forma_pago_id: parseInt(abonosForm.forma_pago_id),
                referencia: abonosForm.referencia || null,
                nota: abonosForm.nota || 'Abono registrado desde frontend'
            })
            });

            if (!response.ok) {
            const errorText = await response.text();
            alert(`❌ Error ${response.status}: ${errorText}`);
            return;
            }

            const data = await response.json();

            if (data.success) {
            const cuenta = data.data.cuenta;
            const abono = data.data.abono;

            // 🆕 MENSAJE (solo con forma de pago)
            const formaPago = formasPago.find(f => f.id === abono.forma_pago_id);

            if (cuenta.estado === 'pagado') {
                setMensajeResultado(
                `✅ ¡Cuenta pagada con éxito! ` +
                `Abono: $${formatDinero(abono.total_abonado)} ` +
                `${formaPago?.codigo || 'EFECTIVO'} ` +
                (cuenta.total_vuelto > 0
                    ? `| Cambio: $${formatDinero(cuenta.total_vuelto)}`
                    : '')
                );
                setMostrarVuelto(true);
                setPagoParcial(false);

                setTimeout(() => {
                    handleCerrarAbonosModal();
                    fetchTotalesCuentas();
                    fetchCuentas(page, searchCuenta);
                }, 2000);
            } else {
                setMensajeResultado(
                `✅ Abono registrado: $${formatDinero(abono.total_abonado)} ` +
                `${formaPago?.codigo || 'EFECTIVO'} ` +
                `| Saldo restante: $${formatDinero(cuenta.total_pendiente)}`
                );
                setPagoParcial(true);
                setMostrarVuelto(false);

                // 👇 ACTUALIZAR LOCALMENTE la cuenta específica
                selectedCuenta.total_pendiente = cuenta.total_pendiente; // Actualiza el pendiente

                setAbonosForm(prev => ({
                ...prev,
                total_abonado: formatDinero(cuenta.total_pendiente),
                nota: ''
                }));

                setSelectedCuenta(cuenta);
            }
            }
        } catch (error) {
            alert(`❌ Error inesperado: ${error.message}`);
        } finally {
            setAbonosLoading(false);
        }
    };

     // 🆕 HANDLER PARA CERRAR MODAL DE ABONOS
    const handleCerrarAbonosModal = () => {
        setShowAbonosModal(false);
        setSelectedCuenta(null);
        setAbonosForm({ monto: '', observacion: '' });
        setMensajeResultado('');
        setMostrarVuelto(false);
        setPagoParcial(false);
    };

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
            setEditProductos(prev => [{ ...producto, cantidad: 1 }, ...prev]);
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
                { 
                    ...producto, 
                    cantidad: 1,
                    precioventa_original: producto.precio_venta, // guardar precio normal
                    promocion_activa: null                       // sin promo al inicio
                },
                ...selectedProductos           
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

    // Handlers Cuentas (CORREGIDO)
    // const handlePagarCuenta = async (cuentaId) => {
    //     try {
    //     setUpdating(cuentaId);
    //     const response = await fetch(`${apiURL}/cuentas/${cuentaId}/pagar`, {
    //         method: 'PATCH'
    //     });
    //     const data = await response.json();
        
    //     if (data.success) {
    //         await Promise.all([
    //             fetchCuentas(page),
    //             fetchMesas()
    //         ]);
    //     }
    //     } catch (error) {
    //     console.error('Error pagar:', error);
    //     } finally {
    //     setUpdating(null);
    //     }
    // };

     // ✅ NUEVO handlePagarCuenta - Abre modal de abonos
    const handlePagarCuenta = (cuentaId) => {
        // Buscar la cuenta en la lista para obtener sus datos completos
        const cuenta = cuentas.find(c => c.id === cuentaId);
        if (cuenta) {
        handleAbrirAbonosModal(cuenta);
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
        //setProductosPage(1);
        //await Promise.all([fetchProductos(1), fetchCategorias()]);
        
        setShowDetailModal(true);
    }, [showDetailModal]);

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
            handleCerrarModal();
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
        setSearchProductoInput('');
        //fetchProductos(1, );   
    };

    const handleCerrarDetalle = () => {
        setShowDetailModal(false);
        setSelectedCuenta(null);
        setEditForm({ cliente: '', mesa_id: '' });
        setDetalleProductos([]);
        setEditProductos([]);
        setCategoriaSeleccionada('N/A');  // ✅ Reset a N/A
        setSearchProductoInput('');
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

    //UTILS PRINCIPALES
    const calcularTotal = () => {
        return selectedProductos.reduce((total, p) => total + (p.precio_venta * p.cantidad), 0);
    };

    const formatDinero = (numero) => {
        return Number(numero ?? 0).toLocaleString('es-SV', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
        });
    };

    //Utils
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


    // Cuentas.jsx — fragmento return (reemplaza desde el loading hasta el final)
// El resto del componente (estados, handlers, etc.) permanece igual.

    if (loading && cuentas.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
                <p className="text-sm" style={{ color: '#888' }}>Cargando ventas...</p>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Ventas</h1>
                        <p className="text-sm" style={{ color: '#888' }}>Gestión de cuentas y abonos</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                        style={{ background: '#222', color: '#fff', border: 'none' }}
                    >
                        + Nueva Venta
                    </button>
                </div>

                {/* PESTAÑAS + BUSCADOR */}
                <div className="mb-6 flex flex-col gap-4">
                    {/* Pestañas */}
                    <div className="flex rounded-lg overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e0e0da' }}>
                        <button
                            onClick={() => handleCambiarPestaña('contado')}
                            className="flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                            style={pestañaActiva === 'contado'
                                ? { background: '#222', color: '#fff' }
                                : { background: 'transparent', color: '#666' }
                            }
                        >
                            Al Contado
                            <span className="text-xs px-2 py-0.5 rounded-full" style={pestañaActiva === 'contado' ? { background: 'rgba(255,255,255,0.2)', color: '#fff' } : { background: '#f0f0ea', color: '#888' }}>
                                {totalesCuentas.contado}
                            </span>
                        </button>
                        <button
                            onClick={() => handleCambiarPestaña('credito')}
                            className="flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                            style={pestañaActiva === 'credito'
                                ? { background: '#222', color: '#fff' }
                                : { background: 'transparent', color: '#666' }
                            }
                        >
                            Al Crédito
                            <span className="text-xs px-2 py-0.5 rounded-full" style={pestañaActiva === 'credito' ? { background: 'rgba(255,255,255,0.2)', color: '#fff' } : { background: '#f0f0ea', color: '#888' }}>
                                {totalesCuentas.credito}
                            </span>
                        </button>
                    </div>

                    {/* Buscador */}
                    <div className="relative max-w-md">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Buscar cliente o número..."
                            value={searchCuentaInput}
                            onChange={(e) => setSearchCuentaInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { setSearchCuenta(searchCuentaInput); setPage(1); e.target.blur(); } }}
                            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg outline-none transition-all duration-200"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#222' }}
                        />
                        {searchCuentaInput && (
                            <button onClick={() => { setSearchCuentaInput(''); setSearchCuenta(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#bbb' }}>
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
                        <span className="text-xs ml-2" style={{ color: '#aaa' }}>Pág. {page} de {pagination.totalPages}</span>
                    </div>
                )}

                {/* GRID CUENTAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {cuentas.map(cuenta => {
                        const esContado = cuenta.tipo_pago == 'contado';
                        return (
                            <div key={cuenta.id} className="rounded-2xl p-5 transition-all duration-200" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                                
                                {/* Cabecera */}
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-medium" style={{ color: '#111' }}>Venta #{cuenta.id}</p>
                                    <span className="text-xs px-2 py-1 rounded-md font-medium"
                                        style={cuenta.estado === 'pagado'
                                            ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                            : { background: '#fdfaf4', color: '#7a6a2a', border: '0.5px solid #e6d8a0' }
                                        }>
                                        {cuenta.estado === 'pagado' ? 'Pagada' : 'Pendiente'}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm font-medium truncate" style={{ color: '#333' }}>{cuenta.cliente.toUpperCase()}</p>
                                    {/* {cuenta.mesa_id && (
                                        <p className="text-xs" style={{ color: '#aaa' }}>Mesa {cuenta.numero_mesa}</p>
                                    )} */}
                                    <span className="inline-block text-xs px-2 py-1 rounded-md"
                                        style={esContado
                                            ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                            : { background: '#f4f0fa', color: '#5a2a7a', border: '0.5px solid #d8c8e6' }
                                        }>
                                        {esContado ? 'Contado' : 'Crédito'}
                                    </span>
                                    <div className="flex justify-between text-xs">
                                        <span style={{ color: '#555' }}>{formatFechaUTCWithTime(cuenta.fecha_creado)}</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <p className="text-2xl font-medium mb-5" style={{ color: '#111' }}>${formatDinero(cuenta.total_pendiente)}</p>

                                {/* Botón abono */}
                                {cuenta.estado === 'pendiente' && (
                                    <button onClick={() => handlePagarCuenta(cuenta.id)} disabled={updating === cuenta.id}
                                        className="w-full py-2 rounded-lg text-sm font-medium mb-3 transition-all duration-200 disabled:opacity-40"
                                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                                        Abono
                                    </button>
                                )}

                                {/* Botones secundarios */}
                                <div className="flex gap-2">
                                    <button onClick={() => handleCambiarTipoPago(cuenta.id, esContado ? 'credito' : 'contado')} disabled={updating === cuenta.id}
                                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-40"
                                        style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                        {esContado ? 'Mover a Crédito' : 'Mover a Contado'}
                                    </button>
                                    <button onClick={() => handleVerDetalle(cuenta.id)} disabled={loadingDetail === cuenta.id}
                                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-40"
                                        style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                        Detalle
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* PAGINACIÓN INFERIOR */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 mt-6">
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
                {cuentas.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <p className="text-sm mb-4" style={{ color: '#aaa' }}>No hay ventas registradas</p>
                        <button onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium"
                            style={{ background: '#222', color: '#fff' }}>
                            + Nueva Venta
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* ── MODAL ABONOS ─────────────────────────────────────────── */}
        {showAbonosModal && selectedCuenta?.cliente && (
            <>
            <div className="fixed inset-0 z-[80]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarAbonosModal} />
            <div className="fixed inset-0 z-[80] p-4 flex items-center justify-center">
                <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <div>
                            <h2 className="text-base font-medium" style={{ color: '#111' }}>Realizar Abono</h2>
                            <p className="text-xs" style={{ color: '#aaa' }}>Venta #{selectedCuenta.id} · {selectedCuenta.cliente?.toUpperCase()}</p>
                        </div>
                        <button onClick={handleCerrarAbonosModal} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: '#f5f5f0' }}>
                            <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Saldo */}
                    <div className="px-6 py-4" style={{ background: '#fafafa', borderBottom: '0.5px solid #f0f0ea' }}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs" style={{ color: '#aaa' }}>Saldo pendiente</span>
                            <span className="text-xs px-2 py-0.5 rounded-md"
                                style={selectedCuenta.estado === 'pagado'
                                    ? { background: '#f4faf4', color: '#2a7a2a' }
                                    : { background: '#fdfaf4', color: '#7a6a2a' }}>
                                {selectedCuenta.estado === 'pagado' ? 'Pagada' : 'Pendiente'}
                            </span>
                        </div>
                        <p className="text-2xl font-medium" style={{ color: '#111' }}>${formatDinero(selectedCuenta.total_pendiente || selectedCuenta.total)}</p>
                        <p className="text-xs mt-1" style={{ color: '#bbb' }}>Pagado: ${formatDinero(selectedCuenta.total_pagado || 0)}</p>
                    </div>

                    {/* Formulario */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <form onSubmit={handleProcesarAbono} className="space-y-5">

                            {/* Formas de pago - CAT-017 */}
                            <div>
                                <SelectFormaPago
                                    value={abonosForm.forma_pago_id || ''}
                                    onChange={(val) => setAbonosForm({ ...abonosForm, forma_pago_id: val })}
                                    label="Forma de Pago"
                                    required={true}
                                    disabled={mostrarVuelto}
                                />
                            </div>

                            {/* Monto */}
                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>MONTO</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#aaa' }}>$</span>
                                    <input type="number" step="0.01" min="0.01" value={abonosForm.total_abonado}
                                        onChange={(e) => setAbonosForm({ ...abonosForm, total_abonado: e.target.value })}
                                        placeholder="0.00" disabled={mostrarVuelto}
                                        className="w-full pl-7 pr-4 py-3 rounded-xl text-lg font-medium outline-none transition-all"
                                        style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#111' }} />
                                </div>
                            </div>

                            {/* Referencia */}
                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>REFERENCIA</label>
                                <div className="relative">
                                    <input type="text" value={abonosForm.referencia || 'EFECTIVO'} readOnly disabled={mostrarVuelto}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e8e8e2', color: '#888' }} />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#bbb' }}>AUTO</span>
                                </div>
                            </div>

                            {/* Mensaje resultado */}
                            {mensajeResultado && (
                                <div className="px-4 py-3 rounded-xl text-sm font-medium"
                                    style={mostrarVuelto
                                        ? { background: '#f4faf4', border: '0.5px solid #c8e6c8', color: '#2a7a2a' }
                                        : { background: '#fdfaf4', border: '0.5px solid #e6d8a0', color: '#7a6a2a' }}>
                                    {mensajeResultado}
                                </div>
                            )}

                            {/* Nota */}
                            <div>
                                <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>NOTA (OPCIONAL)</label>
                                <textarea rows="2" value={abonosForm.nota} onChange={(e) => setAbonosForm({ ...abonosForm, nota: e.target.value })}
                                    placeholder="Pago parcial, propina, adelanto..." disabled={mostrarVuelto}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                                    style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#333' }} />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={handleCerrarAbonosModal} disabled={abonosLoading || mostrarVuelto}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                                    style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                    Cancelar
                                </button>
                                {!mostrarVuelto && (
                                    <button type="submit" disabled={!abonosForm.total_abonado || parseFloat(abonosForm.total_abonado) <= 0 || abonosLoading}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                                        {abonosLoading ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                                        ) : 'Registrar Abono'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            </>
        )}

        {/* ── MODAL NUEVA CUENTA ───────────────────────────────────── */}
        {showCreateModal && (
            <>
            <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarModal} />
            <div className="fixed inset-0 z-[60] p-4 flex items-center justify-center">
                <div className="w-full max-w-6xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                    {/* Header fijo */}
                    <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-medium" style={{ color: '#111' }}>Nueva Venta</h2>
                                <p className="text-xs" style={{ color: '#aaa' }}>
                                    Total: <span className="font-medium" style={{ color: '#111' }}>${formatDinero(calcularTotal())}</span>
                                    {selectedProductos.length > 0 && ` · ${selectedProductos.length} productos`}
                                </p>
                            </div>
                            <button onClick={handleCerrarModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div>
                            <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>CLIENTE</label>
                            <input className="w-full max-w-sm px-4 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                value={createForm.cliente}
                                onChange={(e) => setCreateForm({ ...createForm, cliente: e.target.value })}
                                required placeholder="Nombre del cliente" />
                        </div>
                    </div>

                    {/* Contenido scrollable */}
                    <div className="flex-1 overflow-y-auto min-h-0">

                        {/* Sección productos */}
                        <div className="p-6" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium" style={{ color: '#111' }}>
                                    Productos
                                    {selectedProductos.length > 0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f0ea', color: '#666' }}>{selectedProductos.length} seleccionados</span>}
                                </p>
                            </div>

                            {/* Categorías */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                <button onClick={() => { setCategoriaSeleccionada('N/A'); fetchProductos(1); setProductosPage(1); }}
                                    className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                                    style={categoriaSeleccionada === 'N/A' ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                    Todos
                                </button>
                                {categorias.map((cat) => (
                                    <button key={cat.id} onClick={() => { setCategoriaSeleccionada(cat.codigo); fetchProductos(1, '', cat.codigo); setProductosPage(1); }}
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
                                    <button onClick={() => setProductosPage(Math.max(1, productosPage - 1))} disabled={productosPage === 1}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                                    <button onClick={() => setProductosPage(Math.min(productosPagination.totalPages, productosPage + 1))} disabled={productosPage === productosPagination.totalPages}
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
                                                <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{cantidadSeleccionada}</span>
                                            )}
                                            <p className="text-xs font-medium mb-1 line-clamp-2 pr-6" style={{ color: cantidadSeleccionada > 0 ? '#fff' : '#222' }}>{producto.descripcion}</p>
                                            <p className="text-xs mb-1" style={{ color: cantidadSeleccionada > 0 ? 'rgba(255,255,255,0.6)' : '#aaa' }}>{producto.presentacion}</p>
                                            <p className="text-sm font-medium" style={{ color: cantidadSeleccionada > 0 ? '#fff' : '#111' }}>${formatDinero(producto.precio_venta || producto.precioventa)}</p>
                                            <p className="text-xs mt-1" style={{ color: cantidadSeleccionada > 0 ? 'rgba(255,255,255,0.5)' : '#ccc' }}>Stock {Math.trunc(producto.cantidad_disponible)}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Paginación inferior */}
                            {productosPagination.totalPages > 1 && (
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => setProductosPage(Math.max(1, productosPage - 1))} disabled={productosPage === 1}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                                    <button onClick={() => setProductosPage(Math.min(productosPagination.totalPages, productosPage + 1))} disabled={productosPage === productosPagination.totalPages}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                                </div>
                            )}
                        </div>

                        {/* Productos seleccionados */}
                        {selectedProductos.length > 0 && (
                            <div className="p-6" style={{ background: '#fafafa', borderBottom: '0.5px solid #f0f0ea' }}>
                                <p className="text-sm font-medium mb-4" style={{ color: '#111' }}>Detalle ({selectedProductos.length})</p>
                                <div className="space-y-3">
                                    {selectedProductos.map(producto => (
                                        <div key={producto.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl" style={{ background: '#fff', border: '0.5px solid #e0e0da' }}>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{producto.descripcion}</p>
                                                <p className="text-xs" style={{ color: '#aaa' }}>{producto.presentacion}</p>
                                                {producto.promocion_activa && (
                                                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md" style={{ background: '#f4faf4', color: '#2a7a2a' }}>
                                                        {producto.promocion_activa.nombre_promocion} · ${formatDinero(producto.promocion_activa.nuevo_precio_venta)} c/u
                                                    </span>
                                                )}
                                            </div>
                                            {promocionesPorProducto[producto.id] && (
                                                <div className="flex gap-2 flex-wrap">
                                                    <button type="button" onClick={() => handlePromocionChange(producto.id, null)}
                                                        className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                                                        style={!producto.promocion_activa ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                                        Individual
                                                    </button>
                                                    {promocionesPorProducto[producto.id].map((promo) => (
                                                        <button key={promo.id} type="button" onClick={() => handlePromocionChange(producto.id, promo)}
                                                            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                                                            style={producto.promocion_activa?.id === promo.id ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                                            {promo.nombre_promocion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 rounded-lg p-1" style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da' }}>
                                                    <button onClick={() => handleDisminuirCantidad(producto.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-medium transition-all" style={{ background: '#fff', color: '#555' }}>-</button>
                                                    <input type="text" value={producto.cantidad?.toString() || '1'} onChange={(e) => handleCantidadChange(producto.id, parseFloat(e.target.value) || 1)}
                                                        className="w-10 text-center text-sm font-medium outline-none" style={{ background: 'transparent', color: '#222' }} />
                                                    <button onClick={() => handleAumentarCantidad(producto.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-medium transition-all" style={{ background: '#222', color: '#fff' }}>+</button>
                                                </div>
                                                <span className="text-sm font-medium min-w-[64px] text-right" style={{ color: '#111' }}>
                                                    ${formatDinero((producto.precio_venta || producto.precioventa) * (producto.cantidad || 1))}
                                                </span>
                                                <button onClick={() => handleBorrarProducto(producto.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all" style={{ background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                        <button onClick={handleCerrarModal} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>Cancelar</button>
                        <button onClick={handleCrearCuenta} disabled={!createForm.cliente || selectedProductos.length === 0 || creatingCuenta}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center gap-2"
                            style={{ background: '#222', color: '#fff', border: 'none' }}>
                            {creatingCuenta ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando...</> : `Crear Venta · ${selectedProductos.length}`}
                        </button>
                    </div>
                </div>
            </div>
            </>
        )}

        {/* ── MODAL DETALLE / EDITAR ───────────────────────────────── */}
        {showDetailModal && selectedCuenta && (
            <>
            <div className="fixed inset-0 z-[70]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarDetalle} />
            <div className="fixed inset-0 z-[70] p-4 flex items-center justify-center">
                <div className="w-full max-w-6xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                    {/* Header */}
                    <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-medium" style={{ color: '#111' }}>Editar Venta #{selectedCuenta.id}</h2>
                                <p className="text-xs" style={{ color: '#aaa' }}>
                                    Total: <span className="font-medium" style={{ color: '#111' }}>
                                        ${formatDinero([...detalleProductos, ...editProductos].reduce((t, p) => t + (p.precio_venta || p.precioventa || 0) * (p.cantidad || 1), 0))}
                                    </span> · {detalleProductos.length + editProductos.length} productos
                                </p>
                            </div>
                            <button onClick={handleCerrarDetalle} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                                <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div>
                            <label className="block text-xs tracking-widest mb-2" style={{ color: '#999' }}>CLIENTE</label>
                            <input className="w-full max-w-sm px-4 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: '#fafafa', border: '0.5px solid #e0e0da', color: '#222' }}
                                value={editForm.cliente}
                                onChange={(e) => setEditForm({ ...editForm, cliente: e.target.value })}
                                required placeholder="Nombre del cliente" />
                        </div>
                    </div>

                    {/* Contenido scrollable */}
                    <div className="flex-1 overflow-y-auto min-h-0">

                        {/* Lista productos */}
                        <div className="p-6" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                            <p className="text-sm font-medium mb-4" style={{ color: '#111' }}>Agregar Productos</p>

                            {/* Categorías */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                <button onClick={() => { setCategoriaSeleccionada('N/A'); fetchProductos(1); setProductosPage(1); }}
                                    className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                                    style={categoriaSeleccionada === 'N/A' ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                    Todos
                                </button>
                                {categorias.map((cat) => (
                                    <button key={cat.id} onClick={() => { setCategoriaSeleccionada(cat.codigo); fetchProductos(1, '', cat.codigo); setProductosPage(1); }}
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
                            </div>

                            {/* Paginación superior */}
                            {productosPagination.totalPages > 1 && (
                                <div className="flex gap-2 mb-4">
                                    <button onClick={() => setProductosPage(Math.max(1, productosPage - 1))} disabled={productosPage === 1}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                                    <button onClick={() => setProductosPage(Math.min(productosPagination.totalPages, productosPage + 1))} disabled={productosPage === productosPagination.totalPages}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                                </div>
                            )}

                            {/* Grid productos */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {productos.map(producto => {
                                    const enDetalle = detalleProductos.find(p => p.id === producto.id);
                                    const enEdit = editProductos.find(p => p.id === producto.id);
                                    const cantidadSeleccionada = Number(enDetalle?.cantidad || 0) + Number(enEdit?.cantidad || 0);
                                    return (
                                        <button key={producto.id} onClick={() => handleAgregarProductoDetalle(producto)}
                                            className="p-3 rounded-xl text-left transition-all duration-200 relative"
                                            style={cantidadSeleccionada > 0
                                                ? { background: '#222', border: '0.5px solid #222' }
                                                : { background: '#fff', border: '0.5px solid #e0e0da' }}>
                                            {cantidadSeleccionada > 0 && (
                                                <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{cantidadSeleccionada}</span>
                                            )}
                                            <p className="text-xs font-medium mb-1 line-clamp-2 pr-6" style={{ color: cantidadSeleccionada > 0 ? '#fff' : '#222' }}>{producto.descripcion}</p>
                                            <p className="text-xs mb-1" style={{ color: cantidadSeleccionada > 0 ? 'rgba(255,255,255,0.6)' : '#aaa' }}>{producto.presentacion}</p>
                                            <p className="text-sm font-medium" style={{ color: cantidadSeleccionada > 0 ? '#fff' : '#111' }}>${formatDinero(producto.precio_venta)}</p>
                                            <p className="text-xs mt-1" style={{ color: cantidadSeleccionada > 0 ? 'rgba(255,255,255,0.5)' : '#ccc' }}>Stock {Math.trunc(producto.cantidad_disponible)}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Paginación inferior */}
                            {productosPagination.totalPages > 1 && (
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => setProductosPage(Math.max(1, productosPage - 1))} disabled={productosPage === 1}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                                    <button onClick={() => setProductosPage(Math.min(productosPagination.totalPages, productosPage + 1))} disabled={productosPage === productosPagination.totalPages}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40"
                                        style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                                </div>
                            )}
                        </div>

                        {/* Productos en detalle */}
                        {(detalleProductos.length > 0 || editProductos.length > 0) && (
                            <div className="p-6" style={{ background: '#fafafa' }}>
                                <p className="text-sm font-medium mb-4" style={{ color: '#111' }}>Detalle ({detalleProductos.length + editProductos.length})</p>
                                <div className="space-y-3">
                                    {/* Nuevos */}
                                    {editProductos.map(producto => (
                                        <div key={producto.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl" style={{ background: '#fff', border: '0.5px solid #e0e0da', borderLeft: '2px solid #2a7a2a' }}>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{producto.descripcion}</p>
                                                <p className="text-xs" style={{ color: '#aaa' }}>{producto.presentacion}</p>
                                                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md" style={{ background: '#f4faf4', color: '#2a7a2a' }}>Nuevo</span>
                                            </div>
                                            {promocionesPorProductoDetalle[producto.id] && (
                                                <div className="flex gap-2 flex-wrap">
                                                    <button type="button" onClick={() => handlePromocionChangeEdit(producto.id, null)}
                                                        className="px-3 py-1 rounded-lg text-xs font-medium"
                                                        style={!producto.promocion_activa ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                                        Individual
                                                    </button>
                                                    {promocionesPorProductoDetalle[producto.id].map((promo) => (
                                                        <button key={promo.id} type="button" onClick={() => handlePromocionChangeEdit(producto.id, promo)}
                                                            className="px-3 py-1 rounded-lg text-xs font-medium"
                                                            style={producto.promocion_activa?.id == promo.id ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                                            {promo.nombre_promocion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 rounded-lg p-1" style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da' }}>
                                                    <button onClick={() => handleDisminuirCantidadEdit(producto.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: '#fff', color: '#555' }}>-</button>
                                                    <span className="w-10 text-center text-sm font-medium" style={{ color: '#222' }}>{producto.cantidad || 1}</span>
                                                    <button onClick={() => handleAumentarCantidadEdit(producto.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: '#222', color: '#fff' }}>+</button>
                                                </div>
                                                <span className="text-sm font-medium min-w-[60px] text-right" style={{ color: '#111' }}>${formatDinero((producto.precio_venta || producto.precioventa || 0) * (producto.cantidad || 1))}</span>
                                                <button onClick={() => handleEliminarProductoEdit(producto.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>✕</button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Originales */}
                                    {detalleProductos.map(producto => (
                                        <div key={producto.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl" style={{ background: '#fff', border: '0.5px solid #e0e0da', borderLeft: '2px solid #b8860b' }}>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{producto.descripcion}</p>
                                                <p className="text-xs" style={{ color: '#aaa' }}>{producto.presentacion}</p>
                                                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md" style={{ background: '#fdfaf4', color: '#7a6a2a' }}>Original</span>
                                            </div>
                                            {promocionesPorProductoDetalle[String(producto.producto_id)] && (
                                                <div className="flex gap-2 flex-wrap">
                                                    <button type="button" onClick={() => handlePromocionChangeDetalle(String(producto.id), null)}
                                                        className="px-3 py-1 rounded-lg text-xs font-medium"
                                                        style={!producto.promocion_activa ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                                        Individual
                                                    </button>
                                                    {promocionesPorProductoDetalle[String(producto.producto_id)].map((promo) => (
                                                        <button key={promo.id} type="button" onClick={() => handlePromocionChangeDetalle(String(producto.id), promo)}
                                                            className="px-3 py-1 rounded-lg text-xs font-medium"
                                                            style={producto.promocion_activa?.id == promo.id ? { background: '#222', color: '#fff' } : { background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                                            {promo.nombre_promocion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 rounded-lg p-1" style={{ background: '#f5f5f0', border: '0.5px solid #e0e0da' }}>
                                                    <button onClick={() => handleDisminuirCantidadDetalle(producto.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: '#fff', color: '#555' }}>-</button>
                                                    <span className="w-10 text-center text-sm font-medium" style={{ color: '#222' }}>{producto.cantidad || 1}</span>
                                                    <button onClick={() => handleAumentarCantidadDetalle(producto.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: '#222', color: '#fff' }}>+</button>
                                                </div>
                                                <span className="text-sm font-medium min-w-[60px] text-right" style={{ color: '#111' }}>${formatDinero((producto.precio_venta || 0) * (producto.cantidad || 1))}</span>
                                                <button onClick={() => handleEliminarProductoDetalle(producto.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                        <button onClick={handleCerrarDetalle} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>Cancelar</button>
                        <button onClick={handleGuardarDetalle} disabled={!editForm.cliente || creatingCuentaDetalle}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center gap-2"
                            style={{ background: '#222', color: '#fff', border: 'none' }}>
                            {creatingCuentaDetalle ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
            </>
        )}

        <CorteCajaModal isOpen={showCorteModal} onClose={() => setShowCorteModal(false)} />
        </>
    );
};

export default Cuentas;