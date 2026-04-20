import React, { useState, useEffect } from 'react';
import { getPaises } from '../../services/paises';

/**
 * Componente Select reutilizable para Países (CAT-020) con búsqueda integrada
 */
const SelectPais = ({ value, onChange, label = "País", required = false, disabled = false }) => {
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const data = await getPaises();
        setPaises(data);
        
        // Si no hay valor y El Salvador (SV) existe, seleccionarlo por defecto si es requerido
        if (!value && required) {
          const sv = data.find(p => p.codigo === 'SV');
          if (sv) onChange(sv.codigo);
        }
      } catch (error) {
        console.error("Error loading paises select:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaises();
  }, []);

  const filtered = paises.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar país..."
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
          size={!disabled && filtered.length > 0 ? 4 : 1}
        >
          <option value="">{loading ? "Cargando..." : "Seleccione país..."}</option>
          {filtered.map((pais) => (
            <option key={pais.codigo} value={pais.codigo}>
              {pais.codigo} - {pais.nombre}
            </option>
          ))}
        </select>
        <div className="absolute right-3 bottom-3 pointer-events-none text-gray-400 text-[10px]">▼</div>
      </div>
      {loading && <span className="text-[10px] text-gray-400">Cargando catálogo...</span>}
    </div>
  );
};

export default SelectPais;
