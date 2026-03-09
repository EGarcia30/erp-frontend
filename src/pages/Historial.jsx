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

    const formatFechaUTC = (fechaUTC) => {
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


    // ✅ Carga inicial
    useEffect(() => {
        fetchHistorial(1);
    }, []);

    // ✅ Recarga por página o filtros
    useEffect(() => {
        fetchHistorial(currentPage, filtros);
    }, [currentPage, fetchHistorial]);

    if (loading && historial.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Cargando historial...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8 px-4 sm:py-12 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* HEADER */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-12 gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                                📊 Historial Cuentas
                            </h1>
                            <p className="text-xl text-gray-600">
                                {pagination.totalItems || 0} cuentas | Pg {currentPage} de {pagination.totalPages || 1}
                            </p>
                        </div>
                    </div>

                    {/* FILTROS CHIPS - MODERNOS */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 sm:p-8 shadow-2xl mb-12">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                            🔧 Filtros Activos
                        </h3>
                        
                        {/* FILTRO PERIODO */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {[
                                { value: 'todo', label: '📅 Todas' },
                                { value: 'ayer', label: '🌙 Ayer' },
                                { value: 'hoy', label: '🌅 Hoy' },
                                { value: 'semana', label: '📊 Semana' },
                                { value: 'mes', label: '📈 Mes' },
                                { value: 'año', label: '📅 Año' }
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleFiltroChange({ ...filtros, periodo: value })}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md ${
                                        filtros.periodo === value
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/50 scale-105'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-lg'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* FILTRO ESTADO */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {[
                                { value: 'todo', label: '💳 Todos' },
                                { value: 'pendiente', label: '⏳ Pendientes' },
                                { value: 'pagado', label: '✅ Pagadas' }
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleFiltroChange({ ...filtros, estado: value })}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-md ${
                                        filtros.estado === value
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/50 scale-105'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:shadow-lg border border-emerald-200'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* INFO ACTUAL */}
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                            <p className="text-lg font-bold text-gray-800">
                                {historial.length} cuentas encontradas
                            </p>
                            <p className="text-sm text-gray-600">
                                {filtros.periodo} / {filtros.estado} | Pg {currentPage}
                            </p>
                        </div>
                    </div>

                    {/* PAGINACIÓN */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mb-12 p-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                            <button 
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage <= 1}
                                className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                ‹
                            </button>
                            <span className="text-xl font-bold text-gray-700 min-w-[120px] text-center">
                                {currentPage} de {pagination.totalPages}
                            </span>
                            <button 
                                onClick={() => handlePageChange(Math.min(pagination.totalPages || 1, currentPage + 1))}
                                disabled={currentPage >= (pagination.totalPages || 1)}
                                className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                ›
                            </button>
                        </div>
                    )}

                    {/* GRID DE CUENTAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {historial.map(cuenta => (
                            <div key={cuenta.id} className="group bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-white/50 hover:border-purple-200/50 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent line-clamp-1">
                                        #{cuenta.id}
                                    </h3>
                                    <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                                        cuenta.estado === 'pagado'
                                            ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-emerald-500/25'
                                            : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-500/25'
                                    }`}>
                                        {cuenta.estado === 'pagado' ? '✅ PAGADA' : '⏳ PENDIENTE'}
                                    </span>
                                </div>
                                
                                <div className="space-y-4 mb-8">
                                    <p className="text-lg font-semibold text-gray-900">{cuenta.cliente}</p>
                                    {cuenta.mesa_id && (
                                        <p className="flex items-center gap-2 text-gray-700">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                            Mesa {cuenta.numero_mesa}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        {formatFechaUTC(cuenta.fecha_creado)}
                                    </p>
                                </div>

                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 mb-8 p-6 bg-emerald-50/50 rounded-2xl shadow-inner">
                                    ${formatDinero(cuenta.total)}
                                </div>

                                <button 
                                    onClick={() => handleVerDetalle(cuenta.id)}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Ver Detalle
                                </button>
                            </div>
                        ))}
                    </div>

                    {historial.length === 0 && !loading && (
                        <div className="text-center py-24">
                            <div className="text-8xl mb-8">📋</div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">No se encontraron cuentas</h2>
                            <p className="text-xl text-gray-600 mb-8">
                                {filtros.periodo === 'todo' && filtros.estado === 'todo' 
                                    ? 'Crea nuevas cuentas para ver el historial'
                                    : 'Ajusta los filtros para ver resultados'
                                }
                            </p>
                            <div className="text-sm text-gray-500 bg-gray-100 p-4 rounded-2xl">
                                Filtros: {filtros.periodo} / {filtros.estado}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DETALLE */}
            {showDetailModal && selectedCuenta && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="w-full max-w-4xl max-h-[90vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 animate-in slide-in-from-bottom-4">
                        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        Detalle Cuenta #{selectedCuenta.id}
                                    </h2>
                                    <p className="text-xl text-gray-600">
                                        Total: <span className="text-2xl font-bold text-emerald-600">${formatDinero(selectedCuenta.total)}</span>
                                    </p>
                                </div>
                                <button onClick={handleCerrarDetalle} className="p-3 rounded-2xl hover:bg-gray-200 transition-all">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-2xl">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">👤 Información</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><strong>Cliente:</strong> {selectedCuenta.cliente}</div>
                                        <div><strong>Tipo:</strong> {selectedCuenta.tipo_cuenta === 'mesa' ? '🪑 Mesa' : '👤 Individual'}</div>
                                        {selectedCuenta.mesa_id && <div><strong>Mesa:</strong> {selectedCuenta.numero_mesa}</div>}
                                        <div><strong>Estado:</strong> 
                                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                                                selectedCuenta.estado === 'pagado' 
                                                    ? 'bg-emerald-100 text-emerald-800' 
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {selectedCuenta.estado === 'pagado' ? '✅ Pagada' : '⏳ Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedCuenta.detalles && selectedCuenta.detalles.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">🛒 Productos ({selectedCuenta.detalles.length})</h3>
                                        <div className="space-y-4">
                                            {selectedCuenta.detalles.map((detalle, index) => (
                                                <div key={index} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-lg text-gray-900 mb-1">{detalle.descripcion}</p>
                                                            <p className="text-gray-600">{detalle.presentacion}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4 lg:ml-auto">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-emerald-600">
                                                                    ${formatDinero(detalle.precio_venta * detalle.cantidad_vendida)}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Cant: {detalle.cantidad_vendida} x ${formatDinero(detalle.precio_venta)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Historial;