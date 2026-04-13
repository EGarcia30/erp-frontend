// Dashboard.jsx
import React, { useState, useEffect } from 'react';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [productosStock, setProductosStock] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [formasPago, setFormasPago] = useState([]);
    const [vuelto, setVuelto] = useState({ total_vuelto: 0, transacciones_con_vuelto: 0 });
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('hoy');

    const utilNeta = (dashboard?.ventasPeriodo?.ingresos_periodo || 0) -
                     (dashboard?.ganancias?.costos || 0) -
                     (dashboard?.gastosOperativos?.gastos_operativos || 0);

    const cargarDashboard = async (periodoFiltro) => {
        try {
            setLoading(true);

            const [dashboardRes, productosRes, ventasRes, formasPagoRes, vueltoRes] = await Promise.all([
                fetch(`${apiURL}/dashboard?filtro=${periodoFiltro}`),
                fetch(`${apiURL}/dashboard/productos`),
                fetch(`${apiURL}/dashboard/ventas?page=1&limit=10&filtro=${periodoFiltro}`),
                fetch(`${apiURL}/dashboard/formas-pago?filtro=${periodoFiltro}`),
                fetch(`${apiURL}/dashboard/vuelto?filtro=${periodoFiltro}`),
            ]);

            const [dashboardData, productosData, ventasData, formasPagoData, vueltoData] = await Promise.all([
                dashboardRes.json(), productosRes.json(), ventasRes.json(),
                formasPagoRes.json(), vueltoRes.json(),
            ]);

            if (dashboardData.success) {
                setDashboard(dashboardData.data);
                setProductosStock(productosData.data);
                setVentas(ventasData.data);
                setFormasPago(formasPagoData.data);
                setVuelto(vueltoData.data);
                setPeriodo(periodoFiltro);
            }
        } catch (error) {
            console.error('Error cargando dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDashboard('hoy');
    }, []);

    const formatDinero = (numero) => Number(numero ?? 0).toLocaleString('es-SV', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const filtros = [
        { key: 'ayer',   label: 'Ayer' },
        { key: 'hoy',    label: 'Hoy' },
        { key: 'semana', label: 'Semana' },
        { key: 'mes',    label: 'Mes' },
        { key: 'año',    label: 'Año' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-medium" style={{ color: '#888' }}>Cargando dashboard...</p>
                </div>
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
                <div className="mb-10">
                    <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Reportes</h1>
                    <p className="text-sm" style={{ color: '#888' }}>Métricas en tiempo real · {new Date().toLocaleDateString('es-SV', { timeZone: 'America/El_Salvador' })}</p>
                </div>

                {/* FILTROS */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {filtros.map(f => (
                        <button
                            key={f.key}
                            onClick={() => cargarDashboard(f.key)}
                            className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            style={periodo === f.key
                                ? { background: '#222', color: '#fff', border: '0.5px solid #222' }
                                : { background: '#fff', color: '#555', border: '0.5px solid #e0e0da' }
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* FORMAS DE PAGO */}
                {formasPago.length > 0 && (
                    <div className="mb-8">
                        <p className="text-xs tracking-widest mb-4" style={{ color: '#999' }}>FORMAS DE PAGO</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {formasPago.map((fp, index) => (
                                <div key={fp.codigo || index} className="rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs tracking-widest" style={{ color: '#999' }}>{fp.codigo?.toUpperCase()}</p>
                                        <span className="text-xs px-2 py-1 rounded-md" style={{ background: '#f5f5f0', color: '#888' }}>{fp.porcentaje}%</span>
                                    </div>
                                    <p className="text-2xl font-medium mb-1" style={{ color: '#111' }}>${formatDinero(fp.total_ventas)}</p>
                                    <p className="text-xs" style={{ color: '#aaa' }}>{fp.nombre} · {fp.total_transacciones} trans.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MÉTRICAS PRINCIPALES */}
                <div className="mb-8">
                    <p className="text-xs tracking-widest mb-4" style={{ color: '#999' }}>RESUMEN · {periodo.toUpperCase()}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                        {/* Ventas */}
                        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                            <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>VENTAS</p>
                            <p className="text-3xl font-medium mb-1" style={{ color: '#111' }}>${formatDinero(dashboard?.ventasPeriodo?.ingresos_periodo)}</p>
                            <p className="text-xs" style={{ color: '#aaa' }}>{dashboard?.ventasPeriodo?.ventas_periodo || 0} ventas</p>
                        </div>

                        {/* Costo productos */}
                        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                            <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>COSTO PRODUCTOS</p>
                            <p className="text-3xl font-medium mb-1" style={{ color: '#111' }}>${formatDinero(dashboard?.ganancias?.costos)}</p>
                            <p className="text-xs" style={{ color: '#aaa' }}>Costo de ventas ({periodo})</p>
                        </div>

                        {/* Gastos operativos */}
                        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                            <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>GASTOS OPERATIVOS</p>
                            <p className="text-3xl font-medium mb-1" style={{ color: '#111' }}>${formatDinero(dashboard?.gastosOperativos?.gastos_operativos)}</p>
                            <p className="text-xs" style={{ color: '#aaa' }}>{dashboard?.gastosOperativos?.total_gastos || 0} gastos</p>
                        </div>

                        {/* Vuelto */}
                        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                            <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>VUELTO</p>
                            <p className="text-3xl font-medium mb-1" style={{ color: '#111' }}>${formatDinero(vuelto?.total_vuelto)}</p>
                            <p className="text-xs" style={{ color: '#aaa' }}>{vuelto?.transacciones_con_vuelto || 0} transacciones</p>
                        </div>

                        {/* Formas de pago total */}
                        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                            <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>TOTAL FORMAS DE PAGO</p>
                            <p className="text-3xl font-medium mb-1" style={{ color: '#111' }}>
                                ${formatDinero(formasPago.reduce((acc, fp) => acc + (parseFloat(fp.total_ventas) || 0), 0))}
                            </p>
                            <p className="text-xs" style={{ color: '#aaa' }}>{formasPago.length} formas de pago</p>
                        </div>

                        {/* Utilidad neta */}
                        <div className="rounded-2xl p-6" style={{ background: utilNeta >= 0 ? '#f4faf4' : '#fdf4f4', border: `0.5px solid ${utilNeta >= 0 ? '#c8e6c8' : '#f0d0d0'}`, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                            <p className="text-xs tracking-widest mb-3" style={{ color: '#999' }}>UTILIDAD NETA</p>
                            <p className="text-3xl font-medium mb-1" style={{ color: utilNeta >= 0 ? '#2a7a2a' : '#a03030' }}>${formatDinero(utilNeta)}</p>
                            <p className="text-xs" style={{ color: utilNeta >= 0 ? '#6aaa6a' : '#c07070' }}>{utilNeta >= 0 ? 'Ganancia' : 'Pérdida'}</p>
                        </div>
                    </div>
                </div>

                {/* STOCK CRÍTICO + TOP PRODUCTOS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* Stock crítico */}
                    <div className="rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm font-medium" style={{ color: '#111' }}>Stock Crítico</p>
                            <span className="text-xs px-3 py-1 rounded-md" style={{ background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>
                                {parseInt(dashboard?.stockCritico) || 0} productos
                            </span>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {productosStock.slice(0, 6).map(producto => (
                                <div key={producto.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fafafa', border: '0.5px solid #e8e8e2' }}>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{producto.descripcion}</p>
                                        <p className="text-xs" style={{ color: '#aaa' }}>{producto.presentacion}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-medium" style={{ color: producto.status === 'danger' ? '#a03030' : producto.status === 'warning' ? '#a06030' : '#2a7a2a' }}>
                                            {parseInt(producto.cantidad_disponible)}
                                        </p>
                                        <p className="text-xs" style={{ color: '#ccc' }}>mín {parseInt(producto.cantidad_minima)}</p>
                                    </div>
                                </div>
                            ))}
                            {productosStock.length === 0 && (
                                <p className="text-center py-10 text-sm" style={{ color: '#aaa' }}>Sin productos críticos</p>
                            )}
                        </div>
                    </div>

                    {/* Top productos */}
                    <div className="rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                        <p className="text-sm font-medium mb-6" style={{ color: '#111' }}>Top Productos <span style={{ color: '#aaa', fontWeight: 400 }}>({periodo})</span></p>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {dashboard?.topProductos?.slice(0, 6).map((prod, i) => (
                                <div key={prod.descripcion} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fafafa', border: '0.5px solid #e8e8e2' }}>
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className="text-xs font-medium w-6 text-right flex-shrink-0" style={{ color: '#bbb' }}>#{i + 1}</span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{prod.descripcion}</p>
                                            <p className="text-xs" style={{ color: '#aaa' }}>{prod.presentacion}</p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-medium" style={{ color: '#111' }}>${parseFloat(prod.ingresos || 0).toLocaleString('es-SV')}</p>
                                        <p className="text-xs" style={{ color: '#aaa' }}>{prod.total_vendido || 0} unid.</p>
                                    </div>
                                </div>
                            )) || <p className="text-center py-10 text-sm" style={{ color: '#aaa' }}>Sin datos</p>}
                        </div>
                    </div>
                </div>

                {/* ÚLTIMAS VENTAS */}
                <div className="rounded-2xl p-6 mb-8" style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                    <p className="text-sm font-medium mb-6" style={{ color: '#111' }}>Últimas Ventas <span style={{ color: '#aaa', fontWeight: 400 }}>({periodo})</span></p>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr style={{ borderBottom: '0.5px solid #e8e8e2' }}>
                                    {['Cliente', 'Total', 'Estado', 'Items', 'Fecha'].map(h => (
                                        <th key={h} className="text-left py-3 px-3 text-xs tracking-widest font-medium" style={{ color: '#999' }}>{h.toUpperCase()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ventas.map(venta => (
                                    <tr key={venta.id} style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                                        <td className="py-3 px-3 text-sm font-medium max-w-[180px] truncate" style={{ color: '#222' }}>{venta.cliente || 'Walk-in'}</td>
                                        <td className="py-3 px-3 text-sm font-medium" style={{ color: '#111' }}>${parseFloat(venta.total || 0).toLocaleString('es-SV', { minimumFractionDigits: 2 })}</td>
                                        <td className="py-3 px-3">
                                            <span className="text-xs px-2 py-1 rounded-md" style={venta.estado === 'pagado'
                                                ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                                : { background: '#fdfaf4', color: '#7a6a2a', border: '0.5px solid #e6d8a0' }
                                            }>
                                                {venta.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-sm" style={{ color: '#888' }}>{venta.items || 0}</td>
                                        <td className="py-3 px-3 text-sm" style={{ color: '#888' }}>{new Date(venta.fecha_creado).toLocaleDateString('es-SV')}</td>
                                    </tr>
                                ))}
                                {ventas.length === 0 && (
                                    <tr><td colSpan="5" className="py-10 text-center text-sm" style={{ color: '#aaa' }}>Sin ventas recientes</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FOOTER */}
                <p className="text-center text-xs" style={{ color: '#bbb' }}>
                    Actualizado: {new Date().toLocaleString('es-SV', { timeZone: 'America/El_Salvador' })} · UTC-6
                </p>
            </div>
        </div>
    );
};

export default Dashboard;