const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Auth API running.");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;