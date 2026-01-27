const Customer = require("../models/Customer");

// CREATE customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      userId: req.user.id
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Failed to create customer" });
  }
};

// GET all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user.id });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

// UPDATE customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Failed to update customer" });
  }
};

// DELETE customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete customer" });
  }
};
