const jwt = require("jsonwebtoken");
const User = require("../models/user");

const twoFaAuth = async (req, res, next) => {
  try {
    console.log("test1234");
    const token = req.header("Authorization").replace("Bearer ", "");
    console.log("token ", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);

    const user = await User.findOne({ _id: decoded._id, twoFaToken: token });
    console.log("user------", user);
    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = twoFaAuth;
