const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const fs = require('fs');
const path = require('path');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationCode -verificationCodeExpires -verificationAttempts -lockUntil');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { companyName, businessAddress, phoneNumber, taxId } = req.body;
    const userId = req.user.id;

    let updateData = {
      companyName,
      businessAddress,
      phoneNumber,
      taxId
    };

    // If a file was uploaded, include it
    if (req.file) {
      // Normalize path to use forward slashes for URLs
      const logoPath = '/uploads/' + req.file.filename;
      updateData.companyLogo = logoPath;

      // Optional: Delete old logo if exists
      const user = await User.findById(userId);
      if (user.companyLogo) {
        const oldLogoPath = path.join(__dirname, '../../public', user.companyLogo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/users/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalCustomers, totalProducts, totalInvoices, revenueData] = await Promise.all([
      Customer.countDocuments({ userId }),
      Product.countDocuments({ userId }),
      Invoice.countDocuments({ userId }),
      Invoice.aggregate([
        { $match: { userId: new (require('mongoose').Types.ObjectId)(userId), status: 'Paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ])
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      totalCustomers,
      totalProducts,
      totalInvoices,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
