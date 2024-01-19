const repository = require("./repogitory");
const userRepository = require("../user/repogitory");
const jwt = require("jsonwebtoken");

//내 명함 정보 등록
exports.register = async (req, res) => {
  let { userId, position, organization, address, tell, email } = req.body;
  const file = req.files;

  if (!userId || !position || !organization || !address || !tell || !email) {
    return res.send({
      isSuccess: false,
      message: "항목 중 null 값이 존재합니다.",
    });
  }

  let time = new Date();
  const photo =
    "http://" +
    req.get("host") +
    "/" +
    file["file"][0].filename +
    time.getTime();

  // jwt 토큰 값 받고 id 값만 분리하기 - db에 userId에 저장하기 위함
  const { access_token } = req.headers;
  //const [tokenType, tokenValue] = authorization.split(" ");
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);
  checkUserInfo(res, userId, id);
  //db에 저장 정상적으로 저장 시 ok / 실패 시 fail
  const { affectedRows, insertId } = await repository.create(
    (userId = id),
    position,
    organization,
    address,
    photo,
    tell,
    email
  );
  if (affectedRows > 0) {
    return res.send({ isSuccess: true, id: insertId });
  }

  return res.send({ isSuccess: false, message: "등록 실패" });
};

//내 명함 정보 조회
exports.inquiry = async (req, res) => {
  const cardId = req.params.cardId;

  //userId 가져오기
  const { access_token } = req.headers;
  //const [tokenType, tokenValue] = authorization.split(" ");
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);
  let { userId } = req.body;

  checkUserInfo(res, userId, id);

  // 명함 정보 가져오기
  const item = await repository.show({ cardId, userId: id });
  if (item === null) {
    return res.send({
      isSuccess: false,
      message: "조회된 값이 없습니다(cardId나 userId를 확인해주세요)",
    });
  }
  //유저 정보 가져오기
  const user_info = await userRepository.show_user(item.userId);
  if (user_info == null) {
    return res.send({
      isSuccess: false,
      message: "조회된 값이 없습니다(userId를 확인해주세요)",
    });
  }

  const response = {
    isSuccess: true,
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

//내 명함 정보 전체 조회
exports.inquiry_all = async (req, res) => {
  //userId 값 가져오기
  const { access_token } = req.headers;
  let { userId } = req.body;
  //const [tokenType, tokenValue] = access_token.split(" ");
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);
  checkUserInfo(res, userId, id);

  const item_all = await repository.show_all(id);

  res.send({
    isSuccess: true,
    result: item_all,
  });
};

//다른 유저 명함 정보 조회
exports.inquiry_other = async (req, res) => {
  const cardId = req.params.cardId;

  //다른 유저 명함 정보 가져오기
  const item = await repository.show_other(cardId);
  if (item == null) {
    res.send({
      isSuccess: false,
      message: "조회된 값이 없습니다(cardId를 확인해주세요)",
    });
  }
  //유저 정보 가져오기
  const user_info = await userRepository.show_user(item.userId);
  if (user_info == null) {
    return res.send({
      isSuccess: false,
      message: "조회된 값이 없습니다(userId를 확인해주세요)",
    });
  }

  const response = {
    isSuccess: true,
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

  const { access_token } = req.headers;
  //const [tokenType, tokenValue] = access_token.split(" ");
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);
  let { userId, position, organization, address, photo, tell, email } =
    req.body;

  checkUserInfo(res, userId, id);
  //명함 정보 가져오기
  const item = await repository.show({ cardId, userId });
  if (item == null) {
    res.send({
      isSuccess: false,
      message: "조회된 값이 없습니다(cardId 또는 userId를 확인해주세요)",
    });
  }

  //수정된 항목만 업데이트 , body 항목의 null 값 검증
  position ? (position = position) : (position = item.position);
  organization
    ? (organization = organization)
    : (organization = item.organization);
  address ? (address = address) : (address = item.address);
  photo ? (photo = photo) : (photo = item.photo);
  tell ? (tell = tell) : (tell = item.tell);
  email ? (email = email) : (email = item.email);

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
    return res.send({ isSuccess: true, id: insertId });
  }
  return res.send({ isSuccess: false, message: "저장 실패" });
};

//내 명함 목록 삭제
exports.delete = async (req, res) => {
  const cardId = req.params.cardId;
  const { access_token } = req.headers;
  //const [tokenType, tokenValue] = access_token.split(" ");
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);
  let { userId } = req.body;
  checkUserInfo(res, userId, id);

  const { affectedRows, insertId } = await repository.delete(cardId);

  if (affectedRows == 0) {
    res.send({ isSuccess: true });
  } else {
    res.send({ isSuccess: false, message: "삭제 실패" });
  }
};

const checkUserInfo = async (res, userId, id) => {
  // 유저 정보 확인하기
  if (userId != id) {
    return res.send({
      isSuccess: false,
      message: "올바른 토큰 값이 아닙니다.",
    });
  }

  // userId, id 타입 일치 확인
  if (userId !== id) {
    return res.send({
      isSuccess: false,
      message: "타입이 일치하지 않습니다.(userId 타입은 int형 입니다.)",
    });
  }

  // 유저 정보 가져오기
  const user_info = await userRepository.show_user(userId);
  if (user_info === null) {
    return res.send({
      isSuccess: false,
      message: `조회된 값이 없습니다`,
    });
  }
};
