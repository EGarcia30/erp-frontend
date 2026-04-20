import React, { useState, useEffect } from 'react';
import { getTiposEstablecimiento } from '../../services/empresa';

/**
 * Componente Select reutilizable para Tipo de Establecimiento (CAT-009)
 */
const SelectTipoEstablecimiento = ({ value, onChange, label = "Tipo de Establecimiento", required = false, disabled = false }) => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await getTiposEstablecimiento();
        setTipos(data);
      } catch (error) {
        console.error("Error loading tipos establecimiento select:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTipos();
  }, []);

  const filtered = tipos.filter(t => 
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.codigo.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[10px] tracking-widest mb-1 text-gray-400 uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {!disabled && (
          <input
            type="text"
            placeholder="Buscar tipo..."
            className="w-full px-3 py-1 text-[10px] border border-gray-200 rounded-t-lg focus:outline-none focus:ring-1 focus:ring-gray-100 bg-gray-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled || loading}
          className={`w-full px-3 py-2 text-sm border border-gray-200 ${!disabled ? 'rounded-b-lg' : 'rounded-lg'} focus:outline-none focus:ring-1 focus:ring-gray-100 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none`}
          size={!disabled && filtered.length > 0 ? 3 : 1}
        >
          <option value="">{loading ? "Cargando..." : "Seleccione tipo..."}</option>
          {filtered.map((tipo) => (
            <option key={tipo.codigo} value={tipo.codigo}>
              {tipo.codigo} - {tipo.nombre}
            </option>
          ))}
        </select>
        <div className="absolute right-3 bottom-3 pointer-events-none text-gray-400 text-[10px]">▼</div>
      </div>
    </div>
  );
};

export default SelectTipoEstablecimiento;
