const jwt = require("./jwt");
const { register, find } = require("./repogitory");
const crypto = require("crypto");

exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  let { count } = await find(email);

  if (typeof password !== "string" || !password.trim()) {
    return res.status(400).send({
      isSuccess: "false",
      message: "비밀번호는 필수 입력 항목입니다.",
    });
  }
  if (count > 0) {
    return res.send({
      isSuccess: "false",
      message: "중복된 이메일이 존재합니다.",
    });
  }
  const result = await crypto.pbkdf2Sync(
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
    res.send({
      isSuccess: "false",
      message: "항목 중 빈 칸이 존재하거나 올바른 값이 아닙니다.",
    });
  }
};
