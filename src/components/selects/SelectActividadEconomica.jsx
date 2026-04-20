import React, { useState, useEffect } from 'react';
import { getActividadesEconomicas } from '../../services/actividad_economica';

/**
 * Componente Select reutilizable para Actividad Económica (CAT-019)
 */
const SelectActividadEconomica = ({ value, onChange, label = "Actividad Económica", required = false }) => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const data = await getActividadesEconomicas();
        setActividades(data);
      } catch (error) {
        console.error("Error loading actividades select:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActividades();
  }, []);

  const filteredActividades = actividades.filter(a => 
    a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar actividad..."
          className="w-full px-3 py-1 text-xs border border-gray-200 rounded-t-lg focus:outline-none focus:ring-1 focus:ring-gray-100 bg-gray-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={loading}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all bg-white disabled:bg-gray-50"
          size={filteredActividades.length > 0 ? 5 : 1}
        >
          <option value="">Seleccione una actividad...</option>
          {filteredActividades.map((act) => (
            <option key={act.codigo} value={act.codigo}>
              {act.codigo} - {act.descripcion}
            </option>
          ))}
        </select>
      </div>
      {loading && <span className="text-xs text-gray-400">Cargando catálogo...</span>}
    </div>
  );
};

export default SelectActividadEconomica;
