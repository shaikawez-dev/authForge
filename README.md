# AuthForge 🔐

A production-ready authentication and authorization backend built with Node.js, Express, MongoDB, and Redis. Designed with scalability, security, and real-world architecture in mind.

---

## 🚀 Features

* JWT Authentication (Access + Refresh Tokens)
* Refresh Token Rotation
* Role-Based Access Control (RBAC)
* Email Verification via Token
* Password Reset using OTP
* Google OAuth Login
* Redis-based Rate Limiting & OTP Storage
* Secure HTTP-only Cookies
* Zod Input Validation
* Controller-Service Architecture
* Dockerized Setup

---

## 🛠 Tech Stack

* Node.js, Express.js
* MongoDB (Mongoose)
* Redis
* JWT (Authentication)
* Zod (Validation)
* Docker

---

## 🧱 Architecture

* Controller-Service Pattern
* Middleware-based Authentication
* Token Service Abstraction
* Redis for caching, OTP, and rate limiting

---

## 📡 API Endpoints

| Method | Endpoint                         | Description    |
| ------ | -------------------------------- | -------------- |
| POST   | /api/v1/auth/register            | Register user  |
| POST   | /api/v1/auth/login               | Login          |
| POST   | /api/v1/auth/logout              | Logout         |
| POST   | /api/v1/auth/refresh             | Refresh token  |
| POST   | /api/v1/auth/forgot-password     | Send OTP       |
| POST   | /api/v1/auth/reset-password      | Reset password |
| GET    | /api/v1/auth/verify-email/:token | Verify email   |

---

## 📘 API Documentation

Swagger UI available at:
http://localhost:5000/api-docs

---

## ⚙️ Setup Instructions

```bash
git clone https://github.com/your-username/authforge.git
cd authforge
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
REFRESH_TOKEN_SECRET=
REDIS_URL=
GOOGLE_CLIENT_ID=
BASE_URL=http://localhost:5000
```

Run the app:

```bash
npm run dev
```

---

## 🐳 Docker Setup

```bash
docker-compose up --build
```

---

## 🌍 Deployment

Backend deployed at:
https://your-domain.com

---

## 📬 Postman Collection

Available in:
docs/postman_collection.json

---

## 📌 Future Improvements

* Multi-device session management
* Token blacklisting using Redis
* Monitoring & logging (Winston + Morgan)

---

## 👨‍💻 Author

Shaik Awez
