import React, { useState, useEffect, useRef } from 'react';

/**
 * Componente Base Premium para Selección Única (Smart UI)
 * HU7672 - Refactorización de Interfaz
 */
const BaseSingleSelect = ({ 
    label, 
    value, 
    onChange, 
    options = [], 
    loading = false,
    placeholder = "Seleccione una opción...",
    required = false,
    disabled = false,
    showCode = true,
    valueKey = "id" // 👈 NUEVO: Permite elegir entre 'id' o 'codigo'
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const containerRef = useRef(null);

    const handleToggle = (e) => {
        if (disabled) return;
        if (!showOptions) {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setOpenUpward(spaceBelow < 300);
        }
        setShowOptions(!showOptions);
    };

    const filtered = options.filter(opt => 
        (opt.descripcion || opt.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.codigo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ Ahora busca usando la llave especificada (id por defecto)
    const selectedOption = options.find(opt => opt[valueKey]?.toString() === value?.toString());

    const handleSelect = (val) => {
        onChange(val);
        setShowOptions(false);
        setSearchTerm("");
    };

    const getDisplayName = (opt) => {
        if (!opt) return "";
        const name = opt.descripcion || opt.nombre || "";
        const code = opt.codigo || "";
        return showCode && code ? `${code} - ${name}` : name;
    };

    return (
        <div className="flex flex-col gap-1 w-full relative" ref={containerRef}>
            {label && (
                <label className="text-[10px] tracking-widest mb-1 text-gray-400 uppercase font-bold">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            {/* Cabecera / Display */}
            <div 
                onClick={handleToggle}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl cursor-pointer flex justify-between items-center transition-all shadow-sm ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
                style={{ border: '0.5px solid #e0e0da' }}
            >
                <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {loading ? 'Cargando...' : (selectedOption ? getDisplayName(selectedOption) : placeholder)}
                </span>
                <span className="text-gray-400 text-[10px] transition-transform duration-200" style={{ transform: showOptions ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                </span>
            </div>

            {/* Panel de Selección */}
            {showOptions && !disabled && (
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
                            <div className="p-4 text-xs text-gray-400 text-center italic">No hay resultados</div>
                        ) : (
                            filtered.map((opt) => {
                                const optVal = opt[valueKey]?.toString();
                                const isSelected = value?.toString() === optVal?.toString();
                                return (
                                    <div
                                        key={optVal}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(optVal);
                                        }}
                                        className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-all mb-1 ${isSelected ? 'bg-gray-50 shadow-sm' : ''}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-xs ${isSelected ? 'font-bold text-black' : 'font-medium text-gray-700'}`}>
                                                {getDisplayName(opt)}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-black shadow-sm" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Overlay */}
            {showOptions && (
                <div 
                    className="fixed inset-0 z-[90] bg-transparent" 
                    onClick={() => setShowOptions(false)}
                />
            )}
        </div>
    );
};

export default BaseSingleSelect;
