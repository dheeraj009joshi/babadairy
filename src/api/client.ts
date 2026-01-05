
const API_URL = import.meta.env.VITE_API_URL 

export const apiClient = {
    get: async (url: string) => {
        const response = await fetch(`${API_URL}${url}`);
        if (!response.ok) throw new Error(`API Get Error: ${response.statusText}`);
        return response.json();
    },
    post: async (url: string, data: any) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`API Post Error: ${response.statusText}`);
        return response.json();
    },
    put: async (url: string, data: any) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`API Put Error: ${response.statusText}`);
        return response.json();
    },
    delete: async (url: string) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`API Delete Error: ${response.statusText}`);
        return response.json();
    },
    upload: async (url: string, formData: FormData) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            body: formData, // fetch automatically sets Content-Type to multipart/form-data
        });
        if (!response.ok) throw new Error(`API Upload Error: ${response.statusText}`);
        return response.json();
    }
};
