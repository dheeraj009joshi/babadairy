
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Validate API URL is set
if (!API_URL) {
    console.error('VITE_API_URL is not set. Please set it in your .env file');
} 

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
        try {
            const fullUrl = `${API_URL}${url}`;
            console.log('Uploading to:', fullUrl);
            console.log('API_URL from env:', import.meta.env.VITE_API_URL || 'using default');
            
            const response = await fetch(fullUrl, {
                method: 'POST',
                body: formData, // fetch automatically sets Content-Type to multipart/form-data with boundary
                // Don't set Content-Type header - let browser set it with boundary
                mode: 'cors', // Explicitly enable CORS
            });
            
            console.log('Upload response status:', response.status, response.statusText);
            console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload error response:', errorText);
                console.error('Response status:', response.status, response.statusText);
                throw new Error(`API Upload Error (${response.status}): ${response.statusText} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Upload successful, returned URL:', result.url);
            return result;
        } catch (error: any) {
            console.error('Upload fetch error:', error);
            console.error('Error details:', {
                message: error?.message,
                name: error?.name,
                stack: error?.stack
            });
            
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new Error(`Cannot connect to server at ${API_URL}. Please check if the backend is running and accessible.`);
            }
            throw error;
        }
    }
};
