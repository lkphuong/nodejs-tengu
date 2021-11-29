const router = require("express").Router()
const CustomerModel = require("../models/customer")
const CryptoJS = require("crypto-js")
const {  verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('../utils/verifyToken')

// Get customer
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
    await CustomerModel.findOne({ "_id": req.params.id }).then((data) => { res.json(data).status(200) }).catch((err) => { res.json(err).status(500) })
})

// Get all customer
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    await CustomerModel.find().then((data) => { res.json(data).status(200) }).catch((err) => { res.json(err).status(500) })
})

//Update customer
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updateCustomer = await CustomerModel.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phone: req.body.phone,
                    address: req.body.address
                }
            },
            { new: true }
        );
        res.json(updateCustomer).status(200)
    } catch (error) {
        res.json(error).status(500)
    }
})

// Delete customer
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await CustomerModel.findByIdAndDelete(req.params.id).then(()=>{res.json("Customer has been deleted").status(204)});
    } catch (error) {
        res.json(err).status(500)
    }
})

module.exports = router