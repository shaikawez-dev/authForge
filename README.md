# AuthForge

AuthForge is a full-stack authentication system built to demonstrate how modern applications handle user authentication securely.

The goal of this project is to implement production-level authentication features such as JWT-based login, refresh tokens, email verification, password reset, and OAuth login.

---

## Features

- User registration and login
- Secure password hashing with bcrypt
- JWT authentication
- Access token and refresh token flow
- Protected routes
- Email verification
- Password reset via email
- OAuth login (Google / GitHub)

---

## Tech Stack

**Frontend**
- React
- Vite
- React Router
- Axios

**Backend**
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Nodemailer

---

## Project Structure

authforge
│
├── frontend
│
├── backend
│
└── docs


---

## Getting Started

Clone the repository:
git clone https://github.com/shaikawez-dev/authforge.git


Install dependencies:
cd backend
npm install

cd ../frontend
npm install


Run the development servers:
npm run dev


---

## Environment Variables

Create a `.env` file inside the backend directory.

Example:


PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret


---

## Purpose

This project is built as a learning exercise to understand how authentication systems work in real applications and how to structure a full-stack project in a scalable way.

---

## Author

Shaik Awez