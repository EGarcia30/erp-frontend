import React, { useState, useEffect, useCallback } from 'react';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Historial = () => {
    const [historial, setHistorial] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedCuenta, setSelectedCuenta] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filtros, setFiltros] = useState({
        periodo: 'todo',
        estado: 'todo'
    });

    // ✅ PERFECTO PARA TU BACKEND - Envía periodo y estado
    const fetchHistorial = useCallback(async (page = 1, filtrosLoc = filtros) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                periodo: filtrosLoc.periodo,        // ✅ Para tu backend
                estado: filtrosLoc.estado           // ✅ Para tu backend
            });
            
            const response = await fetch(`${apiURL}/cuentas/historial?${params}`);
            const data = await response.json();

            if (data.success) {
                setHistorial(data.data || []);
                setPagination(data.pagination || {});
                setFiltros(data.filtros || filtrosLoc); // ✅ Backend confirma filtros
            } else {
                console.error('❌ API Error:', data.error);
                setHistorial([]);
            }
        } catch (error) {
            console.error('🚨 Network Error:', error);
            setHistorial([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Cambio de filtro - INSTANTÁNEO + reset página 1
    const handleFiltroChange = useCallback((nuevoFiltro) => {
        setFiltros(nuevoFiltro);
        setCurrentPage(1);
        fetchHistorial(1, nuevoFiltro);
    }, [fetchHistorial]);

    // ✅ Cambio de página
    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
        fetchHistorial(newPage, filtros);
    }, [fetchHistorial, filtros]);

    // Ver detalle cuenta
    const handleVerDetalle = async (cuentaId) => {
        try {
            const response = await fetch(`${apiURL}/cuentas/${cuentaId}`);
            const data = await response.json();
            if (data.success) {
                setSelectedCuenta(data.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error detalle:', error);
        }
    };

    const handleCerrarDetalle = () => {
        setShowDetailModal(false);
        setSelectedCuenta(null);
    };

    const formatDinero = (numero) => {
        return Number(numero ?? 0).toLocaleString('es-SV', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
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

    // ✅ Carga inicial
    useEffect(() => {
        fetchHistorial(1);
    }, []);

    // ✅ Recarga por página o filtros
    useEffect(() => {
        fetchHistorial(currentPage, filtros);
    }, [currentPage, fetchHistorial]);

    // Historial.jsx — fragmento return (reemplaza desde el loading hasta el final)
// El resto del componente (estados, handlers, fetches) permanece igual.

    if (loading && historial.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
                <p className="text-sm" style={{ color: '#888' }}>Cargando historial...</p>
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
                <div className="mb-8">
                    <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Historial de Ventas</h1>
                    <p className="text-sm" style={{ color: '#888' }}>
                        {pagination.totalItems || 0} ventas · Pág. {currentPage} de {pagination.totalPages || 1}
                    </p>
                </div>

                {/* FILTROS */}
                <div className="rounded-2xl p-5 mb-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

                    {/* Periodo */}
                    <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>PERIODO</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                        {[
                            { value: 'todo',   label: 'Todas' },
                            { value: 'ayer',   label: 'Ayer' },
                            { value: 'hoy',    label: 'Hoy' },
                            { value: 'semana', label: 'Semana' },
                            { value: 'mes',    label: 'Mes' },
                            { value: 'año',    label: 'Año' },
                        ].map(({ value, label }) => (
                            <button key={value} onClick={() => handleFiltroChange({ ...filtros, periodo: value })}
                                className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={filtros.periodo === value
                                    ? { background: '#222', color: '#fff' }
                                    : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Estado */}
                    <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>ESTADO</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[
                            { value: 'todo',      label: 'Todos' },
                            { value: 'pendiente', label: 'Pendientes' },
                            { value: 'pagado',    label: 'Pagadas' },
                        ].map(({ value, label }) => (
                            <button key={value} onClick={() => handleFiltroChange({ ...filtros, estado: value })}
                                className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={filtros.estado === value
                                    ? { background: '#222', color: '#fff' }
                                    : { background: '#f5f5f0', color: '#666', border: '0.5px solid #e0e0da' }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Resumen activo */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                        <p className="text-xs" style={{ color: '#aaa' }}>{historial.length} ventas encontradas</p>
                        <p className="text-xs" style={{ color: '#bbb' }}>{filtros.periodo} · {filtros.estado}</p>
                    </div>
                </div>

                {/* PAGINACIÓN SUPERIOR */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                        <span className="text-xs px-3" style={{ color: '#888' }}>Pág. {currentPage} de {pagination.totalPages}</span>
                        <button onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))} disabled={currentPage >= pagination.totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                    </div>
                )}

                {/* GRID HISTORIAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {historial.map(cuenta => (
                        <div key={cuenta.id} className="rounded-2xl p-5 transition-all duration-200"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

                            {/* Cabecera */}
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium" style={{ color: '#111' }}>Venta #{cuenta.id}</p>
                                <span className="text-xs px-2 py-0.5 rounded-md"
                                    style={cuenta.estado === 'pagado'
                                        ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                        : { background: '#fdfaf4', color: '#7a6a2a', border: '0.5px solid #e6d8a0' }}>
                                    {cuenta.estado === 'pagado' ? 'Pagada' : 'Pendiente'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 mb-4">
                                <p className="text-sm font-medium truncate" style={{ color: '#333' }}>{cuenta.cliente}</p>
                                {cuenta.mesa_id && (
                                    <p className="text-xs" style={{ color: '#aaa' }}>Mesa {cuenta.numero_mesa}</p>
                                )}
                                <p className="text-xs" style={{ color: '#bbb' }}>{formatFechaUTCWithTime(cuenta.fecha_creado)}</p>
                            </div>

                            {/* Total */}
                            <p className="text-2xl font-medium mb-4" style={{ color: '#111' }}>${formatDinero(cuenta.total)}</p>

                            {/* Botón */}
                            <button onClick={() => handleVerDetalle(cuenta.id)}
                                className="w-full py-2 rounded-lg text-xs font-medium transition-all"
                                style={{ background: '#f5f5f0', color: '#555', border: '0.5px solid #e0e0da' }}>
                                Ver Detalle
                            </button>
                        </div>
                    ))}
                </div>

                {/* VACÍO */}
                {historial.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <p className="text-sm mb-2" style={{ color: '#aaa' }}>No se encontraron ventas</p>
                        <p className="text-xs" style={{ color: '#ccc' }}>
                            {filtros.periodo === 'todo' && filtros.estado === 'todo'
                                ? 'Crea nuevas ventas para ver el historial'
                                : 'Ajusta los filtros para ver resultados'}
                        </p>
                    </div>
                )}

                {/* PAGINACIÓN INFERIOR */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>‹</button>
                        <span className="text-xs px-3" style={{ color: '#888' }}>Pág. {currentPage} de {pagination.totalPages}</span>
                        <button onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))} disabled={currentPage >= pagination.totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}>›</button>
                    </div>
                )}
            </div>
        </div>

        {/* ── MODAL DETALLE ────────────────────────────────────── */}
        {showDetailModal && selectedCuenta && (
            <>
            <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={handleCerrarDetalle} />
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
                    style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <div>
                            <h2 className="text-base font-medium" style={{ color: '#111' }}>Detalle Venta #{selectedCuenta.id}</h2>
                            <p className="text-xs" style={{ color: '#aaa' }}>
                                Total: <span className="font-medium" style={{ color: '#111' }}>${formatDinero(selectedCuenta.total)}</span>
                            </p>
                        </div>
                        <button onClick={handleCerrarDetalle} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                            <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Contenido scrollable */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">

                        {/* Información */}
                        <div className="rounded-xl p-4 mb-5" style={{ background: '#fafafa', border: '0.5px solid #f0f0ea' }}>
                            <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>INFORMACIÓN</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: '#aaa' }}>Cliente</span>
                                    <span className="font-medium" style={{ color: '#222' }}>{selectedCuenta.cliente}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: '#aaa' }}>Tipo</span>
                                    <span style={{ color: '#555' }}>{selectedCuenta.tipo_cuenta === 'mesa' ? 'Mesa' : 'Individual'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: '#aaa' }}>Estado</span>
                                    <span className="text-xs px-2 py-0.5 rounded-md"
                                        style={selectedCuenta.estado === 'pagado'
                                            ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                            : { background: '#fdfaf4', color: '#7a6a2a', border: '0.5px solid #e6d8a0' }}>
                                        {selectedCuenta.estado === 'pagado' ? 'Pagada' : 'Pendiente'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Productos */}
                        {selectedCuenta.detalles && selectedCuenta.detalles.length > 0 && (
                            <div>
                                <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>PRODUCTOS ({selectedCuenta.detalles.length})</p>
                                <div className="space-y-2">
                                    {selectedCuenta.detalles.map((detalle, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-xl"
                                            style={{ background: '#fafafa', border: '0.5px solid #f0f0ea' }}>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{detalle.descripcion}</p>
                                                <p className="text-xs" style={{ color: '#aaa' }}>{detalle.presentacion}</p>
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0">
                                                <p className="text-sm font-medium" style={{ color: '#111' }}>
                                                    ${formatDinero(detalle.precio_venta * detalle.cantidad_vendida)}
                                                </p>
                                                <p className="text-xs" style={{ color: '#bbb' }}>
                                                    {detalle.cantidad_vendida} × ${formatDinero(detalle.precio_venta)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 flex justify-end" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                        <button onClick={handleCerrarDetalle}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium"
                            style={{ background: '#222', color: '#fff', border: 'none' }}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
            </>
        )}
        </>
    );
};

export default Historial;