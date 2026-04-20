import React, { useState } from 'react';
import { useMunicipios } from '../../hooks/useMunicipios';

/**
 * Select de Municipios/Distritos (CAT-013) con búsqueda integrada
 * Dependiente del departamento seleccionado
 */
const SelectMunicipio = ({
  value,
  onChange,
  departamentoCod,
  label = "Distrito",
  required = false,
  disabled = false
}) => {
  const { municipios, loading } = useMunicipios(departamentoCod);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = municipios.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.codigo.includes(searchTerm)
  );

  const isDisabled = disabled || (!departamentoCod && !loading);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[10px] tracking-widest mb-1 text-gray-400 uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        <input
          type="text"
          placeholder="Buscar distrito..."
          className="w-full px-3 py-1 text-[10px] border border-gray-200 rounded-t-lg focus:outline-none focus:ring-1 focus:ring-gray-100 bg-gray-50 disabled:opacity-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isDisabled || loading}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={isDisabled || loading}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-b-lg focus:outline-none focus:ring-1 focus:ring-gray-100 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
          size={filtered.length > 0 && !isDisabled ? 4 : 1}
        >
          <option value="">
            {!departamentoCod 
              ? "Primero elija depto..." 
              : loading ? "Cargando..." : "Seleccione distrito..."}
          </option>
          {filtered.map((muni) => (
            <option key={`${muni.departamento_cod}-${muni.codigo}`} value={muni.codigo}>
              {muni.codigo} - {muni.nombre}
            </option>
          ))}
        </select>
        <div className="absolute right-3 bottom-3 pointer-events-none text-gray-400 text-[10px]">▼</div>
      </div>
    </div>
  );
};

export default SelectMunicipio;
