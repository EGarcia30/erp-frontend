import React, { useState, useEffect } from 'react';
import { getEmpresa, updateEmpresa } from '../services/empresa';
import { 
    SelectDepartamento, 
    SelectMunicipio, 
    SelectPais, 
    SelectActividadEconomica, 
    SelectTipoPersona, 
    SelectTipoDocumento,
    SelectTipoEstablecimiento
} from '../components/selects';

const Empresa = () => {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [empresa, setEmpresa] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchEmpresa = async () => {
        try {
            setLoading(true);
            const data = await getEmpresa();
            setEmpresa(data);
        } catch (err) {
            console.error("Error fetching empresa:", err);
            setMessage({ type: 'error', text: 'No se pudo cargar la configuración de la empresa' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmpresa();
    }, []);

    // Lógica de ubicación
    useEffect(() => {
        if (empresa && empresa.pais_cod !== 'SV' && empresa.departamento_cod !== '00') {
            setEmpresa(prev => ({ ...prev, departamento_cod: '00', municipio_cod: '00' }));
        }
    }, [empresa?.pais_cod]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmpresa({ ...empresa, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            await updateEmpresa(empresa);
            setMessage({ type: 'success', text: 'Configuración actualizada correctamente' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            fetchEmpresa();
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al actualizar la configuración' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
                <p className="text-sm" style={{ color: '#888' }}>Cargando datos de empresa...</p>
            </div>
        );
    }

    const isSV = empresa.pais_cod === 'SV';

    return (
        <div className="min-h-screen py-8 px-4 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.12)' }} />
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Mi Empresa</h1>
                    <p className="text-sm" style={{ color: '#888' }}>Configuración de los datos del Emisor DTE</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium border animate-in fade-in duration-300 ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                        {message.type === 'success' ? '✅ ' : '❌ '} {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECCIÓN 1: DATOS LEGALES */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h4 className="text-[11px] font-bold text-gray-900 border-b pb-2 tracking-widest uppercase">Identificación Legal</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Nombre Legal / Razón Social *</label>
                                <input name="nombre_legal" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                    value={empresa.nombre_legal} onChange={handleInputChange} required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Nombre Comercial</label>
                                <input name="nombre_comercial" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                    value={empresa.nombre_comercial} onChange={handleInputChange} />
                            </div>
                            <SelectTipoPersona value={empresa.tipo_persona} onChange={val => setEmpresa({...empresa, tipo_persona: val})} label="Tipo de Persona" />
                            <SelectTipoDocumento value={empresa.tipo_documento} onChange={val => setEmpresa({...empresa, tipo_documento: val})} label="Tipo Documento" />
                            <div>
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Número Documento (NIT) *</label>
                                <input name="num_documento" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                    value={empresa.num_documento} onChange={handleInputChange} required placeholder="0000-000000-000-0" />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">NRC *</label>
                                <input name="nrc" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                    value={empresa.nrc} onChange={handleInputChange} required placeholder="000000-0" />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: ACTIVIDAD Y ESTABLECIMIENTO */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h4 className="text-[11px] font-bold text-gray-900 border-b pb-2 tracking-widest uppercase">Actividad Económica</h4>
                        <div className="space-y-4">
                            <SelectActividadEconomica value={empresa.cod_actividad} onChange={val => setEmpresa({...empresa, cod_actividad: val})} />
                            <SelectTipoEstablecimiento value={empresa.tipo_establecimiento} onChange={val => setEmpresa({...empresa, tipo_establecimiento: val})} />
                        </div>
                    </div>

                    {/* SECCIÓN 3: UBICACIÓN */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h4 className="text-[11px] font-bold text-gray-900 border-b pb-2 tracking-widest uppercase">Ubicación y Contacto</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <SelectPais value={empresa.pais_cod} onChange={val => setEmpresa({...empresa, pais_cod: val})} />
                            </div>
                            <SelectDepartamento value={empresa.departamento_cod} onChange={val => setEmpresa({...empresa, departamento_cod: val, municipio_cod: ''})} disabled={!isSV} />
                            <SelectMunicipio departamentoCod={empresa.departamento_cod} value={empresa.municipio_cod} onChange={val => setEmpresa({...empresa, municipio_cod: val})} disabled={!isSV} />
                            <div className="md:col-span-2">
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Dirección Completa *</label>
                                <input name="direccion" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                    value={empresa.direccion} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Teléfono</label>
                                <input name="telefono" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                    value={empresa.telefono} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Correo de Contacto</label>
                                <input name="correo" type="email" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                    value={empresa.correo} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 4: CÓDIGOS MH (TÉCNICOS) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h4 className="text-[11px] font-bold text-gray-900 border-b pb-2 tracking-widest uppercase">Configuración Técnica (MH)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Cod. Estable. MH</label>
                                <input name="cod_estable_mh" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 font-mono"
                                    value={empresa.cod_estable_mh} onChange={handleInputChange} maxLength="4" />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Cod. Estable.</label>
                                <input name="cod_estable" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 font-mono"
                                    value={empresa.cod_estable} onChange={handleInputChange} maxLength="4" />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Cod. Punto Venta MH</label>
                                <input name="cod_punto_venta_mh" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 font-mono"
                                    value={empresa.cod_punto_venta_mh} onChange={handleInputChange} maxLength="4" />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Cod. Punto Venta</label>
                                <input name="cod_punto_venta" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 font-mono"
                                    value={empresa.cod_punto_venta} onChange={handleInputChange} maxLength="4" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={updating}
                            className="px-10 py-3 rounded-xl text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                            {updating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Empresa;
