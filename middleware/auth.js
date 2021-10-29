const jwt = require("jsonwebtoken");
var db = require('../utils/database')

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    console.log( token, 'here' )
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);


    const user = db.list("SELECT * FROM tb_user where user_id = '" + decoded._id + "'");
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

module.exports = auth;
