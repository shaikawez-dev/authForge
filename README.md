# AuthForge 🔐

A **production-ready authentication and authorization backend** built with Node.js, Express, MongoDB, and Redis.
Designed with **scalability, security, and real-world backend architecture** in mind.

🌍 **Live API:** https://authforge-vkjh.onrender.com
📘 **API Docs (Swagger):** https://authforge-vkjh.onrender.com/api-docs

---

## 🚀 Features

### 🔐 Authentication & Security

* JWT Authentication (**Access + Refresh Tokens**)
* Refresh Token Rotation
* Secure HTTP-only Cookie-based Auth
* Password Hashing (bcrypt)

### 👤 User Management

* User Registration & Login
* Email Verification (Token-based)
* Password Reset via OTP
* Google OAuth Login

### 🛡️ Authorization

* Role-Based Access Control (**RBAC**)
* Protected Routes Middleware

### ⚡ Performance & Protection

* Redis-based OTP Storage
* Redis-based Rate Limiting (Brute-force protection)
* Input Validation using Zod
* Helmet & Secure Headers

### 🧱 Architecture

* Controller-Service Pattern
* Centralized Error Handling
* Token Service Abstraction
* Scalable Folder Structure

---

## 🛠 Tech Stack

| Category   | Tech                |
| ---------- | ------------------- |
| Backend    | Node.js, Express.js |
| Database   | MongoDB (Mongoose)  |
| Caching    | Redis               |
| Auth       | JWT                 |
| Validation | Zod                 |
| DevOps     | Docker              |
| API Docs   | Swagger             |

---

## 🧱 Project Structure

```bash
src/
├── controllers/     # Request/Response handling
├── services/        # Business logic
├── models/          # Mongoose schemas
├── middlewares/     # Auth, error handling, validation
├── routes/          # API routes
├── utils/           # Helpers (email, tokens, etc.)
├── validators/      # Zod schemas
└── config/          # DB, Redis, Swagger configs
```

---

## 📡 API Overview

| Method | Endpoint                         | Description          |
| ------ | -------------------------------- | -------------------- |
| POST   | /api/v1/auth/register            | Register new user    |
| POST   | /api/v1/auth/login               | Login user           |
| POST   | /api/v1/auth/logout              | Logout user          |
| POST   | /api/v1/auth/refresh-token             | Refresh access token |
| POST   | /api/v1/auth/forgot-password     | Send OTP             |
| POST   | /api/v1/auth/reset-password      | Reset password       |
| GET    | /api/v1/auth/verify-email/:token | Verify email         |
| POST   | /api/v1/auth/google-login        | Google OAuth login   |

👉 Full API documentation available at Swagger UI.

---

## 📘 API Documentation

Interactive API docs powered by Swagger:

🔗 https://authforge-vkjh.onrender.com/api-docs

---

## ⚙️ Environment Variables

Create a `.env` file in root:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
REDIS_URL=your_redis_url
GOOGLE_CLIENT_ID=your_google_client_id
BASE_URL=https://authforge-vkjh.onrender.com
```

---

## 🧪 Local Setup

```bash
git clone https://github.com/shaikawez-dev/authforge.git
cd authforge

npm install
npm run dev
```

---

## 🐳 Docker Setup

```bash
docker-compose up --build
```

---

## 🔐 Security Practices Implemented

* HTTP-only cookies (XSS protection)
* Token hashing (email verification & OTP)
* Rate limiting on sensitive routes
* Input validation (Zod)
* Secure headers via Helmet
* Refresh token validation & rotation

---

## ⚡ Key Highlights

* Designed for **real-world scalability**
* Clean separation of concerns (Controller → Service)
* Redis integration for performance & security
* Production-grade authentication flow

---

## 📌 Future Improvements

* Multi-device session management
* Token blacklisting (Redis)
* Logging system (Winston)
* Monitoring (Prometheus/Grafana)
* CI/CD pipeline

---

## 👨‍💻 Author

**Shaik Awez**

---

## ⭐ Show your support

If you like this project, consider giving it a ⭐ on GitHub!
