const router = require("express").Router();
const CartModel = require("../models/cart");
const CustomerModel = require("../models/customer");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../utils/verifyToken");

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

/*
data = {
  "productId": id of product,
  "quantity": number of a product in cart ,
  "key": -1 || 0 || 1
}
key == -1 && quantity == 1 => reduce number of a product in cart
key == 0 => delete product 
key == 1 => increase number of a product in cart
*/

// update cart (id of customer NOT id cart)
router.put("/:id", verifyToken, async (req, res) => {
  const check = await CartModel.findOne({"products.productId": req.body.productId,}).select("products");
  const getProduct = {
    "productId": req.body.productId,
    "quantity": req.body.quantity
  }
  if (check == null) {
    const addProduct = await CartModel.findOneAndUpdate(
      {"customerId": req.params.id },
      { $push: { products: getProduct } },
      { new: true }
    );
    res.json(addProduct).status(200);
    return
  }

  // delete product 1 -> 0
  if (req.body.quantity == 1 && req.body.key == -1) {
    const deleteProduct = await CartModel.findOneAndUpdate(
      {"customerId": req.params.id },
      { $pull: { products: getProduct } },
      { new: true }
    );
    res.json(deleteProduct).status(200);
    return
  }

  //delete product n -> 0
  else if (req.body.key == 0) {
    const newDeleteProduct = await CartModel.findOneAndUpdate(
      {"customerId": req.params.id },
      { $pull: { products: getProduct } },
      { new: true }
    );
    res.json(newDeleteProduct).status(200);
  }

  // incthe number of a product
  else if (req.body.key == 1) {
    const incProduct = await CartModel.findOneAndUpdate(
      { "products.productId": req.body.productId, customerId: req.params.id },
      { $inc: { "products.$.quantity": 1 } },
      { new: true }
    );
    res.json(incProduct);
  }
  // reduce number
  else {
    const updateCart = await CartModel.findOneAndUpdate(
      { "products.productId": req.body.productId, customerId: req.params.id },
      { $inc: { "products.$.quantity": -1 } },
      { new: true }
    );
    res.json(updateCart);
  }
});

// get all carts
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  await CartModel.find()
    .populate("products.productId")
    .populate("customerId")
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((error) => {
      res.json(error);
    });
});

//get single a cart (id of customer NOT id cart)
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  await CartModel.findOne({ customerId: req.params.id })
    .populate("products.productId")
    .populate("customerId")
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((error) => {
      res.json(error).status(404);
    });
});

//delete cart
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    await CartModel.findByIdAndDelete(req.params.id).then(() => {
      res.json({ message: "Cart has been deleted", status_code: 204 });
    })
    .catch(() => {
      res.json({ message: "Cart is not found", status_code: 404 });
    });
});

module.exports = router;
