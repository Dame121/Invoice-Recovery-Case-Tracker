# 📋 Invoice Recovery Case Tracker

A full-stack internal CRM system for managing clients and tracking invoice recovery cases. Built for **PayAssured** - a B2B credit and invoice-recovery company.

![Case List](screenshots/1.png)

---

## ✨ Features

### Client Management
- Add, edit, and delete clients
- Search clients by name or company
- Store contact details (name, company, city, phone, email)

### Case Management
- Create recovery cases linked to clients
- Track invoice details (number, amount, dates)
- Update case status (New → In Follow-up → Partially Paid → Closed)
- Add follow-up notes
- Filter by status & sort by due date
- Overdue invoice highlighting

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Node.js, Express.js, Bootstrap 5, Vanilla JavaScript |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy ORM, Pydantic |
| **Database** | SQLite (default) / PostgreSQL supported |

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── config.py       # App configuration
│   │   ├── database.py     # Database connection
│   │   └── main.py         # FastAPI app entry
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── services/       # API service
│   │   ├── app.js          # Main application logic
│   │   └── styles.css      # Custom styles
│   ├── index.html
│   ├── server.js           # Express server
│   └── package.json
├── db/
│   └── schema.sql          # Database schema
├── screenshots/
├── start.ps1               # Start both servers
├── stop.ps1                # Stop all servers
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 8+ | `npm --version` |
| pip | Latest | `pip --version` |

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/invoice-recovery-tracker.git
cd invoice-recovery-tracker
```

### Step 2: Backend Setup
```bash
# Navigate to backend folder
cd backend

# (Optional) Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Frontend Setup
```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install Node.js dependencies
npm install
```

### Step 4: Run the Application

**Option A: One-Click Start (Windows PowerShell)**
```powershell
# From project root directory
.\start.ps1
```
This will:
- Kill any existing processes on ports 8000 and 3000
- Start the FastAPI backend server
- Start the Express.js frontend server
- Open the browser automatically

**Option B: Manual Start (Cross-Platform)**

Open **Terminal 1** for Backend:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open **Terminal 2** for Frontend:
```bash
cd frontend
npm start
```

### Step 5: Access the Application

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://127.0.0.1:3000 |
| 📡 Backend API | http://127.0.0.1:8000 |
| 📚 API Documentation | http://127.0.0.1:8000/docs |

### Stopping the Application

**Windows PowerShell:**
```powershell
.\stop.ps1
```

**Manual:** Close both terminal windows or press `Ctrl+C` in each.

---

## 📊 Database Schema

### clients
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| client_name | VARCHAR(255) | NOT NULL |
| company_name | VARCHAR(255) | |
| city | VARCHAR(100) | |
| contact_person | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| email | VARCHAR(255) | |
| created_at | TIMESTAMP | DEFAULT NOW |
| updated_at | TIMESTAMP | DEFAULT NOW |

### cases
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| client_id | INTEGER | FK → clients.id |
| invoice_number | VARCHAR(100) | NOT NULL |
| invoice_amount | DECIMAL(15,2) | NOT NULL |
| invoice_date | DATE | NOT NULL |
| due_date | DATE | NOT NULL |
| status | VARCHAR(50) | DEFAULT 'New' |
| last_follow_up_notes | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW |
| updated_at | TIMESTAMP | DEFAULT NOW |

---

## 🔌 API Endpoints

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clients` | Create a new client |
| GET | `/api/clients` | List all clients (paginated) |
| GET | `/api/clients/{id}` | Get client by ID |
| PUT | `/api/clients/{id}` | Update client |
| DELETE | `/api/clients/{id}` | Delete client |

### Cases
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cases` | Create a new case |
| GET | `/api/cases` | List cases (with filters & sorting) |
| GET | `/api/cases/{id}` | Get case by ID |
| PUT | `/api/cases/{id}` | Update case |
| PATCH | `/api/cases/{id}/status` | Update status & notes |
| DELETE | `/api/cases/{id}` | Delete case |

---

## 📸 Screenshots

### Client List
![Client List](screenshots/1.png)

### Add Client Form
![Add Client](screenshots/2.png)

### Case List with Filters
![Case List](screenshots/3.png)

### Create New Case
![Create Case](screenshots/4.png)

### Case Detail View
![Case Detail](screenshots/5.png)

### Case Status Update
![Status Update](screenshots/6.png)

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the backend folder:

```env
# SQLite (default - no setup required)
DATABASE_URL=sqlite:///./invoice_recovery.db

# PostgreSQL (optional)
# DATABASE_URL=postgresql://user:password@localhost:5432/invoice_recovery
```

---

## 🧪 Input Validation

All inputs are validated using regex patterns:

| Field | Validation |
|-------|------------|
| Client Name | Letters, spaces, hyphens, apostrophes |
| Company Name | Alphanumeric, common business symbols |
| Phone | 7-20 digits with +, -, (), spaces |
| Email | Valid email format |
| Invoice Number | Alphanumeric, hyphens, slashes (auto-uppercase) |
| Invoice Amount | Positive number, max 999 billion |
| Due Date | Must be ≥ Invoice Date |

---

## 📝 License

This project was built as an assignment for PayAssured.

---

## 👤 Author

Built with ❤️ for PayAssured internship assignment.