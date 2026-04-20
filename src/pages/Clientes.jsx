import React, { useState, useEffect } from 'react';
import { getClientes, createCliente, updateCliente, toggleClienteActivo } from '../services/clientes';
import { SelectDepartamento, SelectMunicipio, SelectPais, SelectActividadEconomica, SelectTipoPersona, SelectTipoDocumento } from '../components/selects';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);

    const initialFormState = {
        tipo_documento: '13',
        num_documento: '',
        nrc: '',
        nombre: '',
        cod_actividad: '',
        direccion: '',
        pais_cod: 'SV',
        departamento_cod: '',
        municipio_cod: '',
        telefono: '',
        correo: '',
        tipo_persona: '1', // 1 = Persona Natural (CAT-029)
        activo: true
    };

    const [createForm, setCreateForm] = useState(initialFormState);
    const [editForm, setEditForm] = useState(initialFormState);

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const data = await getClientes();
            setClientes(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching clientes:", err);
            setError("Error al cargar los clientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 1000);
        return () => clearTimeout(delayDebounce);
    }, [searchInput]);

    // Lógica de ubicación dependiente del país para Crear
    useEffect(() => {
        if (createForm.pais_cod !== 'SV') {
            setCreateForm(prev => ({ ...prev, departamento_cod: '00', municipio_cod: '00' }));
        } else if (createForm.departamento_cod === '00') {
            setCreateForm(prev => ({ ...prev, departamento_cod: '', municipio_cod: '' }));
        }
    }, [createForm.pais_cod]);

    // Lógica de ubicación dependiente del país para Editar
    useEffect(() => {
        if (editForm.pais_cod !== 'SV') {
            setEditForm(prev => ({ ...prev, departamento_cod: '00', municipio_cod: '00' }));
        } else if (editForm.departamento_cod === '00') {
            setEditForm(prev => ({ ...prev, departamento_cod: '', municipio_cod: '' }));
        }
    }, [editForm.pais_cod]);

    const handleOpenCreate = () => {
        setCreateForm(initialFormState);
        setShowCreateModal(true);
    };

    const handleOpenEdit = (cliente) => {
        setEditForm({
            ...cliente,
            departamento_cod: cliente.departamento_cod || '',
            municipio_cod: cliente.municipio_cod || '',
            tipo_persona: cliente.tipo_persona || '1',
            tipo_documento: cliente.tipo_documento || '13'
        });
        setShowEditModal(true);
    };

    const handleOpenToggle = (cliente) => {
        setSelectedCliente(cliente);
        setShowToggleModal(true);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            setUpdating('new');
            await createCliente(createForm);
            setShowCreateModal(false);
            fetchClientes();
        } catch (err) {
            alert(err.response?.data?.error || "Error al crear cliente");
        } finally {
            setUpdating(null);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setUpdating(editForm.id);
            await updateCliente(editForm.id, editForm);
            setShowEditModal(false);
            fetchClientes();
        } catch (err) {
            alert(err.response?.data?.error || "Error al actualizar cliente");
        } finally {
            setUpdating(null);
        }
    };

    const handleConfirmToggle = async () => {
        if (!selectedCliente) return;
        try {
            setUpdating(selectedCliente.id);
            await toggleClienteActivo(selectedCliente.id, !selectedCliente.activo);
            setShowToggleModal(false);
            fetchClientes();
        } catch (err) {
            alert("Error al cambiar estado");
        } finally {
            setUpdating(null);
        }
    };

    const filteredClientes = clientes.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.num_documento.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-4" />
                <p className="text-sm" style={{ color: '#888' }}>Cargando clientes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f8f6 0%, #eeeee8 40%, #e8ede8 100%)' }}>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.12)' }} />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(163,181,163,0.08)' }} />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-medium mb-1" style={{ color: '#111' }}>Clientes</h1>
                        <p className="text-sm" style={{ color: '#888' }}>Gestión de receptores DTE</p>
                    </div>
                    <button onClick={handleOpenCreate}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{ background: '#222', color: '#fff', border: 'none' }}>
                        + Nuevo Cliente
                    </button>
                </div>

                <div className="mb-6 max-w-md">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="search" placeholder="Buscar por nombre o documento..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg outline-none transition-all"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#222' }} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {filteredClientes.map((cliente) => (
                        <div key={cliente.id} className="rounded-2xl p-5 transition-all duration-200"
                            style={{ background: '#fff', border: '0.5px solid #e0e0da', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                            <div className="flex items-start justify-between mb-3 gap-2">
                                <h3 className="text-sm font-medium leading-tight line-clamp-2 flex-1" style={{ color: '#111' }}>
                                    {cliente.nombre}
                                </h3>
                                <span className="text-xs px-2 py-0.5 rounded-md flex-shrink-0"
                                    style={cliente.activo
                                        ? { background: '#f4faf4', color: '#2a7a2a', border: '0.5px solid #c8e6c8' }
                                        : { background: '#fdf4f4', color: '#a03030', border: '0.5px solid #f0d0d0' }}>
                                    {cliente.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="space-y-1.5 mb-4">
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Tipo Persona</span>
                                    <span className="font-medium" style={{ color: '#555' }}>{cliente.tipo_persona_nombre || (cliente.tipo_persona === '1' ? 'Natural' : ( cliente.tipo_persona === '2' ? 'Jurídica' : '-'))}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>{cliente.tipo_documento_nombre || (cliente.tipo_documento === '13' ? 'DUI' : 'Doc.')}</span>
                                    <span className="font-medium" style={{ color: '#555' }}>{cliente.num_documento}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>País</span>
                                    <span className="font-medium" style={{ color: '#555' }}>{cliente.pais_nombre || cliente.pais_cod}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: '#aaa' }}>Ubicación</span>
                                    <span className="font-medium truncate ml-2 max-w-[150px] text-right" style={{ color: '#555' }}>
                                        {cliente.departamento_nombre || '-'}, {cliente.municipio_nombre || '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-3 gap-2" style={{ borderTop: '0.5px solid #f0f0ea' }}>
                                <button onClick={() => handleOpenEdit(cliente)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                    style={{ background: '#f0f4ff', border: '0.5px solid #c8d8f0', color: '#3060a0' }}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button onClick={() => handleOpenToggle(cliente)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                    style={cliente.activo
                                        ? { background: '#fdf4f4', border: '0.5px solid #f0d0d0', color: '#a03030' }
                                        : { background: '#f4faf4', border: '0.5px solid #c8e6c8', color: '#2a7a2a' }}>
                                    {cliente.activo ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredClientes.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <p className="text-sm mb-4" style={{ color: '#aaa' }}>No se encontraron clientes</p>
                        <button onClick={handleOpenCreate}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium"
                            style={{ background: '#222', color: '#fff' }}>
                            + Registrar Primer Cliente
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL CREAR */}
            {showCreateModal && (
                <ClienteFormModal 
                    title="Nuevo Cliente"
                    form={createForm}
                    setForm={setCreateForm}
                    onSubmit={handleCreateSubmit}
                    onClose={() => setShowCreateModal(false)}
                    updating={updating === 'new'}
                />
            )}

            {/* MODAL EDITAR */}
            {showEditModal && (
                <ClienteFormModal 
                    title="Editar Cliente"
                    form={editForm}
                    setForm={setEditForm}
                    onSubmit={handleEditSubmit}
                    onClose={() => setShowEditModal(false)}
                    updating={updating === editForm.id}
                />
            )}

            {/* MODAL TOGGLE ESTADO */}
            {showToggleModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl" style={{ border: '0.5px solid #e0e0da' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                            style={selectedCliente?.activo
                                ? { background: '#fdf4f4', border: '0.5px solid #f0d0d0' }
                                : { background: '#f4faf4', border: '0.5px solid #c8e6c8' }}>
                            {selectedCliente?.activo ? (
                                <svg className="w-5 h-5" style={{ color: '#a03030' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            ) : (
                                <svg className="w-5 h-5" style={{ color: '#2a7a2a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            )}
                        </div>

                        <h3 className="text-base font-medium text-center mb-2">{selectedCliente?.activo ? '¿Desactivar cliente?' : '¿Activar cliente?'}</h3>
                        <p className="text-xs text-center mb-6 text-gray-500">{selectedCliente?.nombre}</p>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setShowToggleModal(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gray-100 border border-gray-200">Cancelar</button>
                            <button onClick={handleConfirmToggle} 
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
                                style={selectedCliente?.activo ? { background: '#a03030' } : { background: '#2a7a2a' }}>
                                {updating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : selectedCliente?.activo ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-componente Modal para el formulario
const ClienteFormModal = ({ title, form, setForm, onSubmit, onClose, updating }) => {
    const isSV = form.pais_cod === 'SV';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" style={{ border: '0.5px solid #e0e0da' }}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-medium">{title}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Información Receptor DTE</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:text-gray-600 transition-all">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <form onSubmit={onSubmit} className="space-y-6">
                        
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-gray-900 border-b pb-1">IDENTIFICACIÓN</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Nombre / Razón Social *</label>
                                    <input className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                        value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="Ej: Juan Pérez o Empresa S.A. de C.V." />
                                </div>
                                <div>
                                    <SelectTipoPersona value={form.tipo_persona} onChange={val => setForm({...form, tipo_persona: val})} />
                                </div>
                                <div>
                                    <SelectTipoDocumento value={form.tipo_documento} onChange={val => setForm({...form, tipo_documento: val})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Número Documento *</label>
                                    <input className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                        value={form.num_documento} onChange={e => setForm({...form, num_documento: e.target.value})} required placeholder="00000000-0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">NRC</label>
                                    <input className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                        value={form.nrc} onChange={e => setForm({...form, nrc: e.target.value})} placeholder="000000-0" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-gray-900 border-b pb-1 uppercase">Giro o Actividad</h4>
                            <SelectActividadEconomica value={form.cod_actividad} onChange={val => setForm({...form, cod_actividad: val})} />
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-gray-900 border-b pb-1 uppercase">Contacto</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Teléfono</label>
                                    <input className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                        value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="2222-2222" />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Correo</label>
                                    <input type="email" className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                        value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} placeholder="email@ejemplo.com" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-gray-900 border-b pb-1 uppercase">Ubicación</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <SelectPais value={form.pais_cod} onChange={val => setForm({...form, pais_cod: val})} />
                                </div>
                                
                                <SelectDepartamento 
                                    value={form.departamento_cod} 
                                    onChange={val => setForm({...form, departamento_cod: val, municipio_cod: ''})} 
                                    disabled={!isSV}
                                />
                                <SelectMunicipio 
                                    departamentoCod={form.departamento_cod} 
                                    value={form.municipio_cod} 
                                    onChange={val => setForm({...form, municipio_cod: val})} 
                                    disabled={!isSV}
                                />
                                
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] tracking-widest mb-1.5 text-gray-400 uppercase">Dirección Completa</label>
                                    <input className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                                        value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Calle, pasaje, block, etc." />
                                </div>
                            </div>
                            {!isSV && <p className="text-[10px] text-blue-500 font-medium italic">* Ubicación bloqueada: Extranjero (00).</p>}
                        </div>

                        <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-medium bg-gray-50 text-gray-500 border hover:bg-gray-100 transition-all">Cancelar</button>
                            <button type="submit" disabled={updating} 
                                className="flex-1 py-3 rounded-xl text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                {updating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : 'Guardar Cliente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Clientes;
