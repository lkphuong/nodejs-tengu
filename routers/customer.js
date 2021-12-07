const router = require("express").Router();
const CustomerModel = require("../models/customer");
const CryptoJS = require("crypto-js");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../utils/verifyToken");

// Get customer
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  await CustomerModel.findOne({ _id: req.params.id })
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((err) => {
      res.json(err).status(500);
    });
});

// Get all customer
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  await CustomerModel.find()
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((err) => {
      res.json(err).status(500);
    });
});

//Update customer
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updateCustomer = await CustomerModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          // password: CryptoJS.AES.encrypt(
          //   req.body.password,
          //   process.env.SECRET_KEY
          // ).toString(),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phone: req.body.phone,
          address: req.body.address,
          country: req.body.country,
          district: req.body.district,
          ward: req.body.ward
        },
      },
      { new: true }
    );
    res.json(updateCustomer).status(200);
  } catch (error) {
    res.json(error).status(500);
  }
});

// Delete customer
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  await CustomerModel.findByIdAndDelete(req.params.id)
    .then(() => {
      res.json({ message: "Customer has been deleted", status_code: 204 });
    })
    .catch(() => {
      res.json({ message: "Customer is not found", status_code: 404 });
    });
});

// change password
// input oldpass and 2 new pass
router.put(
  "/change-password/:id",
  verifyTokenAndAuthorization,
  async (req, res) => {
    const person = await CustomerModel.findOne({ _id: req.params.id });

    try {
      const hashedPassword = CryptoJS.AES.decrypt(
        person.password,
        process.env.SECRET_KEY
      );

      const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

      if(OriginalPassword === req.body.oldpassword) {
        if(req.body.newpassword === req.body.newpassword2){
          const updatePassword = await CustomerModel.findByIdAndUpdate(req.params.id,{
            $set: {
              password: CryptoJS.AES.encrypt(
                req.body.newpassword,
                process.env.SECRET_KEY
              ).toString(),
            }
          },{new: true})
          res.json({"status_code": 200, "message": "Update password successfully"})
        }
        res.json({"status_code": 400, "message": "Xác nhận mật khẩu không chính xác"})
      }
      else {res.json({"status_code": 400, "message": "Mật khẩu không chính xác"})}
    } catch (error) {
      res.json({"status_code": 404,"message": "Customer is not found"})
    }
  }
);

module.exports = router;
