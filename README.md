# ⚙️ Ganesh Idol Booking - Backend API Server

This directory contains the robust RESTful API backend server that powers the Ganesh Idol Booking eCommerce Platform. Built using **Node.js, Express.js, and MongoDB (via Mongoose)**, the backend serves secure authentication, handles media uploads via Cloudinary, schedules order transactions with Razorpay, sends notification e-mails via Brevo (SMTP), and integrates an intelligent assistant through the Google Gemini API.

---

## 📅 Latest Backend Update

- **Last Commit Date:** `Thu May 28 11:28:56 2026 +0530`
- **Commit Hash:** `1ec907f`
- **Commit Message:** `Merge branch 'master' of https://github.com/santosh-bhaskal-02/Ganesh-Ecom-Back-End`

---


## 🗂️ Project Structure

```
Ganesh-Ecom-Back-End/
├── 📁 config/              # Database connection logic
├── 📁 controllers/         # Business logic functions mapped to routes
│   ├── adminController.js               # Admin configurations & reports
│   ├── authController.js                # Signup, login, verification
│   ├── cartController.js                # Cart addition & updating
│   ├── categoryController.js            # Manage product groupings
│   ├── customIdolController.js          # Handles personalized idol requests
│   ├── dashboardController.js           # Analytics statistics generators
│   ├── orderController.js               # Order placement & Razorpay processing
│   ├── productController.js             # Manage standard product catalog
│   └── taxDeliveryChargesController.js  # Dynamically manage taxes and fees
├── 📁 middlewares/         # JWT parsing and roles validation
├── 📁 models/              # MongoDB Schemas
│   ├── model_admin.js
│   ├── model_user.js
│   ├── model_product.js
│   ├── model_category.js
│   ├── model_cart.js
│   ├── model_cartItem.js
│   ├── model_order.js
│   ├── model_orderItem.js
│   ├── model_customProduct.js
│   └── model_TaxDeliveryCharges.js
├── 📁 routes/              # Express Router mappings (maps URLs to controllers)
├── 📁 services/            # Business helper modules
├── 📁 utils/               # Formatting, response helpers, and mailers
├── .env                    # Environment credentials (Git ignored)
├── server.js               # App entry point
└── package.json            # Node project configuration
```

---

## 🔧 Environment Variables Config

Create a `.env` file in the root of the `Ganesh-Ecom-Back-End` folder to specify application secrets. Below is a guide on the required variables:

| Variable Name | Required Value/Type | Description |
| :--- | :--- | :--- |
| `PORT` | Number (e.g. `3000`) | The port on which the server will listen for requests. |
| `MONGO_URI` | MongoDB Connection URI | Connection string for MongoDB (Atlas cloud cluster or local mongodb). |
| `JWT_SECRET` | String | Secret key used to sign and verify JSON Web Tokens (JWT) for authentication. |
| `API` | Path (e.g. `/api`) | Base API endpoint prefix. |
| `CLOUD_NAME` | Cloudinary Parameter | Your Cloudinary cloud storage name (for product image hosting). |
| `API_KEY` | Cloudinary Parameter | Your Cloudinary API Key. |
| `API_SECRET` | Cloudinary Parameter | Your Cloudinary API Secret Key. |
| `RAZORPAY_KEY_ID` | Razorpay Key | ID credential for payment processing (sandbox/live mode). |
| `RAZORPAY_KEY_SECRET`| Razorpay Secret | Secret credential for payment signature validation. |
| `SMTP_HOST` | E-mail SMTP Server | Brevo or alternate SMTP hostname (e.g., `smtp-relay.brevo.com`). |
| `SMTP_PORT` | Port Number (e.g. `587`)| E-mail server port. |
| `SMTP_USER` | String/Email | Authenticated SMTP username. |
| `SMTP_PASS` | Password/Key | Authenticated SMTP credential/app password. |
| `GEMINI_API_KEY` | Google Gemini API Key | API key from Google AI Studio to power the chatbot. |
| `GEMINI_CHAT_MODEL` | AI Model Name | Recommended: `gemini-1.5-flash` or newer. |

---

## 🚀 Available Scripts

In the backend directory, you can run the following scripts:

### `npm start`
Runs the app in development mode with **Nodemon** monitoring files.
- The server will automatically reload when you save modifications to the source code.
- Opens on the specified `PORT` in the `.env` file (defaults to `3000`).

### `npm install`
Installs all dependencies listed in `package.json`. Make sure to run this before starting the server.

---

## 🔒 Security & Authentication
- **User Passwords:** Stored securely in MongoDB using `bcryptjs` hashing.
- **Access Control:** Middleware checks for active JSON Web Tokens (`jsonwebtoken`) in incoming request headers to validate authentication state.
- **Admin Authorization:** Sensitive endpoints (e.g., product creation, dashboard stats) require a valid Administrator JWT credentials.
