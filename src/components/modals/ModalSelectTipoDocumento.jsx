import React, { useState, useEffect } from 'react';
import { getTiposDTE } from '../../services/tipo_dte';

/**
 * Modal de Selección de Tipos de Documentos Tributarios (Dinámico desde BD)
 */
const ModalSelectTipoDocumento = ({ isOpen, onClose, onSelect, selectedId }) => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTipos();
        }
    }, [isOpen]);

    const fetchTipos = async () => {
        try {
            setLoading(true);
            const data = await getTiposDTE();
            setTipos(data || []);
        } catch (error) {
            console.error('Error cargando tipos de DTE:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[80]"
                style={{ background: 'rgba(0,0,0,0.4)' }}
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                <div
                    className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
                    style={{
                        background: '#fff',
                        border: '0.5px solid #e0e0da',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                        style={{ borderBottom: '0.5px solid #f0f0ea' }}
                    >
                        <div>
                            <h3 className="text-base font-medium" style={{ color: '#111' }}>
                                Tipo de Documento
                            </h3>
                            <p className="text-xs" style={{ color: '#aaa' }}>
                                Selecciona el tipo de documento tributario
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: '#f5f5f0' }}
                        >
                            <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                            </div>
                        ) : tipos.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-sm" style={{ color: '#aaa' }}>No hay tipos de documento registrados</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tipos.map((tipo) => {
                                    const isSelected = selectedId?.toString() === tipo.codigo?.toString();
                                    return (
                                        <div
                                            key={tipo.codigo}
                                            onClick={() => { onSelect(tipo); onClose(); }}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                                isSelected ? 'bg-gray-50 shadow-sm' : 'hover:bg-gray-50'
                                            }`}
                                            style={{
                                                border: isSelected ? '0.5px solid #e0e0da' : '0.5px solid transparent'
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium" style={{ color: '#111' }}>
                                                        {tipo.nombre || tipo.descripcion}
                                                    </p>
                                                    <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: '#aaa' }}>
                                                        CÓDIGO: {tipo.codigo}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {isSelected ? (
                                                        <div
                                                            className="w-5 h-5 rounded-full flex items-center justify-center"
                                                            style={{ background: '#222' }}
                                                        >
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="w-5 h-5 rounded-full border-2"
                                                            style={{ borderColor: '#e0e0da' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalSelectTipoDocumento;
