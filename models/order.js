const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
    {
        customerId:{type: mongoose.Schema.Types.ObjectId, required: true, ref: "customer"},
        products: [
            {
                productId: {type: mongoose.Schema.Types.ObjectId, ref: "Product"},
                quantity: {type: Number, default: 1},
            }
        ],
        payableAmount: {type: Number, required: true},
        amount: {type: Number, required: true},
        phone: {type: String, required: true},
        address: {type: Object, required: true},
        status: {type: String, default: "pending"}
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);