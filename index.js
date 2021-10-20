const express = require('express')
const port = 5000
const app = express()
app.use(express.json())

//morgan
const morgan = require('morgan')
app.use(morgan('combined'))

//cors
const cors = require('cors')
app.use(cors())

//dotenv
const dotenv = require('dotenv')
dotenv.config()


//connect mongodb
const mongoose = require('mongoose')
mongoose.connect(process.env.mongodb_url,
    {
        // useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
    },
    function (err) {
        if (err) {
            console.log('MongoDB connected error' + err)
        }
        else {
            console.log("MongoDB connected successfully")
        }
    })

const customerRouter = require('./routers/customer')
const productRouter = require('./routers/product')
const cartRouter = require('./routers/cart')
const orderRouter = require('./routers/order')
const categoryRouter = require("./routers/category")
const authRouter = require("./routers/auth")

app.use("/api/auth", authRouter)
app.use("/api/customer", customerRouter)
app.use("/api/product", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/category", categoryRouter)


app.listen(port, () => {
    console.log('Server started successfully')
})