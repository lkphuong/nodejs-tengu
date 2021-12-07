const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    country: { type: String },
    total_orders: {type: Number, default: 0},
    total_spending: {type: Number, default: 0},
    district:{type: String},
    ward: {type: String}
  },
  { timestamps: true }
);

module.exports = mongoose.model("customer", CustomerSchema);
