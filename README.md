# TaskFlow

### Organize your work. Achieve more.

TaskFlow is a full-stack Task Management Application designed to help users organize, manage, and track their daily tasks efficiently. Users can create an account, securely log in, and manage their personal tasks through a clean and responsive dashboard.

## Features

### Authentication
- User registration
- Secure user login
- Logout functionality
- Password hashing using Werkzeug
- Session-based authentication
- Protected API routes

### Task Management
- Create new tasks
- View personal tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as Pending or Completed
- Set task priority as Low, Medium, or High
- Add due dates and task descriptions

### Dashboard
- Total task count
- Pending task count
- Completed task count
- High-priority task count
- Filter tasks by All, Pending, and Completed status

### User Interface
- Clean and professional design
- Responsive layout for desktop and mobile devices
- Loading and error messages
- Empty task states
- Easy-to-use task creation and editing forms

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Plain CSS
- Fetch API

### Backend
- Python
- Flask
- Flask-CORS
- SQLite
- Werkzeug Security

## Project Structure

```text
task-management-app/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── taskflow.db
│
├── src/
│   ├── components/
│   │   ├── Auth.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TaskForm.jsx
│   │   └── TaskList.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── config.js
│   └── main.jsx
│
├── public/
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- Python 3
- npm

## Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the Flask server:

```bash
python app.py
```

The backend will run on:

```text
http://127.0.0.1:5000
```

## Frontend Setup

Open a new terminal and navigate to the project folder:

```bash
cd task-management-app
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Log in a user |
| POST | `/api/logout` | Log out the current user |
| GET | `/api/user` | Get the current user |
| GET | `/api/tasks` | Get all tasks for the logged-in user |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/<id>` | Update a task |
| DELETE | `/api/tasks/<id>` | Delete a task |

## Security

- Passwords are securely hashed using Werkzeug.
- Session-based authentication is used to manage user login sessions.
- Protected API routes prevent unauthorized access.
- Users can only access and manage their own tasks.
- Sensitive environment variables should not be committed to GitHub.

## Future Improvements

- Cloud database integration
- Task search functionality
- Task categories
- Email reminders
- Dark mode
- User profile management

## Author

**Ravichandra D S**

GitHub: https://github.com/Ravichandra-D-S

---

### Internship Project

This project was developed as part of a **Full Stack Development internship** to demonstrate practical skills in frontend development, backend development, database management, authentication, and REST API integration.