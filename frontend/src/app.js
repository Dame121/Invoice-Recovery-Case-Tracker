/**
 * Main Application Script for Invoice Recovery Tracker
 * Handles UI interactions and connects to the API
 */

// State
let currentPage = 1;
let pageSize = 10;
let searchTerm = '';
let editingClientId = null;
let deleteClientId = null;

// DOM Elements
const clientForm = document.getElementById('clientForm');
const formMessage = document.getElementById('formMessage');
const clientList = document.getElementById('clientList');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    clientForm.addEventListener('submit', handleFormSubmit);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    cancelBtn.addEventListener('click', resetForm);
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) hideDeleteModal();
    });
}

// Load Clients
async function loadClients() {
    clientList.innerHTML = '<p class="loading">Loading clients...</p>';

    try {
        const data = await ApiService.getClients(currentPage, pageSize, searchTerm);
        renderClientList(data);
        renderPagination(data);
    } catch (error) {
        clientList.innerHTML = `<p class="no-data">Error loading clients: ${error.message}</p>`;
    }
}

// Render Client List
function renderClientList(data) {
    if (data.clients.length === 0) {
        clientList.innerHTML = '<p class="no-data">No clients found. Add your first client above!</p>';
        return;
    }

    const tableHTML = `
        <table class="client-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Client Name</th>
                    <th>Company</th>
                    <th>City</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${data.clients.map(client => `
                    <tr>
                        <td>${client.id}</td>
                        <td>${escapeHtml(client.client_name)}</td>
                        <td>${escapeHtml(client.company_name || '-')}</td>
                        <td>${escapeHtml(client.city || '-')}</td>
                        <td>${escapeHtml(client.contact_person || '-')}</td>
                        <td>${escapeHtml(client.phone || '-')}</td>
                        <td>${escapeHtml(client.email || '-')}</td>
                        <td class="actions">
                            <button class="btn btn-secondary btn-small" onclick="editClient(${client.id})">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="showDeleteModal(${client.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    clientList.innerHTML = tableHTML;
}

// Render Pagination
function renderPagination(data) {
    const totalPages = Math.ceil(data.total / data.page_size);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    pagination.innerHTML = `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            ← Previous
        </button>
        <span>Page ${currentPage} of ${totalPages} (${data.total} clients)</span>
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            Next →
        </button>
    `;
}

// Go to Page
function goToPage(page) {
    currentPage = page;
    loadClients();
}

// Handle Search
function handleSearch() {
    searchTerm = searchInput.value.trim();
    currentPage = 1;
    loadClients();
}

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        client_name: document.getElementById('client_name').value.trim(),
        company_name: document.getElementById('company_name').value.trim() || null,
        city: document.getElementById('city').value.trim() || null,
        contact_person: document.getElementById('contact_person').value.trim() || null,
        phone: document.getElementById('phone').value.trim() || null,
        email: document.getElementById('email').value.trim() || null,
    };

    try {
        if (editingClientId) {
            await ApiService.updateClient(editingClientId, formData);
            showMessage('Client updated successfully!', 'success');
        } else {
            await ApiService.createClient(formData);
            showMessage('Client created successfully!', 'success');
        }

        resetForm();
        loadClients();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Edit Client
async function editClient(clientId) {
    try {
        const client = await ApiService.getClient(clientId);

        document.getElementById('client_name').value = client.client_name || '';
        document.getElementById('company_name').value = client.company_name || '';
        document.getElementById('city').value = client.city || '';
        document.getElementById('contact_person').value = client.contact_person || '';
        document.getElementById('phone').value = client.phone || '';
        document.getElementById('email').value = client.email || '';

        editingClientId = clientId;
        submitBtn.textContent = 'Update Client';
        cancelBtn.style.display = 'inline-block';

        // Scroll to form
        clientForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage('Error loading client: ' + error.message, 'error');
    }
}

// Reset Form
function resetForm() {
    clientForm.reset();
    editingClientId = null;
    submitBtn.textContent = 'Add Client';
    cancelBtn.style.display = 'none';
    hideMessage();
}

// Show Delete Modal
function showDeleteModal(clientId) {
    deleteClientId = clientId;
    deleteModal.classList.add('show');
}

// Hide Delete Modal
function hideDeleteModal() {
    deleteClientId = null;
    deleteModal.classList.remove('show');
}

// Handle Confirm Delete
async function handleConfirmDelete() {
    if (!deleteClientId) return;

    try {
        await ApiService.deleteClient(deleteClientId);
        hideDeleteModal();
        showMessage('Client deleted successfully!', 'success');
        loadClients();
    } catch (error) {
        hideDeleteModal();
        showMessage('Error deleting client: ' + error.message, 'error');
    }
}

// Show Message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `message ${type}`;

    // Auto-hide after 5 seconds
    setTimeout(hideMessage, 5000);
}

// Hide Message
function hideMessage() {
    formMessage.className = 'message';
    formMessage.textContent = '';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
