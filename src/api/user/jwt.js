const jwt = require("jsonwebtoken");

exports.jwtSign = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_KEY, function (err, token) {
      if (err) {
        reject(err);
      }
      resolve(token);
    });
  });
};
