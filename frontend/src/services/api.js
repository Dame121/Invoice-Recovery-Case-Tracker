/**
 * API Service for Invoice Recovery Tracker
 * Handles all communication with the backend API
 */

// Use the same hostname as the current page to avoid CORS issues
const API_BASE_URL = 'http://' + window.location.hostname + ':8000/api';

const ApiService = {
    // ==================== CLIENT ENDPOINTS ====================
    
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
     * Get all clients for dropdown (no pagination)
     * @returns {Promise<Object>} All clients
     */
    async getAllClients() {
        const response = await fetch(`${API_BASE_URL}/clients/?page=1&page_size=100`);

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
    },

    // ==================== CASE ENDPOINTS ====================

    /**
     * Create a new case
     * @param {Object} caseData - Case data to create
     * @returns {Promise<Object>} Created case
     */
    async createCase(caseData) {
        const response = await fetch(`${API_BASE_URL}/cases/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(caseData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create case');
        }

        return response.json();
    },

    /**
     * Get list of cases with pagination, filters, and sorting
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Paginated case list
     */
    async getCases(options = {}) {
        const { page = 1, pageSize = 10, status = '', sortOrder = 'asc', search = '' } = options;
        
        let url = `${API_BASE_URL}/cases/?page=${page}&page_size=${pageSize}&sort_by=due_date&sort_order=${sortOrder}`;
        
        if (status) {
            url += `&status=${encodeURIComponent(status)}`;
        }
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch cases');
        }

        return response.json();
    },

    /**
     * Get a single case by ID
     * @param {number} caseId - Case ID
     * @returns {Promise<Object>} Case data
     */
    async getCase(caseId) {
        const response = await fetch(`${API_BASE_URL}/cases/${caseId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch case');
        }

        return response.json();
    },

    /**
     * Update an existing case
     * @param {number} caseId - Case ID to update
     * @param {Object} caseData - Updated case data
     * @returns {Promise<Object>} Updated case
     */
    async updateCase(caseId, caseData) {
        const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(caseData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update case');
        }

        return response.json();
    },

    /**
     * Update case status and notes
     * @param {number} caseId - Case ID to update
     * @param {Object} statusData - Status and notes data
     * @returns {Promise<Object>} Updated case
     */
    async updateCaseStatus(caseId, statusData) {
        const response = await fetch(`${API_BASE_URL}/cases/${caseId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(statusData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update case status');
        }

        return response.json();
    },

    /**
     * Delete a case
     * @param {number} caseId - Case ID to delete
     * @returns {Promise<void>}
     */
    async deleteCase(caseId) {
        const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete case');
        }
    }
};
