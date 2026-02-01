# 📚 E-Commerce Backend API

A production-ready RESTful API for an online bookstore, built with **Node.js**, **Express**, and **MongoDB**. 

This project features advanced backend architecture including **ACID Transactions** for data integrity, a custom **Cryptographically Secure Mock Payment Gateway**, and robust security measures.

## 🚀 Key Features

* **🔐 Authentication & Authorization**: Secure User Registration and Login using **JWT (JSON Web Tokens)**.
* **🛒 Shopping Cart**: Persistent cart management (Add, Remove, Update quantity).
* **📦 Order Management**: Full checkout lifecycle (Pending → Paid → Shipped).
* **💳 Payment Simulation (Advanced)**: 
    * A custom Mock Payment Gateway mimicking **Razorpay/Stripe**.
    * Implements **HMAC-SHA256 Signature Verification** to prevent tampering.
    * Automated "Test Harness" to generate valid signatures for easy testing.
* **🛡️ Data Integrity**: Uses **MongoDB ACID Transactions** to ensure Inventory is only reduced if Payment is confirmed.
* **⚡ Security**: Implemented **Rate Limiting**, **Helmet** headers, and **Parameter Pollution** protection.
* **📖 Documentation**: Fully documented API using **Swagger UI**.

---

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB Atlas (Cloud)
* **ODM**: Mongoose
* **Documentation**: Swagger (OpenAPI 3.0)
* **Security**: Helmet, Express-Rate-Limit, HPP, CORS

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/atif-19/ecommerce-backend.git]
cd ecommerce-backend
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables
```bash
Create a .env file in the root directory and add the following:
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key

# Mock Payment Secrets (You can invent these)
PAYMENT_KEY_ID=mock_key_id_12345
PAYMENT_KEY_SECRET=my_super_secret_mock_password
```
### 4. Start the Server
```bash
# Development Mode (with Nodemon)
npm run dev

# Production Mode
npm start
```
The server will start on http://localhost:5000.

## 🔄 Application Flow

The API follows a strict **MVC** pattern with secure token-based authentication. Here is the lifecycle of a typical purchase:

### 1. Authentication Phase
* **User Registers** (`POST /api/auth/register`) → Account created in MongoDB.
* **User Logins** (`POST /api/auth/login`) → Server validates credentials and issues a **JWT Bearer Token**.
* *Note: This token must be included in the Header (`Authorization: Bearer <token>`) for all subsequent steps.*

### 2. Shopping Phase
* **Browse Catalog** (`GET /api/books`) → User views available books.
* **Add to Cart** (`POST /api/cart`) → Item added to user's persistent cart.
* **Checkout** (`POST /api/orders`) → The Cart is converted into a **Pending Order**.

### 3. Payment & Transaction Phase (The Secure Core)
This project simulates a real-world secure payment loop:
1.  **Initiate Payment** (`POST /api/payments/create-order`)
    * Server generates a Mock Payment ID.
    * Server pre-calculates a **Cryptographic Signature** (acting as the Bank).
2.  **Verify Payment** (`POST /api/payments/verify`)
    * Client sends the Signature + Payment ID back to the server.
    * **Security Check:** Server re-hashes the data to verify authenticity.
    * **ACID Transaction:**
        * If valid: Order marked **PAID**.
        * **AND** Stock reduced from Inventory.
        * *(If any step fails, the entire transaction rolls back).*
