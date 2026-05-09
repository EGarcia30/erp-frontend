import React, { useState, useEffect } from 'react';
import { getTipoItem } from '../../services/tipo_item';
import BaseSingleSelect from './BaseSingleSelect';

const SelectTipoItem = ({ 
    value, 
    onChange, 
    label = "Tipo de Ítem (MH)", 
    required = false, 
    disabled = false 
}) => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const data = await getTipoItem();
                if (data.success) {
                    setTipos(data.data || []);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchTipos();
    }, []);

    return (
        <BaseSingleSelect
            label={label}
            value={value}
            onChange={onChange}
            options={tipos}
            loading={loading}
            placeholder="Seleccione tipo ítem..."
            required={required}
            disabled={disabled}
            valueKey="codigo"
        />
    );
};

export default SelectTipoItem;
