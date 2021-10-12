const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        desc: {type: String},
        img: {type: String},
        cloudinary_id: {type: String},
        category: {type: String},
        size: {type: String},
        price: {type: Number, required: true},
        amount: {type: Number, required: true}
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
