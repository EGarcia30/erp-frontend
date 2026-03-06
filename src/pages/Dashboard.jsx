// Dashboard.jsx - COMPLETO con MEJOR RESPONSIVO ✅
import React, { useState, useEffect } from 'react';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [productosStock, setProductosStock] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('turno');

    const obtenerTurnoActualSV = () => {
        const ahora = new Date();
        const hora = ahora.getHours();
        return (hora >= 17 || hora < 6);
    };

    const horaSV = () => new Date().toLocaleString('es-SV', {
        timeZone: 'America/El_Salvador',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    // ✅ UTILIDAD NETA CALCULADA
    const utilNeta = (dashboard?.ventasPeriodo?.ingresos_periodo || 0) - 
                     (dashboard?.ganancias?.costos || 0) - 
                     (dashboard?.gastosOperativos?.gastos_operativos || 0);

    const cargarDashboard = async (periodoFiltro) => {
        try {
            setLoading(true);
            
            const dashboardRes = await fetch(`${apiURL}/dashboard?filtro=${periodoFiltro}`);
            const dashboardData = await dashboardRes.json();
            
            const productosRes = await fetch(`${apiURL}/dashboard/productos`);
            const productosData = await productosRes.json();
            
            const ventasRes = await fetch(`${apiURL}/dashboard/ventas?page=1&limit=10&filtro=${periodoFiltro}`);
            const ventasData = await ventasRes.json();

            if (dashboardData.success && productosData.success && ventasData.success) {
                setDashboard(dashboardData.data);
                setProductosStock(productosData.data);
                setVentas(ventasData.data);
                setPeriodo(periodoFiltro);
            }
        } catch (error) {
            console.error('Error cargando dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDashboard('turno');
    }, []);

    const formatDinero = (numero) => {
        return Number(numero ?? 0).toLocaleString('es-SV', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const esTurnoNoche = obtenerTurnoActualSV();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-2xl font-bold text-gray-700">Cargando Dashboard SV...</p>
                    <p className="text-sm text-gray-500 mt-2">🕐 America/El_Salvador</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-6 px-3 sm:py-8 sm:px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* HEADER CON RELOJ SV - MEJOR RESPONSIVO */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
                        <div className="bg-white/90 backdrop-blur-xl px-4 sm:px-6 py-3 rounded-2xl border border-emerald-200 shadow-xl w-full sm:w-auto">
                            <span className="text-xl sm:text-2xl lg:text-3xl font-black">{horaSV()}</span>
                            <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-bold text-gray-600 block sm:inline">SV</span>
                        </div>
                        <div className={`px-3 sm:px-4 py-2 rounded-2xl font-bold text-sm shadow-lg w-full sm:w-auto text-center ${
                            esTurnoNoche 
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        }`}>
                            {esTurnoNoche ? '🌙 TURNO NOCHE' : '☀️ TURNO DÍA'}
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 leading-tight">
                        📊 Reportes
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                        Métricas en tiempo real.
                    </p>
                </div>

                {/* FILTRO - MEJOR RESPONSIVO */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/50 mb-12 sm:mb-16">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap justify-center items-center gap-3 sm:gap-4 mb-6">
                        {[
                            { key: 'turno', label: '🌙 TURNO (5:00p.m-06:00a.m.)', color: 'purple' },
                            { key: 'hoy', label: '📅 Hoy', color: 'emerald' },
                            { key: 'semana', label: '📊 Semana', color: 'blue' },
                            { key: 'mes', label: '📈 Mes', color: 'indigo' },
                            { key: 'año', label: '📉 Año', color: 'orange' }
                        ].map(filtro => (
                            <button
                                key={filtro.key}
                                onClick={() => cargarDashboard(filtro.key)}
                                className={`group px-3 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl transition-all duration-300 hover:scale-105 border-2 flex-1 min-w-[140px] lg:min-w-0 ${
                                    periodo === filtro.key
                                        ? `bg-gradient-to-r from-${filtro.color}-500 to-${filtro.color}-600 shadow-${filtro.color}-400/50 border-${filtro.color}-400 text-white`
                                        : `bg-white hover:bg-${filtro.color}-50 text-gray-800 border-gray-200 hover:border-${filtro.color}-300 hover:shadow-${filtro.color}-200`
                                }`}
                            >
                                <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform block mb-1">{filtro.label.split(' ')[0]}</span>
                                <span className="text-xs sm:text-sm">{filtro.label.split(' ').slice(1).join(' ')}</span>
                            </button>
                        ))}
                    </div>
                    <div className="text-center">
                        <span className="text-base sm:text-lg font-bold text-gray-700 bg-gray-100 px-4 sm:px-6 py-3 rounded-2xl inline-block">
                            Período activo: <span className={`text-${periodo === 'turno' ? 'purple' : 'emerald'}-600 font-black`}>{periodo.toUpperCase()}</span>
                        </span>
                    </div>
                </div>

                {/* ✅ 4 CARTAS PRINCIPALES - RESPONSIVO MEJORADO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
                    {/* 1. GASTOS OPERATIVOS */}
                    <div className="group bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 border-4 border-amber-200/50 backdrop-blur-xl h-full">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <span className="text-2xl sm:text-3xl lg:text-4xl">🏢</span>
                            <span className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-lg whitespace-nowrap">GASTOS OP.</span>
                        </div>
                        <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-amber-600 mb-2 sm:mb-4 leading-tight">
                            ${formatDinero(dashboard?.gastosOperativos?.gastos_operativos)}
                        </p>
                        <p className="text-lg sm:text-xl font-semibold text-gray-700 text-sm sm:text-base">
                            {dashboard?.gastosOperativos?.total_gastos || 0} gastos ({periodo})
                        </p>
                    </div>

                    {/* 2. COSTO PRODUCTOS */}
                    <div className="group bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 border-4 border-red-200/50 backdrop-blur-xl h-full">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <span className="text-2xl sm:text-3xl lg:text-4xl">💸</span>
                            <span className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-lg whitespace-nowrap">COSTO PROD.</span>
                        </div>
                        <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-red-600 mb-2 sm:mb-4 leading-tight">
                            ${formatDinero(dashboard?.ganancias?.costos)}
                        </p>
                        <p className="text-lg sm:text-xl font-semibold text-gray-700 text-sm sm:text-base">Productos ({periodo})</p>
                    </div>

                    {/* 3. VENTAS */}
                    <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 border-4 border-emerald-200/50 backdrop-blur-xl h-full">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <span className="text-2xl sm:text-3xl lg:text-4xl">💰</span>
                            <span className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-lg whitespace-nowrap">VENTAS</span>
                        </div>
                        <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-emerald-600 mb-2 sm:mb-4 leading-tight">
                            ${formatDinero(dashboard?.ventasPeriodo?.ingresos_periodo)}
                        </p>
                        <p className="text-lg sm:text-xl font-semibold text-gray-700 text-sm sm:text-base">
                            {dashboard?.ventasPeriodo?.ventas_periodo || 0} ventas
                        </p>
                    </div>

                    {/* 4. UTILIDAD NETA */}
                    <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 border-4 border-blue-200/50 backdrop-blur-xl h-full">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <span className="text-2xl sm:text-3xl lg:text-4xl">📈</span>
                            <span className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-bold shadow-lg text-white text-xs sm:text-sm whitespace-nowrap ${
                                utilNeta >= 0 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                                    : 'bg-gradient-to-r from-red-500 to-rose-600'
                            }`}>
                                UTILIDAD NETA
                            </span>
                        </div>
                        <p className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-2 sm:mb-4 leading-tight ${
                            utilNeta >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                            ${formatDinero(utilNeta)}
                        </p>
                        <p className={`text-lg sm:text-xl font-semibold text-sm sm:text-base ${
                            utilNeta >= 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                            {utilNeta >= 0 ? '💰 Ganancia' : '📉 Pérdida'}
                        </p>
                    </div>
                </div>

                {/* STOCK CRÍTICO + TOP PRODUCTOS - MEJOR RESPONSIVO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16">
                    {/* STOCK CRÍTICO */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/50">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            📦 Stock Crítico
                            <span className="px-3 sm:px-5 py-1.5 sm:py-2 bg-red-100 text-red-800 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl shadow-lg whitespace-nowrap">
                                {parseInt(dashboard?.stockCritico) || 0}
                            </span>
                        </h3>
                        <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 lg:max-h-[inherit] overflow-y-auto">
                            {productosStock.slice(0, 6).map(producto => (
                                <div key={producto.id} className={`p-4 sm:p-6 rounded-2xl border-l-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                    producto.status === 'danger' ? 'bg-red-50 border-red-500' :
                                    producto.status === 'warning' ? 'bg-orange-50 border-orange-500' : 
                                    'bg-emerald-50 border-emerald-500'
                                }`}>
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
                                        <span className="text-xl sm:text-3xl flex-shrink-0">🍺</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-lg sm:text-xl text-gray-900 truncate">{producto.descripcion}</p>
                                            <p className="text-xs sm:text-sm text-gray-600">{producto.presentacion}</p>
                                        </div>
                                    </div>
                                    <div className="text-right w-full sm:w-auto">
                                        <p className={`text-2xl sm:text-3xl font-black ${
                                            producto.status === 'danger' ? 'text-red-600' :
                                            producto.status === 'warning' ? 'text-orange-600' : 'text-emerald-600'
                                        }`}>
                                            {parseInt(producto.cantidad_disponible)}
                                        </p>
                                        <p className="text-xs sm:text-xs text-gray-500">mín: {parseInt(producto.cantidad_minima)}</p>
                                    </div>
                                </div>
                            ))}
                            {productosStock.length === 0 && (
                                <p className="text-gray-500 text-center py-16 sm:py-20 text-lg sm:text-xl">✅ Sin productos críticos</p>
                            )}
                        </div>
                    </div>

                    {/* TOP PRODUCTOS */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/50">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                            🏆 Top Productos <span className="text-base sm:text-lg text-gray-500">({periodo})</span>
                        </h3>
                        <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 lg:max-h-[inherit] overflow-y-auto">
                            {dashboard?.topProductos?.slice(0, 6).map((prod, i) => (
                                <div key={prod.descripcion} className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 via-blue-50 to-emerald-50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-xl transition-all border border-emerald-200/50">
                                    <div className="flex items-center gap-3 sm:gap-4 w-full">
                                        <span className="w-10 sm:w-14 h-10 sm:h-14 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-lg sm:text-2xl shadow-2xl flex-shrink-0">
                                            #{i + 1}
                                        </span>
                                        <span className="text-xl sm:text-3xl flex-shrink-0">🍺</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-lg sm:text-xl text-gray-900 truncate">{prod.descripcion}</p>
                                            <p className="text-xs sm:text-sm text-gray-600">{prod.presentacion}</p>
                                        </div>
                                    </div>
                                    <div className="text-right w-full sm:w-auto">
                                        <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                                            ${parseFloat(prod.ingresos || 0).toLocaleString('es-SV')}
                                        </p>
                                        <p className="text-base sm:text-lg text-gray-600">{prod.total_vendido || 0} unid.</p>
                                    </div>
                                </div>
                            )) || <p className="text-gray-500 text-center py-16 sm:py-20 text-lg sm:text-xl">📈 Sin datos</p>}
                        </div>
                    </div>
                </div>

                {/* ÚLTIMAS VENTAS - MEJOR RESPONSIVO */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/50 overflow-hidden mb-12 sm:mb-16">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-3 flex-wrap">
                        💸 Últimas Ventas <span className="text-base sm:text-lg text-gray-500">({periodo})</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] sm:min-w-[750px]">
                            <thead>
                                <tr className="border-b-4 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="text-left py-4 sm:py-6 px-3 sm:px-6 font-bold text-lg sm:text-xl text-gray-900">Cliente</th>
                                    <th className="text-left py-4 sm:py-6 px-3 sm:px-6 font-bold text-lg sm:text-xl text-gray-900 hidden sm:table-cell">Total</th>
                                    <th className="text-left py-4 sm:py-6 px-3 sm:px-6 font-bold text-lg sm:text-xl text-gray-900 hidden sm:table-cell">Estado</th>
                                    <th className="text-left py-4 sm:py-6 px-3 sm:px-6 font-bold text-lg sm:text-xl text-gray-900 hidden sm:table-cell">Items</th>
                                    <th className="text-right py-4 sm:py-6 px-3 sm:px-6 font-bold text-lg sm:text-xl text-gray-900">Fecha SV</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventas.map(venta => (
                                    <tr key={venta.id} className="border-b-2 border-gray-100 hover:bg-emerald-50/50 transition-all">
                                        <td className="py-4 sm:py-6 px-3 sm:px-6 font-bold text-base sm:text-lg text-gray-900 max-w-[200px] truncate">
                                            {venta.cliente || '👤 Cliente walk-in'}
                                        </td>
                                        <td className="py-4 sm:py-6 px-3 sm:px-6 font-black text-lg sm:text-2xl text-emerald-600 hidden sm:table-cell">
                                            ${parseFloat(venta.total || 0).toLocaleString('es-SV', {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="py-4 sm:py-6 px-3 sm:px-6 hidden sm:table-cell">
                                            <span className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold shadow-lg ${
                                                venta.estado === 'pagado' 
                                                    ? 'bg-emerald-100 text-emerald-800 shadow-emerald-300/50' 
                                                    : 'bg-orange-100 text-orange-800 shadow-orange-300/50'
                                            }`}>
                                                {venta.estado === 'pagado' ? '✅ PAGADO' : '⏳ PENDIENTE'}
                                            </span>
                                        </td>
                                        <td className="py-4 sm:py-6 px-3 sm:px-6 font-bold text-base sm:text-xl text-gray-900 hidden sm:table-cell">{venta.items || 0}</td>
                                        <td className="py-4 sm:py-6 px-3 sm:px-6 text-base sm:text-lg text-gray-700 font-semibold text-right">
                                            {new Date(venta.fecha_creado).toLocaleDateString('es-SV')}
                                        </td>
                                    </tr>
                                ))}
                                {ventas.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-16 sm:py-20 text-center text-gray-500 text-lg sm:text-xl">
                                            Sin ventas recientes
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FOOTER - MEJOR RESPONSIVO */}
                <div className="text-center py-8 sm:py-12 bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-emerald-200/50 shadow-xl">
                    <p className="text-xl sm:text-2xl font-bold text-emerald-700 mb-3 sm:mb-4">
                        🕐 Actualizado: {new Date().toLocaleString('es-SV', { timeZone: 'America/El_Salvador' })}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-base sm:text-lg text-gray-600">
                        <span>📍 America/El_Salvador (UTC-6)</span>
                        <span className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-100 text-emerald-800 rounded-xl sm:rounded-2xl font-bold shadow-lg">
                            Turno 5:00p.m.-06:00a.m.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;