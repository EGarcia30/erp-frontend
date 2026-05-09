import React from 'react';

/**
 * Catálogo CAT-022 - Tipos de Documentos Tributarios
 */
const TIPOS_DTE = [
    { id: '01', nombre: 'Factura', descripcion: 'Consumidor Final' },
    { id: '03', nombre: 'Crédito Fiscal', descripcion: 'Contribuyente' },
    // Se pueden agregar más tipos aquí (05, 06, etc.)
];

const ModalSelectTipoDocumento = ({ isOpen, onClose, onSelect, selectedId }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[80]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#fff', border: '0.5px solid #e0e0da' }}>
                    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <h3 className="text-base font-medium" style={{ color: '#111' }}>Tipo de Documento</h3>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f5f0' }}>
                            <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-4 space-y-2">
                        {TIPOS_DTE.map((tipo) => (
                            <div
                                key={tipo.id}
                                onClick={() => { onSelect(tipo); onClose(); }}
                                className={`p-4 rounded-xl cursor-pointer transition-all border flex items-center justify-between ${
                                    selectedId === tipo.id ? 'bg-gray-50 border-gray-300' : 'hover:bg-gray-50 border-transparent'
                                }`}
                            >
                                <div>
                                    <p className="text-sm font-medium" style={{ color: '#111' }}>{tipo.nombre}</p>
                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: '#aaa' }}>{tipo.descripcion}</p>
                                </div>
                                {selectedId === tipo.id && (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#222' }}>
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalSelectTipoDocumento;
