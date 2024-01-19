const repository = require("./repogitory");
const repogitory_user = require("../user/repogitory");
const jwt = require("jsonwebtoken");

//내 명함 정보 등록
exports.register = async (req, res) => {
  const { position, organization, address, tell, email } = req.body;
  const file = req.files;

  // 확장자까지 넣기
  // 사진 경로 받기
  const photo = "http://" + req.get("host") + "/" + file["file"][0].filename;

  // jwt 토큰 값 받고 id 값만 분리하기 - db에 user_id에 저장하기 위함
  const { access_token } = req.headers;
  //const [tokenType, tokenValue] = authorization.split(" ");
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);

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
    return res.send({ isSuccess: "true", id: insertId });
  }

  return res.send({ isSuccess: "false", message: "등록 실패" });
};

//내 명함 정보 조회
exports.inquiry = async (req, res) => {
  const cardId = req.params.cardId;

  //user_id 가져오기
  const { access_token } = req.headers;
  //const [tokenType, tokenValue] = authorization.split(" ");
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);

  //내 명함 정보 가져오기
  const item = await repository.show({ cardId, userId: id });
  if (item == null) {
    return res.send({
      isSuccess: "false",
      message: "조회된 값이 없습니다(cardId나 userId를 확인해주세요)",
    });
  }
  //유저 정보 가져오기
  const user_info = await repogitory_user.show_user(item.user_id);
  if (user_info == null) {
    return res.send({
      isSuccess: "false",
      message: "조회된 값이 없습니다(user_Id를 확인해주세요)",
    });
  }

  const response = {
    isSuccess: "true",
    position: item.position,
    organization: item.organization,
    address: item.address,
    photo: item.photo,
    tell: item.tell,
    email: item.email,
    user_name: user_info.name,
    phone: user_info.phone,
  };

  res.send(response);
};

exports.inquiry_all = async (req, res) => {
  //user_id 값 가져오기
  const { access_token } = req.headers;
  //const [tokenType, tokenValue] = access_token.split(" ");
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);

  const item_all = await repository.show_all(id);

  res.send({
    isSuccess: "true",
    resutl: item_all,
  });
};

//다른 유저 명함 정보 조회
exports.inquiry_other = async (req, res) => {
  const cardId = req.params.cardId;

  //다른 유저 명함 정보 가져오기
  const item = await repository.show_other(cardId);
  if (item == null) {
    res.send({
      isSuccess: "false",
      message: "조회된 값이 없습니다(cardId를 확인해주세요)",
    });
  }
  //유저 정보 가져오기
  const user_info = await repogitory_user.show_user(item.user_id);
  if (user_info == null) {
    return res.send({
      isSuccess: "false",
      message: "조회된 값이 없습니다(user_Id를 확인해주세요)",
    });
  }

  const response = {
    isSuccess: "true",
    position: item.position,
    organization: item.organization,
    address: item.address,
    photo: item.photo,
    tell: item.tell,
    email: item.email,
    user_name: user_info.name,
    phone: user_info.phone,
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
    res.send({
      isSuccess: "false",
      message: "조회된 값이 없습니다(cardId를 확인해주세요)",
    });
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
    return res.send({ isSuccess: "true", id: insertId });
  }
  return res.send({ isSuccess: "false", message: "저장 실패" });
};

//내 명함 목록 삭제
exports.delete = async (req, res) => {
  const cardId = req.params.cardId;

  const { affectedRows, insertId } = await repository.delete(cardId);

  if (affectedRows > 0) {
    res.send({ isSuccess: "true" });
  } else {
    res.send({ isSuccess: "false", message: "삭제 실패" });
  }
};
