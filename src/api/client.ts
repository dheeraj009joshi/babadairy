
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Validate API URL is set
if (!API_URL) {
    console.error('VITE_API_URL is not set. Please set it in your .env file');
} 

export const apiClient = {
    get: async (url: string) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            mode: 'cors',
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`GET ${url} error:`, errorText);
            throw new Error(`API Get Error (${response.status}): ${response.statusText} - ${errorText}`);
        }
        return response.json();
    },
    post: async (url: string, data: any) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            mode: 'cors',
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`POST ${url} error:`, errorText);
            throw new Error(`API Post Error (${response.status}): ${response.statusText} - ${errorText}`);
        }
        return response.json();
    },
    put: async (url: string, data: any) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            mode: 'cors',
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`PUT ${url} error:`, errorText);
            throw new Error(`API Put Error (${response.status}): ${response.statusText} - ${errorText}`);
        }
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
        const fullUrl = `${API_URL}${url}`;
        console.log('Uploading to:', fullUrl);
        console.log('API_URL from env:', import.meta.env.VITE_API_URL || 'using default');
        
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout
        
        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                signal: controller.signal, // Add abort signal for timeout
            });
            
            clearTimeout(timeoutId); // Clear timeout on success
            
            console.log('Upload response status:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload error response:', errorText);
                throw new Error(`API Upload Error (${response.status}): ${response.statusText} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Upload successful, returned URL:', result.url);
            return result;
        } catch (error: any) {
            clearTimeout(timeoutId); // Clear timeout on error
            
            console.error('Upload fetch error:', error);
            
            if (error.name === 'AbortError') {
                throw new Error('Upload timeout: The upload took too long. Please try again with a smaller file or check your connection.');
            }
            
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new Error(`Cannot connect to server at ${API_URL}. Please check if the backend is running and accessible.`);
            }
            throw error;
        }
    }
};
