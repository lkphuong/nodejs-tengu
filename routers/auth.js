const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

const VerifyCodeModel = require("../models/verifycode")
const CustomerModel = require("../models/customer")
const CartModel = require("../models/cart")

const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("../utils/verifyToken");

//register 
router.post("/register", async (req, res) => {
    const newCustomer = new CustomerModel({
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    try {
        
        const createdCustomer = await newCustomer.save()
        let customerId = createdCustomer._id.toString()
        const newCart = CartModel({
            customerId: customerId
        })
        const createdCart = await newCart.save()


        const accessToken = jwt.sign(
            {
                id: newCustomer._id,
                isAdmin: false,
            },
            process.env.JWT_KEY,
            { expiresIn: "3d" }
        );
        const { password, ...others } = newCustomer._doc;


       // res.status(200).json({ ...others, accessToken });

        res.status(200).json({"status_code": 200, "customer": {...others}, "token": accessToken})

        // res.status(201).json({
        //     "status_code": 200,
        //     "message": "Sign Up Success",
        // })
        //res.status(201).json(createdCustomer)
    }
    catch (error) {
        res.status(500).json(error)
    }
})

// login
router.post("/login", async (req, res) => {
    try {
        const customer = await CustomerModel.findOne({ email: req.body.email });

        !customer && res.status(401).json("Wrong credentials!");

        const hashedPassword = CryptoJS.AES.decrypt(
            customer.password,
            process.env.SECRET_KEY
        );

        const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        OriginalPassword !== req.body.password &&
            res.status(401).json("Wrong credentials!");

        const accessToken = jwt.sign(
            {
                id: customer._id,
                isAdmin: customer.isAdmin,
            },
            process.env.JWT_KEY,
            { expiresIn: "3d" }
        );
        const { password, ...others } = customer._doc;

        res.status(200).json({ ...others, accessToken });
    } catch (err) {
        res.status(500).json({"status_code": 404, "message": err});
    }
});

// check token time-expired
router.post("/time-expired",  verifyToken, async (req, res) => {
    res.json({"status_code": 200})
})



// forgot password ->> sent verify code
router.post("/forgotpassword", async (req, res) => {
    try {
        const customer = await CustomerModel.findOne({ "email": req.body.email })
        if (customer == null || req.body.email == null) res.status(404).json("Account does not exist")

        // delete old verify code
        await VerifyCodeModel.findOneAndDelete({"email": req.body.email}).then((data) => {console.log("deleted old verify code")}).catch((err)=> {console.log(err)})

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        
        // // create verify code
        const randomVerifyCode = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
        
        const verifyCode = VerifyCodeModel({
            email: req.body.email,
            verifyCode: randomVerifyCode.toString()
        })
        verifyCode.save().then((data) => {console.log(data)}).catch((err) => {res.send(err)})

        const mailOptions = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: 'Verify code',
            text: 'Your security code is: '+ randomVerifyCode
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
                res.json({"message": "error"})
            } else {
                console.log('Email sent: ' + info.response);
                res.json({"status_code": 200, "message": "Email sent: " + info.response})
            }
        });
    } catch (error) {
        res.send("error")
    }
})


// confirm verify code
router.get("/confirm-code", async (req, res) => {

    const verifyCode = VerifyCodeModel.findOne({"email": req.body.email}).then((data) => {
        if(data.verifyCode === req.body.code) {
            res.json({"status_code": 200, "message": "True"})
        }
        else res.json({"status_code": 404, "message": "False"})
    })
})

module.exports = router