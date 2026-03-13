const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: {
      type: String,
      select: false // Hide from default queries
    },
    verificationCodeExpires: {
      type: Date,
      select: false
    },
    verificationAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    lockUntil: {
      type: Date,
      select: false
    },
    companyName: {
      type: String,
      maxlength: 100
    },
    companyLogo: {
      type: String // URL or path to the image
    },
    businessAddress: {
      type: String
    },
    phoneNumber: {
      type: String
    },
    taxId: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
