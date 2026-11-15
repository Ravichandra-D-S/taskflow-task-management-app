from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime
from functools import wraps

app = Flask(__name__)

# Security configuration
app.config["SECRET_KEY"] = os.environ.get(
    "SECRET_KEY",
    "taskflow-development-secret-key-2026"
)

# Frontend URL
FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "http://localhost:5173"
)

# Session cookie configuration
# Required when the frontend and backend are hosted on different domains.
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True

# Configure CORS for local and deployed frontend
allowed_origins = [
    "http://localhost:5173",
    FRONTEND_URL
]

CORS(
    app,
    supports_credentials=True,
    origins=allowed_origins
)

# SQLite database configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "taskflow.db")


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def initialize_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            priority TEXT NOT NULL DEFAULT 'Medium',
            status TEXT NOT NULL DEFAULT 'Pending',
            due_date TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()


def login_required(function):
    @wraps(function)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({
                "success": False,
                "message": "Authentication required. Please log in."
            }), 401

        return function(*args, **kwargs)

    return decorated_function


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email and password are required."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    conn = get_db_connection()

    existing_user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:
        conn.close()
        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    password_hash = generate_password_hash(password)
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor = conn.execute(
        """
        INSERT INTO users (name, email, password, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (name, email, password_hash, created_at)
    )

    conn.commit()

    user_id = cursor.lastrowid
    conn.close()

    session["user_id"] = user_id

    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    conn = get_db_connection()

    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    conn.close()

    if not user or not check_password_hash(user["password"], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    session["user_id"] = user["id"]

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    })


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    })


@app.route("/api/user", methods=["GET"])
@login_required
def get_user():
    conn = get_db_connection()

    user = conn.execute(
        "SELECT id, name, email FROM users WHERE id = ?",
        (session["user_id"],)
    ).fetchone()

    conn.close()

    if not user:
        session.clear()
        return jsonify({
            "success": False,
            "message": "User not found."
        }), 404

    return jsonify({
        "success": True,
        "user": dict(user)
    })


@app.route("/api/tasks", methods=["GET"])
@login_required
def get_tasks():
    conn = get_db_connection()

    tasks = conn.execute(
        """
        SELECT * FROM tasks
        WHERE user_id = ?
        ORDER BY
            CASE status
                WHEN 'Pending' THEN 0
                ELSE 1
            END,
            created_at DESC
        """,
        (session["user_id"],)
    ).fetchall()

    conn.close()

    return jsonify({
        "success": True,
        "tasks": [dict(task) for task in tasks]
    })


@app.route("/api/tasks", methods=["POST"])
@login_required
def create_task():
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    priority = data.get("priority", "Medium")
    due_date = data.get("due_date") or None

    if not title:
        return jsonify({
            "success": False,
            "message": "Task title is required."
        }), 400

    if priority not in ["Low", "Medium", "High"]:
        priority = "Medium"

    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()

    cursor = conn.execute(
        """
        INSERT INTO tasks
        (user_id, title, description, priority, status, due_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            session["user_id"],
            title,
            description,
            priority,
            "Pending",
            due_date,
            created_at
        )
    )

    conn.commit()

    task = conn.execute(
        "SELECT * FROM tasks WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    conn.close()

    return jsonify({
        "success": True,
        "message": "Task created successfully.",
        "task": dict(task)
    }), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
@login_required
def update_task(task_id):
    data = request.get_json() or {}

    conn = get_db_connection()

    existing_task = conn.execute(
        """
        SELECT * FROM tasks
        WHERE id = ? AND user_id = ?
        """,
        (task_id, session["user_id"])
    ).fetchone()

    if not existing_task:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Task not found."
        }), 404

    title = data.get("title", existing_task["title"]).strip()
    description = data.get(
        "description",
        existing_task["description"]
    ).strip()
    priority = data.get("priority", existing_task["priority"])
    status = data.get("status", existing_task["status"])
    due_date = data.get("due_date", existing_task["due_date"]) or None

    if not title:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Task title is required."
        }), 400

    if priority not in ["Low", "Medium", "High"]:
        priority = existing_task["priority"]

    if status not in ["Pending", "Completed"]:
        status = existing_task["status"]

    conn.execute(
        """
        UPDATE tasks
        SET title = ?, description = ?, priority = ?,
            status = ?, due_date = ?
        WHERE id = ? AND user_id = ?
        """,
        (
            title,
            description,
            priority,
            status,
            due_date,
            task_id,
            session["user_id"]
        )
    )

    conn.commit()

    updated_task = conn.execute(
        "SELECT * FROM tasks WHERE id = ?",
        (task_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "success": True,
        "message": "Task updated successfully.",
        "task": dict(updated_task)
    })


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
@login_required
def delete_task(task_id):
    conn = get_db_connection()

    task = conn.execute(
        """
        SELECT id FROM tasks
        WHERE id = ? AND user_id = ?
        """,
        (task_id, session["user_id"])
    ).fetchone()

    if not task:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Task not found."
        }), 404

    conn.execute(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, session["user_id"])
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Task deleted successfully."
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "TaskFlow API is running."
    })


if __name__ == "__main__":
    initialize_database()

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )