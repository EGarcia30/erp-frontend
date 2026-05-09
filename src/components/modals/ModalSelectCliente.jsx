import React, { useState, useEffect, useCallback } from 'react';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Modal de Selección de Clientes (DTE Ready)
 * Permite buscar por nombre, NRC o Documento
 */
const ModalSelectCliente = ({ isOpen, onClose, onSelect, selectedId }) => {
    const [clientes, setClientes] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [search, setSearch] = useState('');

    // Fetch clientes con paginación y búsqueda
    const fetchClientes = useCallback(async (currentPage = 1, searchQuery = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10
            });
            if (searchQuery && searchQuery.trim() !== '') {
                params.append('search', searchQuery);
            }

            // Usamos el endpoint de paginación (asegúrate que el backend lo soporte, 
            // similar a productos/pag o promociones/pag)
            const response = await fetch(`${apiURL}/clientes/pag?${params.toString()}`);
            if (!response.ok) {
                // Si /pag no existe, intentamos el normal
                const fallbackRes = await fetch(`${apiURL}/clientes`);
                const fallbackData = await fallbackRes.json();
                if (fallbackData.success) {
                    setClientes(fallbackData.data || []);
                    setTotalPages(1);
                }
                return;
            }

            const data = await response.json();
            if (data.success) {
                setClientes(data.data || []);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error cargando clientes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Búsqueda con debounce
    useEffect(() => {
        const delay = setTimeout(() => {
            setSearch(searchTerm);
            setPage(1);
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    // Cargar clientes al cambiar búsqueda/página
    useEffect(() => {
        if (isOpen) {
            fetchClientes(page, search);
        }
    }, [page, search, isOpen, fetchClientes]);

    // Resetear búsqueda al cerrar
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSearch('');
            setPage(1);
        }
    }, [isOpen]);

    const handleSelectCliente = (cliente) => {
        onSelect(cliente);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[70]"
                style={{ background: 'rgba(0,0,0,0.4)' }}
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div
                    className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
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
                                Seleccionar Cliente
                            </h3>
                            <p className="text-xs" style={{ color: '#aaa' }}>
                                Busca por nombre, documento o NRC
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: '#f5f5f0' }}
                        >
                            <svg className="w-4 h-4" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Buscador */}
                    <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #f0f0ea' }}>
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                style={{ color: '#bbb' }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, NIT, DUI o NRC..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.target.blur();
                                    if (e.key === 'Escape') onClose();
                                }}
                                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
                                style={{
                                    background: '#fafafa',
                                    border: '0.5px solid #e0e0da',
                                    color: '#222'
                                }}
                                autoFocus
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: '#bbb' }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lista de Clientes */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                            </div>
                        ) : clientes.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-sm" style={{ color: '#aaa' }}>
                                    {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {clientes.map((cliente) => {
                                    const isSelected = selectedId?.toString() === cliente.id?.toString();
                                    return (
                                        <div
                                            key={cliente.id}
                                            onClick={() => handleSelectCliente(cliente)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                                isSelected
                                                    ? 'bg-gray-50 shadow-sm'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                            style={{
                                                border: isSelected
                                                    ? '0.5px solid #e0e0da'
                                                    : '0.5px solid transparent'
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span
                                                            className="text-sm font-medium truncate"
                                                            style={{ color: '#111' }}
                                                        >
                                                            {cliente.nombre}
                                                        </span>
                                                        {cliente.nrc && (
                                                            <span
                                                                className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
                                                                style={{ background: '#f0f4ff', color: '#3060a0' }}
                                                            >
                                                                NRC: {cliente.nrc}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs" style={{ color: '#888' }}>
                                                        {cliente.num_documento && (
                                                            <span>DOC: {cliente.num_documento}</span>
                                                        )}
                                                        {cliente.correo && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate">{cliente.correo}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    {isSelected && (
                                                        <div
                                                            className="w-5 h-5 rounded-full flex items-center justify-center"
                                                            style={{ background: '#222' }}
                                                        >
                                                            <svg className="w-3 h-3" style={{ color: '#fff' }} fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    {!isSelected && (
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

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div
                            className="flex items-center justify-center gap-2 px-6 py-4 flex-shrink-0"
                            style={{ borderTop: '0.5px solid #f0f0ea', background: '#fafafa' }}
                        >
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1 || loading}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                                style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}
                            >
                                ‹
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p >= page - 2 && p <= page + 2)
                                .map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all`}
                                        style={
                                            pageNum === page
                                                ? { background: '#222', color: '#fff' }
                                                : { background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }
                                        }
                                    >
                                        {pageNum}
                                    </button>
                                ))
                            }
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages || loading}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all disabled:opacity-40"
                                style={{ background: '#fff', border: '0.5px solid #e0e0da', color: '#555' }}
                            >
                                ›
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ModalSelectCliente;
