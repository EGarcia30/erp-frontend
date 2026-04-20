import React, { useState, useEffect } from 'react';
import { useDepartamentos } from '../../hooks/useDepartamentos';

/**
 * Select de Departamentos (CAT-012) con búsqueda integrada
 */
const SelectDepartamento = ({
  value,
  onChange,
  label = "Departamento",
  required = false,
  disabled = false
}) => {
  const { departamentos, loading } = useDepartamentos();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = departamentos.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.codigo.includes(searchTerm)
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
            placeholder="Buscar depto..."
            className="w-full px-3 py-1 text-[10px] border border-gray-200 rounded-t-lg focus:outline-none focus:ring-1 focus:ring-gray-100 bg-gray-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {disabled && value === '00' ? (
            <option value="00">00 - Otro (Para extranjeros)</option>
          ) : (
            <>
              <option value="">{loading ? "Cargando..." : "Seleccione depto..."}</option>
              {filtered.map((depto) => (
                <option key={depto.codigo} value={depto.codigo}>
                  {depto.codigo} - {depto.nombre}
                </option>
              ))}
            </>
          )}
        </select>
        <div className="absolute right-3 bottom-3 pointer-events-none text-gray-400 text-[10px]">▼</div>
      </div>
    </div>
  );
};

export default SelectDepartamento;
