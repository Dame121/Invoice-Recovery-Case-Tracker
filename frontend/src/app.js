/**
 * Main Application Script for Invoice Recovery Tracker
 * Handles UI interactions and connects to the API
 */

// ==================== STATE ====================
let clientCurrentPage = 1;
let clientPageSize = 10;
let clientSearchTerm = '';
let editingClientId = null;

let caseCurrentPage = 1;
let casePageSize = 10;
let caseSearchTerm = '';
let caseStatusFilter = '';
let caseSortOrder = 'asc';
let editingCaseId = null;

let deleteType = null; // 'client' or 'case'
let deleteId = null;

// ==================== DOM ELEMENTS ====================
// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Client Elements
const clientForm = document.getElementById('clientForm');
const clientFormMessage = document.getElementById('clientFormMessage');
const clientList = document.getElementById('clientList');
const clientPagination = document.getElementById('clientPagination');
const clientSearchInput = document.getElementById('clientSearchInput');
const clientSearchBtn = document.getElementById('clientSearchBtn');
const submitClientBtn = document.getElementById('submitClientBtn');
const cancelClientBtn = document.getElementById('cancelClientBtn');

// Case Elements
const caseForm = document.getElementById('caseForm');
const caseFormMessage = document.getElementById('caseFormMessage');
const caseFormTitle = document.getElementById('caseFormTitle');
const caseList = document.getElementById('caseList');
const casePagination = document.getElementById('casePagination');
const caseSearchInput = document.getElementById('caseSearchInput');
const caseSearchBtn = document.getElementById('caseSearchBtn');
const statusFilter = document.getElementById('statusFilter');
const sortOrder = document.getElementById('sortOrder');
const submitCaseBtn = document.getElementById('submitCaseBtn');
const cancelCaseBtn = document.getElementById('cancelCaseBtn');
const caseClientSelect = document.getElementById('case_client_id');

// Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deleteModalText = document.getElementById('deleteModalText');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const caseDetailModal = document.getElementById('caseDetailModal');
const caseDetailContent = document.getElementById('caseDetailContent');
const closeCaseDetailBtn = document.getElementById('closeCaseDetail');

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    setupEventListeners();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Client events
    clientForm.addEventListener('submit', handleClientFormSubmit);
    clientSearchBtn.addEventListener('click', handleClientSearch);
    clientSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleClientSearch();
    });
    cancelClientBtn.addEventListener('click', resetClientForm);

    // Case events
    caseForm.addEventListener('submit', handleCaseFormSubmit);
    caseSearchBtn.addEventListener('click', handleCaseSearch);
    caseSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCaseSearch();
    });
    statusFilter.addEventListener('change', handleCaseSearch);
    sortOrder.addEventListener('change', handleCaseSearch);
    cancelCaseBtn.addEventListener('click', resetCaseForm);

    // Modal events
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) hideDeleteModal();
    });
    closeCaseDetailBtn.addEventListener('click', hideCaseDetailModal);
    caseDetailModal.addEventListener('click', (e) => {
        if (e.target === caseDetailModal) hideCaseDetailModal();
    });
}

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    if (tabName === 'cases') {
        loadClientDropdown();
        loadCases();
    } else {
        loadClients();
    }
}

// ==================== CLIENT FUNCTIONS ====================
async function loadClients() {
    clientList.innerHTML = '<p class="loading">Loading clients...</p>';

    try {
        const data = await ApiService.getClients(clientCurrentPage, clientPageSize, clientSearchTerm);
        renderClientList(data);
        renderClientPagination(data);
    } catch (error) {
        clientList.innerHTML = `<p class="no-data">Error loading clients: ${error.message}</p>`;
    }
}

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
                            <button class="btn btn-danger btn-small" onclick="showDeleteModal('client', ${client.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    clientList.innerHTML = tableHTML;
}

