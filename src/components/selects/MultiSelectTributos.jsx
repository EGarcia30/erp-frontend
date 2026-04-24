import React, { useState, useEffect } from 'react';
import { getTributos } from '../../services/tributos';

/**
 * Componente MultiSelect para Tributos (CAT-015 - MH El Salvador)
 * Permite seleccionar múltiples impuestos por producto.
 */
const MultiSelectTributos = ({ 
    selectedIds = [], 
    onChange, 
    label = "Tributos (MH)", 
    required = false,
    disabled = false
}) => {
    const [tributos, setTributos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        const fetchTributos = async () => {
            try {
                const data = await getTributos();
                if (data.success) {
                    setTributos(data.data);
                }
            } catch (error) {
                console.error('Error loading tributos multiselect:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTributos();
    }, []);

    const filtered = tributos.filter(t => 
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleTributo = (id) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(item => item !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const getSelectedNames = () => {
        if (selectedIds.length === 0) return "Ninguno seleccionado";
        const names = tributos
            .filter(t => selectedIds.includes(t.id))
            .map(t => t.codigo);
        return names.join(", ");
    };

    return (
        <div className="flex flex-col gap-1 w-full relative">
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            {/* Cabecera / Display */}
            <div 
                onClick={() => !disabled && setShowOptions(!showOptions)}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center transition-all ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
            >
                <span className={selectedIds.length > 0 ? 'text-gray-900' : 'text-gray-400'}>
                    {loading ? 'Cargando...' : getSelectedNames()}
                </span>
                <span className="text-gray-400 text-[10px]">{showOptions ? '▲' : '▼'}</span>
            </div>

            {/* Panel de Selección */}
            {showOptions && !disabled && (
                <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <input
                            type="text"
                            placeholder="Buscar tributo..."
                            className="w-full px-3 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {filtered.length === 0 ? (
                            <div className="p-2 text-xs text-gray-400 text-center">No hay resultados</div>
                        ) : (
                            filtered.map((t) => (
                                <div 
                                    key={t.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTributo(t.id);
                                    }}
                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${selectedIds.includes(t.id) ? 'bg-blue-50/50' : ''}`}
                                >
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedIds.includes(t.id)}
                                        readOnly
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-800">
                                            {t.codigo} - {t.nombre}
                                        </span>
                                        <div className="flex gap-2 mt-0.5">
                                            {t.valor_default > 0 && (
                                                <span className="text-[10px] px-1 bg-gray-100 text-gray-500 rounded">
                                                    {t.valor_default}{t.es_porcentaje ? '%' : '$'}
                                                </span>
                                            )}
                                            {t.es_informativo && (
                                                <span className="text-[10px] px-1 bg-blue-100 text-blue-600 rounded uppercase font-bold">
                                                    Informativo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-2 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                        <span className="text-[10px] text-gray-500">{selectedIds.length} seleccionados</span>
                        <button 
                            onClick={() => setShowOptions(false)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay para cerrar al hacer click fuera */}
            {showOptions && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowOptions(false)}
                />
            )}
        </div>
    );
};

export default MultiSelectTributos;
