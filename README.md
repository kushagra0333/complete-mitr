# MITR SOS App

A full-stack application with a React frontend and a Python (Flask) backend, designed for emergency SOS and community safety features.

## Project Structure

- **frontend/**: React application (created with Create React App).
- **python_backend/**: Flask API server with MongoDB connection.

## Getting Started

Follow these instructions to run the application locally on your machine.

### Prerequisites

- **Node.js** (v16 or higher) and **npm**
- **Python** (v3.8 or higher) and **pip**
- **MongoDB** (running locally or a cloud Atlas URI)

### 1. Backend Setup (Python)

Navigate to the backend directory:

```bash
cd python_backend
```

Create a virtual environment:

```bash
# Windows
python -m venv venv
# Linux/macOS
python3 -m venv venv
```

Activate the virtual environment:

```bash
# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

**Configuration:**
Create a `.env` file in the `python_backend/` directory (you can copy `.env.example` if it exists) and add your environment variables:

```ini
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
# Add other keys (Twilio, etc.) as needed
```

Run the server:

```bash
python app.py
```

The backend will start at `http://localhost:5000`.

### 2. Frontend Setup (React)

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The frontend will open at `http://localhost:3000`.

## API Endpoints

The backend exposes several API blueprints:

- `/api/auth` - Authentication routes
- `/api/user` - User management
- `/api/device` - Device management
- `/api/sessions` - Session management

## Docker

Alternatively, you can run the entire stack using Docker:

```bash
docker-compose up --build
```
