/**
 * Invoice Recovery Tracker - Main Application Script
 * Clean, minimal Bootstrap-based UI with error handling
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

let deleteType = null;
let deleteId = null;

// Bootstrap Modal instances
let deleteModalInstance = null;
let caseDetailModalInstance = null;

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeModals();
    setupEventListeners();
    loadClients();
});

function initializeModals() {
    deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));
    caseDetailModalInstance = new bootstrap.Modal(document.getElementById('caseDetailModal'));
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Tab switching - Bootstrap handles this, but we need to load data
    document.getElementById('cases-tab-btn').addEventListener('shown.bs.tab', () => {
        loadClientDropdown();
        loadCases();
    });
    
    document.getElementById('clients-tab-btn').addEventListener('shown.bs.tab', () => {
        loadClients();
    });

    // Client events
    document.getElementById('clientForm').addEventListener('submit', handleClientFormSubmit);
    document.getElementById('clientSearchBtn').addEventListener('click', handleClientSearch);
    document.getElementById('clientSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleClientSearch();
    });
    document.getElementById('cancelClientBtn').addEventListener('click', resetClientForm);

    // Case events
    document.getElementById('caseForm').addEventListener('submit', handleCaseFormSubmit);
    document.getElementById('caseSearchBtn').addEventListener('click', handleCaseSearch);
    document.getElementById('caseSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCaseSearch();
    });
    document.getElementById('statusFilter').addEventListener('change', handleCaseSearch);
    document.getElementById('sortOrder').addEventListener('change', handleCaseSearch);
    document.getElementById('cancelCaseBtn').addEventListener('click', resetCaseForm);

    // Modal events
    document.getElementById('confirmDelete').addEventListener('click', handleConfirmDelete);
}

// ==================== ALERT SYSTEM ====================
function showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            bootstrap.Alert.getOrCreateInstance(alert).close();
        }
    }, 5000);
}

// ==================== CLIENT FUNCTIONS ====================
async function loadClients() {
    const tbody = document.getElementById('clientTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Loading...</td></tr>';

    try {
        const data = await ApiService.getClients(clientCurrentPage, clientPageSize, clientSearchTerm);
        renderClientTable(data);
        renderClientPagination(data);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger"><i class="bi bi-exclamation-circle me-2"></i>${escapeHtml(error.message)}</td></tr>`;
    }
}

function renderClientTable(data) {
    const tbody = document.getElementById('clientTableBody');
    
    if (data.clients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="empty-state">
                        <i class="bi bi-people"></i>
                        <p class="mb-0">No clients found</p>
                        <small class="text-muted">Add your first client using the form above</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.clients.map(client => `
        <tr>
            <td class="fw-medium">${escapeHtml(client.client_name)}</td>
            <td>${escapeHtml(client.company_name || '-')}</td>
            <td>${escapeHtml(client.city || '-')}</td>
            <td>${escapeHtml(client.contact_person || '-')}</td>
            <td>${escapeHtml(client.phone || '-')}</td>
            <td>${escapeHtml(client.email || '-')}</td>
            <td>
                <div class="btn-group-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="editClient(${client.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="showDeleteModal('client', ${client.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderClientPagination(data) {
    const pagination = document.getElementById('clientPagination');
    const totalPages = Math.ceil(data.total / data.page_size);

    if (totalPages <= 1) {
        pagination.innerHTML = `<small class="text-muted">${data.total} client${data.total !== 1 ? 's' : ''}</small>`;
        return;
    }

    pagination.innerHTML = `
        <div class="d-flex justify-content-between align-items-center w-100">
            <small class="text-muted">${data.total} clients</small>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${clientCurrentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="goToClientPage(${clientCurrentPage - 1}); return false;">Previous</a>
                    </li>
                    <li class="page-item disabled">
                        <span class="page-link">${clientCurrentPage} / ${totalPages}</span>
                    </li>
                    <li class="page-item ${clientCurrentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="goToClientPage(${clientCurrentPage + 1}); return false;">Next</a>
                    </li>
                </ul>
            </nav>
        </div>
    `;
}

function goToClientPage(page) {
    clientCurrentPage = page;
    loadClients();
}

function handleClientSearch() {
    clientSearchTerm = document.getElementById('clientSearchInput').value.trim();
    clientCurrentPage = 1;
    loadClients();
}

async function handleClientFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitClientBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';

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
            showAlert('Client updated successfully!', 'success');
        } else {
            await ApiService.createClient(formData);
            showAlert('Client created successfully!', 'success');
        }
        resetClientForm();
        loadClients();
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
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
        document.getElementById('submitClientBtn').innerHTML = '<i class="bi bi-check-circle me-1"></i> Update Client';
        document.getElementById('cancelClientBtn').classList.remove('d-none');

        // Expand form if collapsed
        const collapse = bootstrap.Collapse.getOrCreateInstance(document.getElementById('clientFormCollapse'), { toggle: false });
        collapse.show();
        
        document.getElementById('clientForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showAlert('Error loading client: ' + error.message, 'danger');
    }
}

function resetClientForm() {
    document.getElementById('clientForm').reset();
    editingClientId = null;
    document.getElementById('submitClientBtn').innerHTML = '<i class="bi bi-plus-circle me-1"></i> Add Client';
    document.getElementById('cancelClientBtn').classList.add('d-none');
}

// ==================== CASE FUNCTIONS ====================
async function loadClientDropdown() {
    const select = document.getElementById('case_client_id');
    select.innerHTML = '<option value="">Loading clients...</option>';
    
    try {
        const data = await ApiService.getAllClients();
        select.innerHTML = '<option value="">Select a client...</option>';
        
        if (data.clients.length === 0) {
            select.innerHTML = '<option value="">No clients available - add one first</option>';
            return;
        }
        
        data.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.company_name 
                ? `${client.client_name} (${client.company_name})`
                : client.client_name;
            select.appendChild(option);
        });
    } catch (error) {
        select.innerHTML = '<option value="">Error loading clients</option>';
        showAlert('Failed to load clients: ' + error.message, 'danger');
    }
}

async function loadCases() {
    const tbody = document.getElementById('caseTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Loading...</td></tr>';

    try {
        const data = await ApiService.getCases({
            page: caseCurrentPage,
            pageSize: casePageSize,
            status: caseStatusFilter,
            sortOrder: caseSortOrder,
            search: caseSearchTerm
        });
        renderCaseTable(data);
        renderCasePagination(data);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger"><i class="bi bi-exclamation-circle me-2"></i>${escapeHtml(error.message)}</td></tr>`;
    }
}

function renderCaseTable(data) {
    const tbody = document.getElementById('caseTableBody');
    
    if (data.cases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="empty-state">
                        <i class="bi bi-folder"></i>
                        <p class="mb-0">No cases found</p>
                        <small class="text-muted">Add your first case using the form above</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.cases.map(c => {
        const isOverdue = new Date(c.due_date) < new Date() && c.status !== 'Closed';
        return `
            <tr onclick="viewCase(${c.id})" style="cursor: pointer;">
                <td class="fw-medium">${escapeHtml(c.client.client_name)}</td>
                <td><code>${escapeHtml(c.invoice_number)}</code></td>
                <td class="money">$${parseFloat(c.invoice_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="${isOverdue ? 'overdue' : ''}">
                    ${isOverdue ? '<i class="bi bi-exclamation-triangle me-1"></i>' : ''}
                    ${formatDate(c.due_date)}
                </td>
                <td><span class="badge ${getStatusBadgeClass(c.status)}">${escapeHtml(c.status)}</span></td>
                <td onclick="event.stopPropagation()">
                    <div class="btn-group-actions">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewCase(${c.id})" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="editCase(${c.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="showDeleteModal('case', ${c.id})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderCasePagination(data) {
    const pagination = document.getElementById('casePagination');
    const totalPages = Math.ceil(data.total / data.page_size);

    if (totalPages <= 1) {
        pagination.innerHTML = `<small class="text-muted">${data.total} case${data.total !== 1 ? 's' : ''}</small>`;
        return;
    }

    pagination.innerHTML = `
        <div class="d-flex justify-content-between align-items-center w-100">
            <small class="text-muted">${data.total} cases</small>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${caseCurrentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="goToCasePage(${caseCurrentPage - 1}); return false;">Previous</a>
                    </li>
                    <li class="page-item disabled">
                        <span class="page-link">${caseCurrentPage} / ${totalPages}</span>
                    </li>
                    <li class="page-item ${caseCurrentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="goToCasePage(${caseCurrentPage + 1}); return false;">Next</a>
                    </li>
                </ul>
            </nav>
        </div>
    `;
}

function goToCasePage(page) {
    caseCurrentPage = page;
    loadCases();
}

function handleCaseSearch() {
    caseSearchTerm = document.getElementById('caseSearchInput').value.trim();
    caseStatusFilter = document.getElementById('statusFilter').value;
    caseSortOrder = document.getElementById('sortOrder').value;
    caseCurrentPage = 1;
    loadCases();
}

async function handleCaseFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitCaseBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';

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
            showAlert('Case updated successfully!', 'success');
        } else {
            await ApiService.createCase(formData);
            showAlert('Case created successfully!', 'success');
        }
        resetCaseForm();
        loadCases();
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function viewCase(caseId) {
    const content = document.getElementById('caseDetailContent');
    content.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
    caseDetailModalInstance.show();
    
    try {
        const c = await ApiService.getCase(caseId);
        const isOverdue = new Date(c.due_date) < new Date() && c.status !== 'Closed';
        
        content.innerHTML = `
            <div class="case-detail-grid">
                <div class="case-detail-item">
                    <div class="case-detail-label">Client</div>
                    <div class="case-detail-value">${escapeHtml(c.client.client_name)}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Company</div>
                    <div class="case-detail-value">${escapeHtml(c.client.company_name || '-')}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Invoice Number</div>
                    <div class="case-detail-value"><code>${escapeHtml(c.invoice_number)}</code></div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Amount</div>
                    <div class="case-detail-value money">$${parseFloat(c.invoice_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Invoice Date</div>
                    <div class="case-detail-value">${formatDate(c.invoice_date)}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Due Date</div>
                    <div class="case-detail-value ${isOverdue ? 'overdue' : ''}">${formatDate(c.due_date)}${isOverdue ? ' <i class="bi bi-exclamation-triangle"></i>' : ''}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Status</div>
                    <div class="case-detail-value"><span class="badge ${getStatusBadgeClass(c.status)}">${escapeHtml(c.status)}</span></div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Created</div>
                    <div class="case-detail-value">${formatDateTime(c.created_at)}</div>
                </div>
                <div class="case-detail-item full-width">
                    <div class="case-detail-label">Follow-up Notes</div>
                    <div class="case-detail-value">${escapeHtml(c.last_follow_up_notes || 'No notes recorded')}</div>
                </div>
            </div>
            
            <div class="update-case-form">
                <h6 class="text-primary mb-3"><i class="bi bi-pencil-square me-2"></i>Quick Update</h6>
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="update_status">
                            <option value="New" ${c.status === 'New' ? 'selected' : ''}>New</option>
                            <option value="In Follow-up" ${c.status === 'In Follow-up' ? 'selected' : ''}>In Follow-up</option>
                            <option value="Partially Paid" ${c.status === 'Partially Paid' ? 'selected' : ''}>Partially Paid</option>
                            <option value="Closed" ${c.status === 'Closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </div>
                    <div class="col-md-8">
                        <label class="form-label">Notes</label>
                        <textarea class="form-control" id="update_notes" rows="2">${escapeHtml(c.last_follow_up_notes || '')}</textarea>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-primary" onclick="updateCaseStatus(${c.id})">
                        <i class="bi bi-check-lg me-1"></i> Save Changes
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-circle me-2"></i>${escapeHtml(error.message)}</div>`;
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
        
        caseDetailModalInstance.hide();
        showAlert('Case updated successfully!', 'success');
        loadCases();
    } catch (error) {
        showAlert('Error updating case: ' + error.message, 'danger');
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
        document.getElementById('caseFormTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Case';
        document.getElementById('submitCaseBtn').innerHTML = '<i class="bi bi-check-circle me-1"></i> Update Case';
        document.getElementById('cancelCaseBtn').classList.remove('d-none');

        // Expand form if collapsed
        const collapse = bootstrap.Collapse.getOrCreateInstance(document.getElementById('caseFormCollapse'), { toggle: false });
        collapse.show();
        
        document.getElementById('caseForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showAlert('Error loading case: ' + error.message, 'danger');
    }
}

function resetCaseForm() {
    document.getElementById('caseForm').reset();
    editingCaseId = null;
    document.getElementById('caseFormTitle').innerHTML = '<i class="bi bi-folder-plus me-2"></i>Add New Case';
    document.getElementById('submitCaseBtn').innerHTML = '<i class="bi bi-plus-circle me-1"></i> Add Case';
    document.getElementById('cancelCaseBtn').classList.add('d-none');
}

// ==================== DELETE MODAL ====================
function showDeleteModal(type, id) {
    deleteType = type;
    deleteId = id;
    document.getElementById('deleteModalText').textContent = 
        `Are you sure you want to delete this ${type}? This action cannot be undone.`;
    deleteModalInstance.show();
}

async function handleConfirmDelete() {
    if (!deleteId || !deleteType) return;

    const btn = document.getElementById('confirmDelete');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Deleting...';

    try {
        if (deleteType === 'client') {
            await ApiService.deleteClient(deleteId);
            showAlert('Client deleted successfully!', 'success');
            loadClients();
        } else if (deleteType === 'case') {
            await ApiService.deleteCase(deleteId);
            showAlert('Case deleted successfully!', 'success');
            loadCases();
        }
        deleteModalInstance.hide();
    } catch (error) {
        showAlert(`Error deleting ${deleteType}: ${error.message}`, 'danger');
        deleteModalInstance.hide();
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
        deleteType = null;
        deleteId = null;
    }
}

// ==================== UTILITY FUNCTIONS ====================
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

function getStatusBadgeClass(status) {
    const map = {
        'New': 'badge-new',
        'In Follow-up': 'badge-followup',
        'Partially Paid': 'badge-partial',
        'Closed': 'badge-closed'
    };
    return map[status] || 'bg-secondary';
}
