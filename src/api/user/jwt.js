const jwt = require("jsonwebtoken");

exports.jwtSign = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { foo: "bar" },
      process.env.JWT_KEY,
      { expiresIn: "1m" },
      function (err, token) {
        if (err) {
          reject(err);
        }
        resolve(token);
      }
    );
  });
};
