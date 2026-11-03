# Cognifyz Task 8: Advanced Server-Side Functionality

This project is an advanced Node.js and Express application demonstrating how to handle intensive server-side operations using Redis for caching and Bull for background job processing.

## Features

*   **Express Web Server:** Robust routing and global error handling.
*   **Redis Caching:** Middleware to cache heavy database query responses for 60 seconds.
*   **Asynchronous Background Jobs:** Offloads heavy tasks (like file generation, reporting, and emails) to a background worker using Bull queues.
*   **EJS Templating:** Server-side rendering for frontend views.
*   **Custom Logging:** Middleware for tracking request details and response times.
*   **Dockerized Redis:** Easy local setup for the Redis database using Docker Compose and the `redis:7-alpine` image.

## Installation

1.  **Clone the repository and install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    There is a `.env.example` file provided. Create a `.env` file in the root directory based on the following configuration:
    ```env
    PORT=3000
    REDIS_HOST=127.0.0.1
    REDIS_PORT=6379
    REDIS_PASSWORD=
    CACHE_TTL_SECONDS=60
    ```

## Running the Application

### Step 1: Start Redis
The application requires a running Redis instance for both caching and the job queue. 
```bash
npm run redis:up
```
*(To stop Redis later, run `npm run redis:down`)*

### Step 2: Start the Application Server and Worker

**For Windows Users (Automated):**
You can start both the Express server and the background worker in separate windows using the provided PowerShell script:
```bash
npm run start:all
```
*(This uses the `start.ps1` script to launch the server and worker in two new windows and bypasses execution policies)*.

**For Mac/Linux Users (Manual):**
Open two separate terminal windows.

*Terminal 1 (Start the web server in watch mode):*
```bash
npm run dev
```

*Terminal 2 (Start the background worker in watch mode):*
```bash
npm run dev:worker
```

## API Endpoints

### 1. View application interface
*   **URL:** `/`
*   **Method:** `GET`
*   **Description:** Renders the main `index` EJS template with the active port.

### 2. Get Statistics (Cached)
*   **URL:** `/api/stats`
*   **Method:** `GET`
*   **Description:** Simulates a heavy 800ms query to fetch statistics. The response is cached in Redis for 60 seconds (configurable via `CACHE_TTL_SECONDS`).

### 3. Queue a Background Job
*   **URL:** `/api/jobs`
*   **Method:** `POST`
*   **Payload:** 
    ```json
    {
      "type": "file", 
      "payload": { }
    }
    ```
*   **Description:** Enqueues a heavy task into the background message queue and returns a `202 Accepted` status. Accepts `email`, `report`, or `file` types.

### 4. Health Check
*   **URL:** `/health`
*   **Method:** `GET`
*   **Description:** Returns the server's uptime status.

## Technologies Used

*   **Express** - Web framework for Node.js
*   **Bull** - Queue package handling distributed jobs and messages
*   **ioredis** - Redis client
*   **EJS** - Embedded JavaScript templating
*   **Morgan** - HTTP request logger middleware
