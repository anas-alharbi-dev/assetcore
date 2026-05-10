# AssetCore — IT Asset Management System (V1)

##  Overview
AssetCore is a full-stack IT Asset Management System designed to digitize and streamline IT inventory operations.

This system helps IT departments track assets, manage assignments, monitor status, and generate reports.

---

##  Features

###  Authentication
•⁠  ⁠JWT-based authentication
•⁠  ⁠Access & Refresh tokens
•⁠  ⁠Auto token refresh (frontend)

###  Asset Management
•⁠  ⁠Add / Update / Delete assets
•⁠  ⁠Track asset status (Assigned / Available)
•⁠  ⁠Unique tracking (Serial Number, Asset Tag)

### Employee Management
•⁠  ⁠Manage employees
•⁠  ⁠Link employees with assigned assets

###  Assignments
•⁠  ⁠Assign assets to employees
•⁠  ⁠Track assignments

###  Dashboard
•⁠  ⁠Total assets
•⁠  ⁠Assigned assets
•⁠  ⁠Available assets
•⁠  ⁠Employees count
•⁠  ⁠Recent assets table

###  Reports
•⁠  ⁠Filter data
•⁠  ⁠View assets & employees
•⁠  ⁠Export to Excel

###  Excel Export
•⁠  ⁠Export assets
•⁠  ⁠Export employees
•⁠  ⁠Export assignments

---

## Tech Stack

### Backend
•⁠  ⁠Django
•⁠  ⁠Django REST Framework
•⁠  ⁠JWT (SimpleJWT)

### Frontend
•⁠  ⁠React (TypeScript)
•⁠  ⁠Vite

---

##  Setup

### Backend
bash cd backend python -m venv venv source venv/bin/activate  # Mac  # Windows: venv\Scripts\activate  pip install -r requirements.txt python manage.py migrate python manage.py runserver 

### Frontend
bash cd frontend npm install npm run dev 

---

##  URLs
•⁠  ⁠Backend: http://127.0.0.1:8000/api/
•⁠  ⁠Frontend: http://localhost:5173

---

##  Auth Flow
•⁠  ⁠Login → get access + refresh token
•⁠  ⁠Stored in localStorage
•⁠  ⁠authFetch handles Authorization header + refresh

---

##  Structure
backend/
frontend/

---

##  Version 1
•⁠  ⁠Full system working (Backend + Frontend)
•⁠  ⁠Authentication
•⁠  ⁠Dashboard
•⁠  ⁠Reports + Excel export

---

##  Next Versions
•⁠  ⁠Import Excel
•⁠  ⁠Request Service system
•⁠  ⁠Notifications

---

## Author
Anas Alharbi
