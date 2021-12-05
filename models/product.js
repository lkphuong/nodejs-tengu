const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String },
    img: { type: String },
    cloudinary_id: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
    size: { type: String },
    price: { type: Number, required: true },
    discount_rate: { type: Number },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
