# Cognifyz Task 7: Advanced API Usage & External API Integration

## 📌 Project Overview
This project is a full-stack Node.js application built for **Cognifyz Task 7**. It demonstrates advanced backend concepts, including secure API routing, third-party API integration, rate limiting, comprehensive error handling, and cloud database connectivity.

## 🚀 Features
* **Advanced API Security:** Implements API Key authentication middleware to protect sensitive routes from unauthorized access.
* **Third-Party API Integration:** Uses `axios` to fetch live public data from the GitHub REST API (specifically for the user `farhanfawad007`).
* **Dynamic Frontend Rendering:** Consumes the external JSON data on the server-side and passes it to an EJS template to render a styled, responsive HTML profile card.
* **Database Connectivity:** Integrates `mongoose` to securely connect to a cloud-based MongoDB Atlas cluster.
* **Rate Limiting:** Protects the API endpoints from abuse and DDoS attacks using `express-rate-limit` (capped at 50 requests per 15 minutes per IP).
* **Robust Error Handling:** Gracefully handles invalid API keys, external API timeouts/failures, and missing database URIs, returning either styled HTML alerts or standardized JSON error responses.

## 🛠️ Technologies Used
* **Node.js & Express.js** (Backend Framework)
* **MongoDB & Mongoose** (Database & ODM)
* **Axios** (HTTP Client for fetching external data)
* **EJS** (Embedded JavaScript Templating Engine)
* **Express Rate Limit** (Security Middleware)
* **Dotenv** (Environment Variable Management)

## 📁 Project Structure
```text
Task 7/
│
├── node_modules/         # Project dependencies
├── routes/
│   └── api.js            # API routes and authentication middleware
├── views/
│   └── index.ejs         # Frontend UI template for displaying data
├── .env                  # Environment variables (Ignored in Git)
├── package.json          # Project metadata and scripts
├── server.js             # Main application entry point and configuration
└── README.md             # Project documentation
```

## ⚙️ Setup and Installation

**1. Clone or Extract the Repository**
Navigate into the project directory using your terminal:
```bash
cd "Task 7"
```

**2. Install Dependencies**
Install all required Node.js packages:
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env` file in the root directory (if it doesn't already exist) and add the following details:
```env
PORT=3001
API_KEY=cognifyz_secret_key_2026

# Database Credentials
DB_USER=syedfarhanfawad007_db_user
DB_PASSWORD=Us3iY4qeTHuZlcpB

# MongoDB Connection String
MONGO_URI=mongodb+srv://syedfarhanfawad007_db_user:Us3iY4qeTHuZlcpB@cognifyzuser.a9soc1l.mongodb.net/cognifyz_task7?appName=cognifyzuser
```

**4. Start the Server**
Run the following command to boot up the Express server and connect to MongoDB:
```bash
npm start
```
*Expected Terminal Output:*
> Server is running securely on http://localhost:3001
> Successfully connected to MongoDB!

## 🌐 API Endpoints & Usage

### 1. View External API Data (Authorized)
Fetches data from GitHub and renders the EJS profile UI.
* **URL:** `http://localhost:3001/api/external-data?api_key=cognifyz_secret_key_2026`
* **Method:** `GET`
* **Expected Output:** A styled profile card displaying GitHub stats for `farhanfawad007`.

### 2. Unauthorized Access Test
Demonstrates the security middleware blocking access when the API key is missing.
* **URL:** `http://localhost:3001/api/external-data`
* **Method:** `GET`
* **Expected Output:** A red error alert reading `Error 401: Unauthorized: API key is missing.`

### 3. Rate Limiting Test
To test the rate limiter, refresh the authorized URL rapidly more than 50 times.
* **Expected Output:** A JSON response reading:
  ```json
  {
    "status": 429,
    "error": "Too many requests from this IP, please try again after 15 minutes."
  }
  ```

## 👨‍💻 Author
Built by **Syed Farhan Fawad** for Cognifyz.
