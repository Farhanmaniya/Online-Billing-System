# Online Billing System

A comprehensive, full-stack Online Billing and Invoice Management System built using the MERN stack (MongoDB, Express.js, React.js, Node.js). This application enables businesses to efficiently manage customers, track products, generate professional invoices, and handle mock payments.

## Features

- **Dashboard**: Real-time overview of business performance, revenue, and tracking recent invoices.
- **Customer Management**: Maintain a directory of clients with their contact and billing information.
- **Product Inventory**: Track products and services with automated stock monitoring and low-stock alerts.
- **Invoice Generation**: Create, customize, and issue professional invoices (supports recurring billing and custom taxes).
- **Payment Processing**: Public payment portal for clients to seamlessly pay their invoices via simulated Card, UPI, or Netbanking options.
- **Email & PDF Generation**: Automated email delivery of invoices with dynamically generated attached PDF receipts.

## Tech Stack

### Frontend
- **Framework**: React.js
- **Routing**: React Router DOM
- **Styling**: Vanilla CSS Modules & Framer Motion (for sophisticated animations)
- **HTTP Client**: Axios

### Backend
- **Environment**: Node.js & Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT & bcryptjs
- **Utilities**: NodeMailer (Emails), Puppeteer (PDF Generation), Multer (File Uploads)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Online-Billing-System
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   FRONTEND_BASE_URL=http://localhost:3000
   ```
   *(Ensure to configure SMTP options for NodeMailer if email capabilities are needed).*

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```
   REACT_APP_BASE_URL=http://localhost:5000
   ```

4. **Start the Development Servers**
   - Start the backend server: `npm start` or `npm run dev` (from inside the `backend` directory).
   - Start the frontend client: `npm start` (from inside the `frontend` directory).

## Project Structure

The project strictly separates concerns by dividing into two primary applications:

- `frontend/` - Contains all React components, page layouts, services, animated modules, and static assets.
- `backend/` - Contains the Express application routing, controllers, middleware, MongoDB schemas, and an event-driven architecture for asynchronous side-effects (such as PDF generation and notification dispatching).
- `Doc/` - (Ignored from version control) Used for localized storage of project reports or proprietary material.

## License

This project is authored under the ISC License. All rights reserved.
