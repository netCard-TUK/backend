const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const token = req.header("access_token");

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) {
      return res.send({
        isSuccess: false,
        message: "토큰이 유효하지 않습니다.",
        err
      });
    }
    req.user = decoded;
    next();
  });
};
