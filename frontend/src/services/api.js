/**
 * API Service for Invoice Recovery Tracker
 * Handles all communication with the backend API
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ApiService = {
    /**
     * Create a new client
     * @param {Object} clientData - Client data to create
     * @returns {Promise<Object>} Created client
     */
    async createClient(clientData) {
        const response = await fetch(`${API_BASE_URL}/clients/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create client');
        }

        return response.json();
    },

    /**
     * Get list of clients with pagination and search
     * @param {number} page - Page number
     * @param {number} pageSize - Items per page
     * @param {string} search - Search term
     * @returns {Promise<Object>} Paginated client list
     */
    async getClients(page = 1, pageSize = 10, search = '') {
        let url = `${API_BASE_URL}/clients/?page=${page}&page_size=${pageSize}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch clients');
        }

        return response.json();
    },

    /**
     * Get a single client by ID
     * @param {number} clientId - Client ID
     * @returns {Promise<Object>} Client data
     */
    async getClient(clientId) {
        const response = await fetch(`${API_BASE_URL}/clients/${clientId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch client');
        }

        return response.json();
    },

    /**
     * Update an existing client
     * @param {number} clientId - Client ID to update
     * @param {Object} clientData - Updated client data
     * @returns {Promise<Object>} Updated client
     */
    async updateClient(clientId, clientData) {
        const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update client');
        }

        return response.json();
    },

    /**
     * Delete a client
     * @param {number} clientId - Client ID to delete
     * @returns {Promise<void>}
     */
    async deleteClient(clientId) {
        const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete client');
        }
    }
};
