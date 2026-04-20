import React, { useState, useEffect } from 'react';
import { getFormasPago } from '../../services/forma_pago';

/**
 * Select de Formas de Pago (CAT-017) con búsqueda integrada
 */
const SelectFormaPago = ({
  value,
  onChange,
  label = "Forma de Pago",
  required = false,
  disabled = false
}) => {
  const [formas, setFormas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFormas = async () => {
      try {
        setLoading(true);
        const response = await getFormasPago();
        // API devuelve { success: true, data: [...] }
        const formasData = response.data || response;
        setFormas(formasData);
      } catch (err) {
        console.error('Error cargando formas de pago:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormas();
  }, []);

  const filtered = formas.filter(f =>
    f.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.codigo?.includes(searchTerm)
  );

  // Mapa de iconos para cada código CAT-017
  const iconos = {
    '01': '💵',
    '02': '🪪',
    '03': '💳',
    '04': '📄',
    '05': '🏦',
    '08': '📱',
    '09': '👛',
    '11': '₿',
    '12': '🪙',
    '13': '📋',
    '14': '📨',
    '99': '📝'
  };

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
            placeholder="Buscar forma de pago..."
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
          <option value="">{loading ? "Cargando..." : "Seleccione..."}</option>
          {filtered.map((forma) => (
            <option key={forma.id} value={forma.id}>
              {iconos[forma.codigo] || '💰'} {forma.codigo} - {forma.nombre}
            </option>
          ))}
        </select>
        <div className="absolute right-3 bottom-3 pointer-events-none text-gray-400 text-[10px]">▼</div>
      </div>
    </div>
  );
};

export default SelectFormaPago;