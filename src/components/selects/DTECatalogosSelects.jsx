import React, { useState, useEffect } from 'react';
import { getAmbientes, getModelos, getTransmisiones } from '../../services/dte_catalogos';

/**
 * Componente base para selección única con estética de "Tributos" (Premium)
 * Incluye buscador y visualización de código - descripción.
 */
const SingleSelectDTEBase = ({ 
    label, 
    value, 
    onChange, 
    fetchFn, 
    placeholder = "Seleccione una opción..." 
}) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchFn();
                setOptions(data || []);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [fetchFn]);

    const handleToggle = (e) => {
        if (!showOptions) {
            // Detectar espacio disponible
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // Si hay menos de 300px abajo, abrir hacia arriba
            setOpenUpward(spaceBelow < 300);
        }
        setShowOptions(!showOptions);
    };

    const filtered = options.filter(opt => 
        opt.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.codigo === value);

    const handleSelect = (codigo) => {
        onChange(codigo);
        setShowOptions(false);
        setSearchTerm("");
    };

    return (
        <div className="flex flex-col gap-1 w-full relative">
            {label && (
                <label className="text-[10px] tracking-widest mb-1 text-gray-400 uppercase font-bold">
                    {label}
                </label>
            )}
            
            {/* Cabecera / Display */}
            <div 
                onClick={handleToggle}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl cursor-pointer flex justify-between items-center transition-all bg-white hover:border-gray-400 shadow-sm`}
                style={{ border: '0.5px solid #e0e0da' }}
            >
                <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {loading ? 'Cargando...' : (selectedOption ? `${selectedOption.codigo} - ${selectedOption.descripcion}` : placeholder)}
                </span>
                <span className="text-gray-400 text-[10px] transition-transform duration-200" style={{ transform: showOptions ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                </span>
            </div>

            {/* Panel de Selección (Smart Positioning) */}
            {showOptions && (
                <div className={`absolute z-[100] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-72 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${openUpward ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'}`}
                     style={{ border: '0.5px solid #efefef' }}>
                    <div className="p-3 border-b border-gray-50 bg-white">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            autoFocus
                            className="w-full px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                        <style>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e0e0da; border-radius: 10px; }
                        `}</style>
                        {filtered.length === 0 ? (
                            <div className="p-4 text-xs text-gray-400 text-center italic">No se encontraron resultados</div>
                        ) : (
                            filtered.map((opt) => (
                                <div 
                                    key={opt.codigo}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(opt.codigo);
                                    }}
                                    className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-all mb-1 ${value === opt.codigo ? 'bg-gray-50 shadow-sm' : ''}`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-xs ${value === opt.codigo ? 'font-bold text-black' : 'font-medium text-gray-700'}`}>
                                            {opt.codigo} - {opt.descripcion}
                                        </span>
                                    </div>
                                    {value === opt.codigo && (
                                        <div className="w-2 h-2 rounded-full bg-black shadow-sm" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Overlay para cerrar al hacer click fuera */}
            {showOptions && (
                <div 
                    className="fixed inset-0 z-[90] bg-transparent" 
                    onClick={() => setShowOptions(false)}
                />
            )}
        </div>
    );
};

export const SelectAmbienteDestino = (props) => (
    <SingleSelectDTEBase 
        {...props} 
        label="Ambiente de Destino" 
        fetchFn={getAmbientes} 
        placeholder="Seleccione ambiente"
    />
);

export const SelectModeloFacturacion = (props) => (
    <SingleSelectDTEBase 
        {...props} 
        label="Modelo de Facturación" 
        fetchFn={getModelos} 
        placeholder="Seleccione modelo"
    />
);

export const SelectTipoTransmision = (props) => (
    <SingleSelectDTEBase 
        {...props} 
        label="Tipo de Transmisión" 
        fetchFn={getTransmisiones} 
        placeholder="Seleccione transmisión"
    />
);
