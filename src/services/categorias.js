const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene todas las categorías de productos
 */
export const getCategorias = async () => {
    try {
        const response = await fetch(`${apiURL}/categorias?activo=true`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error("Error fetching categorias:", error);
        return [];
    }
};