function renderClientPagination(data) {
    const totalPages = Math.ceil(data.total / data.page_size);

    if (totalPages <= 1) {
        clientPagination.innerHTML = '';
        return;
    }

    clientPagination.innerHTML = `
        <button onclick="goToClientPage(${clientCurrentPage - 1})" ${clientCurrentPage === 1 ? 'disabled' : ''}>
            ← Previous
        </button>
        <span>Page ${clientCurrentPage} of ${totalPages} (${data.total} clients)</span>
        <button onclick="goToClientPage(${clientCurrentPage + 1})" ${clientCurrentPage === totalPages ? 'disabled' : ''}>
            Next →
        </button>
    `;
}

function goToClientPage(page) {
    clientCurrentPage = page;
    loadClients();
}

function handleClientSearch() {
    clientSearchTerm = clientSearchInput.value.trim();
    clientCurrentPage = 1;
    loadClients();
}

async function handleClientFormSubmit(e) {
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
            showMessage(clientFormMessage, 'Client updated successfully!', 'success');
        } else {
            await ApiService.createClient(formData);
            showMessage(clientFormMessage, 'Client created successfully!', 'success');
        }

        resetClientForm();
        loadClients();
    } catch (error) {
        showMessage(clientFormMessage, error.message, 'error');
    }
}

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
        submitClientBtn.textContent = 'Update Client';
        cancelClientBtn.style.display = 'inline-block';

        clientForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage(clientFormMessage, 'Error loading client: ' + error.message, 'error');
    }
}

function resetClientForm() {
    clientForm.reset();
    editingClientId = null;
    submitClientBtn.textContent = 'Add Client';
    cancelClientBtn.style.display = 'none';
    hideMessage(clientFormMessage);
}

// ==================== CASE FUNCTIONS ====================
async function loadClientDropdown() {
    try {
        caseClientSelect.innerHTML = '<option value="">Loading clients...</option>';
        console.log('Fetching clients from API...');
        const data = await ApiService.getAllClients();
        console.log('Clients received:', data);
        caseClientSelect.innerHTML = '<option value="">Select a client...</option>';
        
        if (data.clients.length === 0) {
            caseClientSelect.innerHTML = '<option value="">No clients found - add a client first</option>';
            return;
        }
        
        data.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.client_name}${client.company_name ? ` (${client.company_name})` : ''}`;
            caseClientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading clients for dropdown:', error);
        alert('Error loading clients: ' + error.message + '\n\nMake sure:\n1. Backend is running on http://127.0.0.1:8000\n2. You are accessing frontend via http://127.0.0.1:3000 (not file://)');
        caseClientSelect.innerHTML = '<option value="">Error loading clients</option>';
    }
}

async function loadCases() {
    caseList.innerHTML = '<p class="loading">Loading cases...</p>';

    try {
        const data = await ApiService.getCases({
            page: caseCurrentPage,
            pageSize: casePageSize,
            status: caseStatusFilter,
            sortOrder: caseSortOrder,
            search: caseSearchTerm
        });
        renderCaseList(data);
        renderCasePagination(data);
    } catch (error) {
        caseList.innerHTML = `<p class="no-data">Error loading cases: ${error.message}</p>`;
    }
}

function renderCaseList(data) {
    if (data.cases.length === 0) {
        caseList.innerHTML = '<p class="no-data">No cases found. Add your first case above!</p>';
        return;
    }

    const tableHTML = `
        <table class="client-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Client Name</th>
                    <th>Invoice #</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${data.cases.map(c => `
                    <tr>
                        <td>${c.id}</td>
                        <td>${escapeHtml(c.client.client_name)}</td>
                        <td>${escapeHtml(c.invoice_number)}</td>
                        <td>$${parseFloat(c.invoice_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>${formatDate(c.due_date)}</td>
                        <td><span class="status-badge ${getStatusClass(c.status)}">${escapeHtml(c.status)}</span></td>
                        <td class="actions">
                            <button class="btn btn-secondary btn-small" onclick="viewCase(${c.id})">View</button>
                            <button class="btn btn-secondary btn-small" onclick="editCase(${c.id})">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="showDeleteModal('case', ${c.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    caseList.innerHTML = tableHTML;
}

function renderCasePagination(data) {
    const totalPages = Math.ceil(data.total / data.page_size);

    if (totalPages <= 1) {
        casePagination.innerHTML = '';
        return;
    }

    casePagination.innerHTML = `
        <button onclick="goToCasePage(${caseCurrentPage - 1})" ${caseCurrentPage === 1 ? 'disabled' : ''}>
            ← Previous
        </button>
        <span>Page ${caseCurrentPage} of ${totalPages} (${data.total} cases)</span>
        <button onclick="goToCasePage(${caseCurrentPage + 1})" ${caseCurrentPage === totalPages ? 'disabled' : ''}>
            Next →
        </button>
    `;
}

function goToCasePage(page) {
    caseCurrentPage = page;
    loadCases();
}

function handleCaseSearch() {
    caseSearchTerm = caseSearchInput.value.trim();
    caseStatusFilter = statusFilter.value;
    caseSortOrder = sortOrder.value;
    caseCurrentPage = 1;
    loadCases();
}

async function handleCaseFormSubmit(e) {
    e.preventDefault();

    const formData = {
        client_id: parseInt(document.getElementById('case_client_id').value),
        invoice_number: document.getElementById('invoice_number').value.trim(),
        invoice_amount: parseFloat(document.getElementById('invoice_amount').value),
        invoice_date: document.getElementById('invoice_date').value,
        due_date: document.getElementById('due_date').value,
        status: document.getElementById('case_status').value,
        last_follow_up_notes: document.getElementById('last_follow_up_notes').value.trim() || null,
    };

    try {
        if (editingCaseId) {
            await ApiService.updateCase(editingCaseId, formData);
            showMessage(caseFormMessage, 'Case updated successfully!', 'success');
        } else {
            await ApiService.createCase(formData);
            showMessage(caseFormMessage, 'Case created successfully!', 'success');
        }

        resetCaseForm();
        loadCases();
    } catch (error) {
        showMessage(caseFormMessage, error.message, 'error');
    }
}

async function viewCase(caseId) {
    try {
        const c = await ApiService.getCase(caseId);
        
        caseDetailContent.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Client</label>
                    <span>${escapeHtml(c.client.client_name)}</span>
                </div>
                <div class="detail-item">
                    <label>Company</label>
                    <span>${escapeHtml(c.client.company_name || '-')}</span>
                </div>
                <div class="detail-item">
                    <label>Invoice Number</label>
                    <span>${escapeHtml(c.invoice_number)}</span>
                </div>
                <div class="detail-item">
                    <label>Invoice Amount</label>
                    <span>$${parseFloat(c.invoice_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="detail-item">
                    <label>Invoice Date</label>
                    <span>${formatDate(c.invoice_date)}</span>
                </div>
                <div class="detail-item">
                    <label>Due Date</label>
                    <span>${formatDate(c.due_date)}</span>
                </div>
                <div class="detail-item">
                    <label>Status</label>
                    <span class="status-badge ${getStatusClass(c.status)}">${escapeHtml(c.status)}</span>
                </div>
                <div class="detail-item">
                    <label>Created</label>
                    <span>${formatDateTime(c.created_at)}</span>
                </div>
                <div class="detail-item full-width">
                    <label>Last Follow-up Notes</label>
                    <span>${escapeHtml(c.last_follow_up_notes || 'No notes yet')}</span>
                </div>
            </div>
            
            <div class="update-form">
                <h4>Quick Update</h4>
                <div class="form-group">
                    <label>Update Status</label>
                    <select id="update_status">
                        <option value="New" ${c.status === 'New' ? 'selected' : ''}>New</option>
                        <option value="In Follow-up" ${c.status === 'In Follow-up' ? 'selected' : ''}>In Follow-up</option>
                        <option value="Partially Paid" ${c.status === 'Partially Paid' ? 'selected' : ''}>Partially Paid</option>
                        <option value="Closed" ${c.status === 'Closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Update Notes</label>
                    <textarea id="update_notes" rows="3">${escapeHtml(c.last_follow_up_notes || '')}</textarea>
                </div>
                <button class="btn btn-primary" onclick="updateCaseStatus(${c.id})">Save Changes</button>
            </div>
        `;
        
        caseDetailModal.classList.add('show');
    } catch (error) {
        showMessage(caseFormMessage, 'Error loading case: ' + error.message, 'error');
    }
}

async function updateCaseStatus(caseId) {
    const status = document.getElementById('update_status').value;
    const notes = document.getElementById('update_notes').value.trim();
    
    try {
        await ApiService.updateCaseStatus(caseId, {
            status: status,
            last_follow_up_notes: notes || null
        });
        
        hideCaseDetailModal();
        showMessage(caseFormMessage, 'Case updated successfully!', 'success');
        loadCases();
    } catch (error) {
        alert('Error updating case: ' + error.message);
    }
}

async function editCase(caseId) {
    try {
        const c = await ApiService.getCase(caseId);

        document.getElementById('case_client_id').value = c.client_id;
        document.getElementById('invoice_number').value = c.invoice_number;
        document.getElementById('invoice_amount').value = c.invoice_amount;
        document.getElementById('invoice_date').value = c.invoice_date;
        document.getElementById('due_date').value = c.due_date;
        document.getElementById('case_status').value = c.status;
        document.getElementById('last_follow_up_notes').value = c.last_follow_up_notes || '';

        editingCaseId = caseId;
        caseFormTitle.textContent = 'Edit Case';
        submitCaseBtn.textContent = 'Update Case';
        cancelCaseBtn.style.display = 'inline-block';

        caseForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage(caseFormMessage, 'Error loading case: ' + error.message, 'error');
    }
}

function resetCaseForm() {
    caseForm.reset();
    editingCaseId = null;
    caseFormTitle.textContent = 'Add New Case';
    submitCaseBtn.textContent = 'Add Case';
    cancelCaseBtn.style.display = 'none';
    hideMessage(caseFormMessage);
}

// ==================== MODAL FUNCTIONS ====================
function showDeleteModal(type, id) {
    deleteType = type;
    deleteId = id;
    deleteModalText.textContent = `Are you sure you want to delete this ${type}? This action cannot be undone.`;
    deleteModal.classList.add('show');
}

function hideDeleteModal() {
    deleteType = null;
    deleteId = null;
    deleteModal.classList.remove('show');
}

async function handleConfirmDelete() {
    if (!deleteId || !deleteType) return;

    try {
        if (deleteType === 'client') {
            await ApiService.deleteClient(deleteId);
            hideDeleteModal();
            showMessage(clientFormMessage, 'Client deleted successfully!', 'success');
            loadClients();
        } else if (deleteType === 'case') {
            await ApiService.deleteCase(deleteId);
            hideDeleteModal();
            showMessage(caseFormMessage, 'Case deleted successfully!', 'success');
            loadCases();
        }
    } catch (error) {
        hideDeleteModal();
        const messageEl = deleteType === 'client' ? clientFormMessage : caseFormMessage;
        showMessage(messageEl, `Error deleting ${deleteType}: ${error.message}`, 'error');
    }
}

function hideCaseDetailModal() {
    caseDetailModal.classList.remove('show');
}

// ==================== UTILITY FUNCTIONS ====================
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    setTimeout(() => hideMessage(element), 5000);
}

function hideMessage(element) {
    element.className = 'message';
    element.textContent = '';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getStatusClass(status) {
    const statusMap = {
        'New': 'status-new',
        'In Follow-up': 'status-in-follow-up',
        'Partially Paid': 'status-partially-paid',
        'Closed': 'status-closed'
    };
    return statusMap[status] || 'status-new';
}
