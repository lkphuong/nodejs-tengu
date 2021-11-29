const router = require("express").Router();
const OrderModel = require("../models/order");
const {  verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('../utils/verifyToken')

// create new order
router.post("/", verifyToken, async (req, res) => {
  const newOrder = new OrderModel(req.body);
  await newOrder
    .save()
    .then((data) => {
      res.json(data).status(201);
    })
    .catch((error) => {
      res.json(error).status(500);
    });
});

// update order
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updateOrder = await OrderModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.json(updateOrder).status(200);
  } catch (error) {
    res.json(error).status(500);
  }
});

//get all orders
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  await OrderModel.find()
    .populate({ path: "customerId", select: "firstName lastName phone email" })
    .populate({path: "products.productId", select: "title size price"})
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((error) => {
      res.json(error).status(500);
    });
});

// get single a order
router.get("/find/:id", verifyToken, async (req, res) => {
  await OrderModel.findById(req.params.id)
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((error) => {
      res.json(error).status(404);
    });
});

//delete order have a big bug 
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await OrderModel.findByIdAndDelete(req.params.id).then(()=>{ res.json("Order has been delete")});
  } catch (error) {
    res.json(error).status(404);
  }
});

// statistics all
router.get("/statistics", verifyTokenAndAdmin, async (req, res) => {
  const totalOrders = await OrderModel.count();
  const orders = await OrderModel.find();
  let totalSale = 0,
    totalIncome = 0;
  for (var i = 0; i < totalOrders; i++) {
    if (orders[i].status !== "pending") {
      totalSale++;
      totalIncome += orders[i].payableAmount;
    }
  }
  res.json({
    totalSales: totalSale,
    totalOrders: totalOrders,
    totalIncome: totalIncome,
  });
});

module.exports = router;
