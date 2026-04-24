const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getTributos = async () => {
    try {
        const response = await fetch(`${apiURL}/tributos`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener tributos:', error);
        return { success: false, error };
    }
};
