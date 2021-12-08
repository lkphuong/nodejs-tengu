const router = require("express").Router();
const CustomerModel = require("../models/customer");
const OrderModel = require("../models/order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../utils/verifyToken");

// top customer
router.get("/top-customer", verifyTokenAndAdmin, async (req, res) => {
  await CustomerModel.find()
    .sort({ total_spending: -1 }).limit(5)
    .then((data) => {
      res.json({ status_code: 200, message: data });
    })
    .catch((err) => {
      res.json({ status_code: 400, message: err });
    });
});

//top customers
router.get("/topcustomer", verifyTokenAndAdmin, async (req, res) => {
  await CustomerModel.find()
    .sort({ total_spending: -1 })
    .then((data) => {
      res.json({ status_code: 200, message: data });
    })
    .catch((err) => {
      res.json({ status_code: 400, message: err });
    });
});

//Latest Orders
router.get("/latest-orders", async (req, res) => {
  await OrderModel.find().populate({ path: "customerId", select: "firstName lastName phone email" })
    .sort({ createdAt: -1 }).limit(5)
    .then((data) => {
      res.json({ status_code: 200, message: data });
    })
    .catch((err) => {
      res.json({ status_code: 400, message: err });
    });
});

module.exports = router;
