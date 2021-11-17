const mongoose = require('mongoose')

const verifyCodeSchema = mongoose.Schema({
    verifyCode:{
        type: String
    },
    email: {
        type: String,
        require: true,
        unique: true
    }
})

module.exports = mongoose.model("verifyCode", verifyCodeSchema)