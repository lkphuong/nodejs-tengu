const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const CustomerModel = require("../models/customer")

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
        res.status(201).json(createdCustomer)
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

        res.status(200).json({...others, accessToken});
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router