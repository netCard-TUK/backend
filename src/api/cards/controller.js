const repository = require("./repogitory");
const repogitory_user = require("../user/repogitory");
const jwt = require("jsonwebtoken");
const fs = require("fs");

//내 명함 정보 등록
exports.register = async (req, res) => {
  const { position, organization, address, tell, email } = req.body;
  const file = req.files;

  // 사진 경로 받기
  const photo = file["file"][0].path;

  // jwt 토큰 값 받고 id 값만 분리하기 - db에 user_id에 저장하기 위함
  const { authorization } = req.headers;
  const [tokenType, tokenValue] = authorization.split(" ");
  const { id } = jwt.verify(tokenValue, process.env.JWT_KEY);

  //db에 저장 정상적으로 저장 시 ok / 실패 시 fail
  const { affectedRows, insertId } = await repository.create(
    (user_id = id),
    position,
    organization,
    address,
    photo,
    tell,
    email
  );
  if (affectedRows > 0) {
    return res.send({ result: "ok", id: insertId });
  }

  return res.send({ result: "fail" });
};

//내 명함 정보 조회
exports.inquiry = async (req, res) => {
  const cardId = req.params.cardId;

  //내 명함 정보 가져오기
  const item = await repository.show(cardId);
  if (item == null) {
    return res.send({ result: "fail" });
  }
  //유저 정보 가져오기
  const user_info = await repogitory_user.show_user(item.user_id);
  if (user_info == null) {
    return res.send({ result: "fail" });
  }

  //base64로 인코딩 - 코드가 너무 길어짐
  //const photoBase64 = fs.readFileSync(item.photo, { encoding: "base64" });

  const response = {
    position: item.position,
    organization: item.organization,
    address: item.address,
    photo: item.photo,
    tell: item.tell,
    email: item.email,
    user_name: user_info.name,
  };
  res.send(response);
};

//내 명함 정보 업데이트
exports.update = async (req, res) => {
  const cardId = req.params.cardId;

  let { position, organization, address, photo, tell, email } = req.body;

  //명함 정보 가져오기
  const item = await repository.show(cardId);
  if (item == null) {
    return res.send({ result: "fail" });
  }

  //수정된 항목만 업데이트
  position = position || item.position;
  organization = organization || item.organization;
  address = address || item.address;
  photo = photo || item.photo;
  tell = tell || item.tell;
  email = email || item.email;

  const { affectedRows, insertId } = await repository.update(
    cardId,
    position,
    organization,
    address,
    photo,
    tell,
    email
  );

  if (affectedRows > 0) {
    return res.send({ result: "ok", id: insertId });
  }
  return res.send({ result: "fail", message: "실패" });
};

//내 명함 목록 삭제
exports.delete = async (req, res) => {
  const cardId = req.params.cardId;

  const { affectedRows, insertId } = await repository.delete(cardId);

  if (affectedRows > 0) {
    res.send({ result: "ok" });
  } else {
    res.send({ result: "fail", id: insertId });
  }
};
