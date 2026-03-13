// Core Express application setup.
// This module wires middleware and route modules together but does not
// start the HTTP server itself. That separation keeps bootstrapping and
// HTTP concerns separate from process startup (see server.js).
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const publicInvoiceRoutes = require("./routes/publicInvoiceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();

// Connect to MongoDB before handling any requests so that controllers and
// services can rely on a live database connection.
connectDB();

app.use(cors());
app.use(express.json());
// Serves uploaded files (for example company logos) so that other parts of the
// system can reference them without embedding binary data in the database.
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Lightweight root endpoint for simple uptime checks or local verification.
app.get("/", (req, res) => {
    res.send("Auth API running.");
});

// Route modules encapsulate HTTP endpoints by domain. Controllers behind these
// routes may emit domain events which are handled asynchronously by listeners,
// keeping side‑effects (emails, notifications) out of request handlers.
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/public/invoices", publicInvoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
