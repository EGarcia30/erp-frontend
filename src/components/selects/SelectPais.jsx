import React, { useState, useEffect } from 'react';
import { getPaises } from '../../services/paises';
import BaseSingleSelect from './BaseSingleSelect';

const SelectPais = ({ value, onChange, label = "País", required = false, disabled = false }) => {
    const [paises, setPaises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPaises = async () => {
            try {
                const data = await getPaises();
                setPaises(data || []);
                if (!value && required) {
                    const sv = data.find(p => p.codigo === 'SV');
                    if (sv) onChange(sv.codigo);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPaises();
    }, []);

    return (
        <BaseSingleSelect
            label={label}
            value={value}
            onChange={onChange}
            options={paises}
            loading={loading}
            placeholder="Seleccione país..."
            required={required}
            disabled={disabled}
            valueKey="codigo"
        />
    );
};

export default SelectPais;
