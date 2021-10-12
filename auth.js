const express = require('express')
const port = 5500
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

const authRouter = require("./routers/auth")
app.use("/api/auth", authRouter)

app.listen(port, () => {
    console.log('Server started successfully')
})