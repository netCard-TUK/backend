const jwt = require("./jwt");
const { register, find } = require("./repogitory");
const crypto = require("crypto");

exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  let { count } = await find(email);

  if (count > 0) {
    return res.send({
      result: "fail",
      message: "중복된 이메일이 존재합니다.",
    });
  }
  const result = await crypto.pbkdf2(
    password,
    process.env.SALT_KET,
    50,
    100,
    "sha512"
  );

  const { affectedRows, insertId } = await register(
    email,
    result.toString("base64"),
    name
  );
  if (affectedRows > 0) {
    const data = await jwt.jwtSign({ id: insertId, name });
    res.send({ access_token: data });
  } else {
    res.send({ result: "fail" });
  }
};

exports.userinfo = (req, res) => {
  const id = ctx.params.id;
  res.send(`${id} 님의 회원정보`);
};
