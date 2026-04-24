import React, { useState, useEffect } from 'react';
import { getTipoItem } from '../../services/tipo_item';

/**
 * Componente Select reutilizable para Tipo de Ítem (CAT-011 - El Salvador DTE)
 */
const SelectTipoItem = ({ 
    value, 
    onChange, 
    label = "Tipo de Ítem (MH)", 
    required = false, 
    disabled = false 
}) => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const data = await getTipoItem();
                if (data.success) {
                    setTipos(data.data);
                }
            } catch (error) {
                console.error('Error loading tipo item select:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTipos();
    }, []);

    const filtered = tipos.filter(t => 
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {!disabled && (
                    <input
                        type="text"
                        placeholder="Buscar tipo ítem..."
                        className="w-full px-3 py-1 text-xs border border-gray-200 rounded-t-lg focus:outline-none focus:ring-1 focus:ring-gray-100 bg-gray-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading}
                    />
                )}
                <select
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    required={required}
                    disabled={disabled || loading}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 ${!disabled ? 'rounded-b-lg' : 'rounded-lg'} focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all bg-white disabled:bg-gray-50`}
                    size={!disabled && filtered.length > 0 ? 5 : 1}
                >
                    <option value="">{loading ? "Cargando..." : "Seleccione tipo ítem..."}</option>
                    {filtered.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                            {tipo.codigo} - {tipo.nombre}
                        </option>
                    ))}
                </select>
            </div>
            {loading && <span className="text-xs text-gray-400">Cargando catálogo...</span>}
        </div>
    );
};

export default SelectTipoItem;
