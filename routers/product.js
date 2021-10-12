const router = require('express').Router()
const ProductModel = require("../models/product")
const upload = require('../utils/multer')
const cloudinary = require('../utils/cloudinary')
const {  verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('../utils/verifyToken')


//create product
router.post("/", verifyTokenAndAdmin, upload.single("image"), async (req, res) => {
    const result = await cloudinary.uploader.upload(req.file.path);   
    try {
        const newProduct = new ProductModel({
            title: req.body.title,
            desc: req.body.desc,
            img: result.secure_url,
            cloudinary_id: result.public_id,
            category: req.body.category,
            size: req.body.size,
            price: req.body.price,
            amount: req.body.amount,
        })

        newProduct.save().then((data) => {res.json(data).status(201)}).catch((err) => {res.json(err).status(500)})
    } catch (error) {
        res.json(error).status(500)
    }
})

// Update product
router.put("/:id", verifyTokenAndAdmin, upload.single("image"), async (req, res) => {
    try {
        let product = await ProductModel.findById(req.params.id);

        let result
        if(req.file) {
            // Delete image from cloudinary
            await cloudinary.uploader.destroy(product.cloudinary_id);
            result = await cloudinary.uploader.upload(req.file.path)
        }
        // Update new image and infomation of product
        const updateProduct = await ProductModel.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    title: req.body.title,
                    desc: req.body.desc,
                    img: result?.secure_url || product.img,
                    cloudinary_id: result?.public_id || product.cloudinary_id,
                    category: req.body.category,
                    size: req.body.size,
                    price: req.body.price,
                    amount: req.body.amount,
                }
            },
            {new: true}
        );
        res.json(updateProduct).status(200)
    } catch (error) {
        res.json(error).status(500)        
    }
})

// Get all products
router.get("/", async (req, res) => {
    await ProductModel.find().then((data) => {res.json(data).status(200)}).catch((err) => {res.json(err).status(404)})
})

//Get single product
router.get("/find/:id", async (req, res) => {
    await ProductModel.findById(req.params.id).then((data) => {res.json(data).status(200)}).catch((err) => {res.json(err).status(404)})
})

// Delete product
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        let product = await ProductModel.findById(req.params.id)

        // Delete image of product from cloudinary
        await cloudinary.uploader.destroy(product.cloudinary_id)
        //Delete product from data
        await ProductModel.findByIdAndDelete(req.params.id)
        res.json("Product has been deleted").status(204)
    } catch (error) {
        res.json(err).status(500)
    }
})

module.exports = router