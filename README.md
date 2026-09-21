# 🚧 Smart Pothole Reporter

> **AI-Based Road Damage Detection and Municipal Management System**

A full-stack web application designed to help citizens report potholes and road damage, while enabling administrators and contractors to manage, track, and resolve reported complaints efficiently.

The system combines **AI-based pothole detection**, **Google Maps-based location reporting**, and **role-based dashboards** to create a centralized workflow for road-damage management.

---

## 📌 Overview

Road potholes can create serious safety risks for pedestrians, cyclists, and vehicle users. Traditional complaint systems often lack accurate location information and centralized tracking.

**Smart Pothole Reporter** addresses this by providing a platform where:

* 👤 Citizens can report potholes and road issues.
* 🤖 AI can analyze road images for pothole detection.
* 📍 Google Maps helps capture and display complaint locations.
* 🛠️ Contractors can view and manage assigned complaints.
* 🧑‍💼 Administrators can monitor reports and manage the system.
* 📊 Complaint information can be tracked throughout the workflow.

---

## ✨ Key Features

### 👤 Citizen Module

* Register and log in securely
* Report potholes and road damage
* Upload road-damage images
* Select/report the exact location using Google Maps
* View submitted complaints
* Track complaint details and status
* View complaint history

### 🤖 AI-Based Pothole Detection

* Analyze uploaded road images
* Detect potential potholes using an object-detection model
* Return detection confidence information
* Integrate AI detection into the complaint-reporting workflow

### 📍 Google Maps Integration

* Interactive map-based location selection
* Select a pothole location directly on the map
* Store latitude and longitude
* Display reported locations
* Support location-based complaint workflows

### 🧑‍💼 Admin Dashboard

* View reported complaints
* Monitor complaint information
* Manage complaint status
* View reports and system activity
* Manage users and complaint workflows

### 🛠️ Contractor Module

* View assigned complaints
* Track road-repair tasks
* Update complaint/task status
* Access relevant complaint and location information

### 🔐 Authentication & Authorization

* User authentication
* Role-based access
* Protected routes
* Citizen, Admin, and Contractor workflows

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      Frontend        │
                    │      React + Vite    │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │       Backend        │
                    │   Node.js + Express  │
                    └───────┬───────┬──────┘
                            │       │
                 ┌──────────┘       └──────────┐
                 ▼                             ▼
        ┌─────────────────┐           ┌─────────────────┐
        │    MongoDB      │           │   ML Service    │
        │  Data Storage   │           │    FastAPI      │
        └─────────────────┘           └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │ YOLO Detection  │
                                      │  Pothole Model  │
                                      └─────────────────┘

                         ┌──────────────────────┐
                         │     Google Maps      │
                         │ Location Integration │
                         └──────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Google Maps JavaScript API

### Backend

* Node.js
* Express.js
* TypeScript
* REST APIs

### Database

* MongoDB

### Machine Learning

* Python
* FastAPI
* YOLOv8
* Road Damage Detection dataset/model

### Development Tools

* Git
* GitHub
* VS Code
* npm

---

## 📂 Project Structure

```text
pathole_reporter/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── complaints/
│   │   │   └── maps/
│   │   │
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── citizen/
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   ├── types/
│   │   └── constants/
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── package.json
│
├── ml-service/
│   ├── ...
│   └── README.md
│
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/NaveyaB/Pathole-Reporter.git
```

```bash
cd Pathole-Reporter
```

---

## 2. Install Dependencies

### Root

```bash
npm install
```

### Client

```bash
cd client
npm install
```

### Server

```bash
cd ../server
npm install
```

### ML Service

Create and activate a Python virtual environment:

### Windows

```powershell
cd ../ml-service
python -m venv .venv
.venv\Scripts\activate
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

---

# 🔐 Environment Variables

Do **not** commit real API keys or secrets to GitHub.

Use `.env` files locally and keep them in `.gitignore`.

---

## Client Environment

Create:

```text
client/.env
```

Example:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_BASE_URL=http://localhost:5000/api
```

> Replace the values with your own configuration.

---

## Server Environment

Create:

```text
server/.env
```

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Add other environment variables required by your backend configuration.

---

# 🗺️ Google Maps Setup

The application uses Google Maps for location-based pothole reporting.

### Required Google Cloud APIs

Depending on the features enabled in your project, configure the required Google Maps Platform APIs in Google Cloud Console.

The application uses the Google Maps API key through:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key
```

### Important

For production:

* Restrict the API key to your website/domain.
* Enable only the APIs required by the application.
* Never commit the actual API key to GitHub.

---

# 🗄️ MongoDB Setup

Create a MongoDB database and obtain the connection string.

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
```

Add the connection string to:

```text
server/.env
```

Make sure your MongoDB network access and database credentials are configured correctly.

---

# ▶️ Running the Application

The project contains separate frontend, backend, and machine-learning services.

## Start Frontend

```bash
cd client
npm run dev
```

The Vite development server will normally run at:

```text
http://localhost:5173
```

---

## Start Backend

Open another terminal:

```bash
cd server
npm run dev
```

The backend will normally run at:

```text
http://localhost:5000
```

---

## Start ML Service

Open another terminal:

```powershell
cd ml-service
.venv\Scripts\activate
```

Then start the FastAPI service using the command configured by the ML service.

