const router = require("express").Router();
const OrderModel = require("../models/order");
const CustomerModel = require("../models/customer");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../utils/verifyToken");

// create new order
router.post("/", verifyToken, async (req, res) => {
  const newOrder = new OrderModel(req.body);
  const customer = await CustomerModel.findById(req.body.customerId);
  try {
    const total_orders = customer.total_orders + 1;
    const total_spending =
      customer.total_spending + parseInt(req.body.payableAmount);
    await CustomerModel.findOneAndUpdate(
      { _id: req.body.customerId },
      {
        $set: {
          total_orders: total_orders,
          total_spending: total_spending,
        },
      },
      { new: true }
    ).then(() => {
      newOrder.save().then((result) => {
        res.json({ status_code: 201, message: result });
      });
    });
  } catch (error) {
    res.json({ status_code: 500, message: error });
  }
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
    .populate({ path: "products.productId", select: "title size price" })
    .sort({ createdAt: -1 })
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
    .populate("products.productId")
    .sort({ createdAt: -1 })
    .then((data) => {
      res.json({ status_code: 200, message: data });
    })
    .catch((error) => {
      res.json({ status_code: 404, message: "Order is not found" });
    });
});

//delete order
router.delete("/:id", async (req, res) => {
  await OrderModel.findByIdAndDelete(req.params.id)
    .then(() => {
      res.json({ message: "Order has been deleted", status_code: 204 });
    })
    .catch(() => {
      res.json({ message: "Order is not found", status_code: 404 });
    });
});

//seed all my orders
router.get("/myorders/:id", verifyTokenAndAuthorization, async (req, res) => {
  await OrderModel.find({ customerId: req.params.id })
    .populate("products.productId")
    .then((myorders) => {
      res.json({ status_code: 200, message: myorders });
    })
    .catch((err) =>
      res.json({ status_code: 404, message: "My orders are not found" })
    );
  res.json(myorders);
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
