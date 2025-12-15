 Stock Broker client Dashboard – Real-Time Stock Monitoring System

A full-stack web application that allows users to **sign up, log in, and monitor real-time stock prices** using WebSockets.  
This project demonstrates **authentication, real-time communication, and cloud deployment**.

---

## 🔗 Live Deployment

- **Frontend (Vercel):** https://escrow-gamma-seven.vercel.app  
- **Backend (Render):** https://escrow-hi35.onrender.com


---

## Project Overview

This application allows users to:
- Create an account (signup)
- Login
- Subscribe to stock symbols
- Receive real-time stock price updates
- See live connected user count

Real-time updates are handled using **Socket.IO**.

---

##  Tech Stack Used

### Frontend
- React (Vite)
- JavaScript
- CSS
- Socket.IO Client
- Deployed on **Vercel**

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- dotenv
- Deployed on **Render**

### Database
- MongoDB Atlas



---

##  Authentication Flow

### Signup
- User registers with email & password
- Password must be **at least 6 characters**
- Email uniqueness is checked


### Login
- Credentials are verified
- Socket connection is established
- User enters dashboard


##  Real-Time Stock Updates

- Stock prices are generated on the backend
- Prices update every **1 second**
- Users subscribe/unsubscribe to stocks
- Updates are pushed using **Socket.IO**

---




