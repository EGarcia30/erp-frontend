import React, { useState, useEffect } from 'react';
import { getUnidadesMedida } from '../../services/unidades_medida';

/**
 * HU7665 ERP SV - Componente Select reutilizable para Unidad de Medida (CAT-014)
 */
const SelectUnidadMedida = ({ value, onChange, label = "Unidad de Medida", required = false, disabled = false }) => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const result = await getUnidadesMedida();
        if (result.success) {
          setUnidades(result.data);
        }
      } catch (error) {
        console.error("Error loading unidades medida select:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUnidades();
  }, []);

  const filtered = unidades.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.codigo.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar unidad..."
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
          <option value="">{loading ? "Cargando..." : "Seleccione unidad..."}</option>
          {filtered.map((unidad) => (
            <option key={unidad.id} value={unidad.id}>
              {unidad.codigo} - {unidad.nombre}
            </option>
          ))}
        </select>
      </div>
      {loading && <span className="text-xs text-gray-400">Cargando catálogo...</span>}
    </div>
  );
};

export default SelectUnidadMedida;
