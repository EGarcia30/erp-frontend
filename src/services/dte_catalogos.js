const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getAmbientes = async () => {
    try {
        const response = await fetch(`${apiURL}/dte-catalogos/ambientes`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error("Error fetching ambientes:", error);
        return [];
    }
};

export const getModelos = async () => {
    try {
        const response = await fetch(`${apiURL}/dte-catalogos/modelos`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error("Error fetching modelos:", error);
        return [];
    }
};

export const getTransmisiones = async () => {
    try {
        const response = await fetch(`${apiURL}/dte-catalogos/transmisiones`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error("Error fetching transmisiones:", error);
        return [];
    }
};
