const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            unique: true
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model("category", CategorySchema)