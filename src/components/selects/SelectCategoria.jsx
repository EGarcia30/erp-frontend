import React, { useState, useEffect } from 'react';
import { getCategorias } from '../../services/categorias';
import BaseSingleSelect from './BaseSingleSelect';

/**
 * Componente Select para Categorías de Productos
 * HU7672 - Estándar Premium
 */
const SelectCategoria = ({ value, onChange, label = "Categoría", required = true, disabled = false }) => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await getCategorias();
                setCategorias(data || []);
            } finally {
                setLoading(false);
            }
        };
        fetchCategorias();
    }, []);

    return (
        <BaseSingleSelect
            label={label}
            value={value}
            onChange={onChange}
            options={categorias}
            loading={loading}
            placeholder="Seleccione categoría..."
            required={required}
            disabled={disabled}
        />
    );
};

export default SelectCategoria;
