const router = require("express").Router();
const CartModel = require("../models/cart");
const CustomerModel = require("../models/customer");
const {  verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('../utils/verifyToken')

// create cart
router.post("/", verifyToken, async (req, res) => {
  const newCart = new CartModel(req.body);

  await newCart
    .save()
    .then((data) => {
      res.json(data).status(201);
    })
    .catch((err) => {
      res.json(err).status(500);
    });
});

// update cart
router.put("/:customerId", verifyToken, async (req, res) => {
  try {
    const updateCart = await CartModel.findByIdAndUpdate(
      req.params.customerId,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.json(updateCart).status(200);
  } catch (error) {
    res.json(error).status(500);
  }
});

// get all carts
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  await CartModel.find()
    .populate("products.productId").populate("customerId")
    .then((data) => {
      res.json(data).status(200)
    })
    .catch((error) => {
      res.json(error)
    });
});

//get single a cart
router.get("/find/:customerId", verifyTokenAndAuthorization, async (req, res) => {
  await CartModel.findOne({"customerId": req.params.customerId})
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((error) => {
      res.json(error).status(404);
    });
});

//delete cart
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await CartModel.findByIdAndDelete(req.params.id);
    res.json("Cart has been deleted").status(204);
  } catch (error) {
    res.json(error).status(404);
  }
});

module.exports = router;
