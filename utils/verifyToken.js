const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, customer) => {
      if (err) res.status(403).json({"message": "Token is not valid!"});
      req.customer = customer;
      next();
    });
  } else {
    return res.status(401).json({"message":"You are not authenticated!"});
  }
};


const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.customer.id === req.params.id || req.customer.isAdmin) {
      next();
    } else {
      res.status(403).json({"message": "You are not alowed to do that!"});
    }
  });
};


const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.customer.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
};