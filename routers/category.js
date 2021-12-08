const router = require("express").Router();
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../utils/verifyToken");

const CategoryModel = require("../models/category");
const ProductModel = require("../models/product");

//get product by category
router.get("/", async (req, res) => {
  const products = await ProductModel.find({ category: req.query.q })
    .then((data) => {
      res.json({ status_code: 200, message: data });
    })
    .catch((err) => {
      res.json({ status_code: 400, message: err });
    });
});

// CRUD category
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newCategory = new CategoryModel(req.body);
  await newCategory
    .save()
    .then((data) => {
      res.json(data).status(201);
    })
    .catch((error) => {
      res.json(error).status(500);
    });
});

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updateCategory = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.json(updateCategory).status(200);
  } catch (error) {
    res.json(error).status(500);
  }
});

router.get("/all", async (req, res) => {
  await CategoryModel.find()
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((error) => {
      res.json(error).status(40);
    });
});

router.get("/:id", async (req, res) => {
  await CategoryModel.findById(req.params.id)
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((error) => {
      res.json(error).status(404);
    });
});

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  await CategoryModel.findByIdAndDelete(req.params.id)
    .then(() => {
      res.json({ message: "Category has been deleted", status_code: 204 });
    })
    .catch(() => {
      res.json({ message: "Category is not found", status_code: 404 });
    });
});

module.exports = router;