Example:

```bash
uvicorn main:app --reload --port 8000
```

The ML service can then be accessed through:

```text
http://localhost:8000
```

> The exact ML startup command may vary depending on the entry-point file in your current implementation.

---

# 🔄 Application Workflow

```text
Citizen
   │
   ▼
Login / Register
   │
   ▼
Report Pothole
   │
   ├── Upload Image
   │
   ├── Select Location
   │       │
   │       └── Google Maps
   │
   ▼
AI Detection
   │
   ▼
Complaint Created
   │
   ▼
Admin Review
   │
   ▼
Contractor Assignment
   │
   ▼
Repair / Status Updates
   │
   ▼
Complaint Tracking
```

---

# 🤖 AI Detection Workflow

The machine-learning service is designed to process road images and identify potential potholes.

```text
Road Image
     │
     ▼
ML Service
     │
     ▼
YOLO Object Detection
     │
     ▼
Detected Road Damage
     │
     ├── Detection Class
     ├── Confidence
     └── Detection Information
```

The detection result can then be associated with the corresponding complaint.

---

# 📍 Location Reporting

Location information is an important part of the reporting workflow.

A citizen can:

1. Open the complaint reporting page.
2. Select a location using the map.
3. Capture latitude and longitude.
4. Add complaint information.
5. Upload supporting images.
6. Submit the report.

The backend can then store the location information together with the complaint.

---

# 👥 User Roles

| Role           | Responsibilities                                                   |
| -------------- | ------------------------------------------------------------------ |
| **Citizen**    | Report potholes, upload images, select locations, track complaints |
| **Admin**      | Manage complaints, monitor reports, manage users and workflows     |
| **Contractor** | View assigned complaints and manage repair-related tasks           |

---

# 🔌 API Structure

The backend follows a REST API architecture.

Example API areas include:

```text
/api/auth
/api/complaints
/api/location
```

The exact endpoints may change as the project evolves.

---

# 📊 Core Modules

```text
Authentication
      │
      ├── Citizen
      ├── Admin
      └── Contractor

Complaint Management
      │
      ├── Create
      ├── View
      ├── Update
      └── Track

Location Management
      │
      ├── Google Maps
      ├── Latitude
      └── Longitude

AI Detection
      │
      ├── Image Processing
      └── Pothole Detection

Administration
      │
      ├── Reports
      ├── Users
      └── Complaint Monitoring
```

---

# 🖼️ Screenshots

Add project screenshots here as the UI evolves.

### Home / Dashboard

```text
Add screenshot here
```

### Report Complaint

```text
Add screenshot here
```

### Google Maps Location Picker

```text
Add screenshot here
```

### Admin Dashboard

```text
Add screenshot here
```

### Contractor Dashboard

```text
Add screenshot here
```

---

# 🧪 Development

Before pushing changes, it is recommended to verify the project using the available checks.

### Frontend

```bash
cd client
npm run typecheck
npm run lint
```

### Backend

```bash
cd server
npx tsc --noEmit
```

Run the application locally and verify:

* Authentication
* Complaint creation
* Image upload
* Map location selection
* Complaint retrieval
* Admin workflows
* Contractor workflows
* AI detection integration

---

# 🔒 Security Considerations

The project is intended for development and educational purposes and should be hardened before production deployment.

Recommended production practices:

* Store secrets in environment variables.
* Never commit `.env` files.
* Restrict Google Maps API keys.
* Validate uploaded files.
* Validate API request payloads.
* Use secure authentication.
* Apply role-based authorization.
* Configure CORS appropriately.
* Add rate limiting.
* Use HTTPS.
* Secure MongoDB credentials.
* Avoid exposing internal server configuration.

---

# 🚧 Future Enhancements

Potential future improvements include:

* 📱 Mobile application
* 🔔 Real-time complaint notifications
* 📍 Advanced geospatial analysis
* 🗺️ Heatmaps for high-risk road areas
* 📊 Advanced municipal analytics
* 🤖 Improved pothole detection accuracy
* 🧠 Model retraining using locally collected road images
* 📷 Automatic image-based location assistance
* 📈 Repair-time and resolution analytics
* ☁️ Cloud deployment
* 🔐 Enhanced authentication and security
* 📝 Citizen feedback and complaint verification

---

# 🎯 Project Objectives

The main objectives of Smart Pothole Reporter are to:

* Digitize pothole reporting.
* Improve the accuracy of reported locations.
* Introduce AI-assisted road damage detection.
* Centralize complaint management.
* Improve communication between citizens, administrators, and contractors.
* Provide a structured workflow for monitoring road repair activities.

---

# 🌱 Project Status

**Status:** 🚧 Active Development

The project is continuously being improved with new features, UI updates, backend enhancements, database integration, and AI/location capabilities.

---

# 👩‍💻 Developer

### Naveya B

B.Sc. Computer Science Student
Full-Stack Developer | React | Node.js | MongoDB | AI/ML

GitHub:
https://github.com/NaveyaB

Project Repository:
https://github.com/NaveyaB/Pathole-Reporter

---

# 📄 License

This project is currently developed as an academic/project work.

A formal open-source license can be added when the project is prepared for public distribution.

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

**Built with React, Node.js, MongoDB, Python, YOLOv8 and Google Maps.**
