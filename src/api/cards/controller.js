const repository = require("./repogitory");
const userRepository = require("../user/repogitory");
const jwt = require("jsonwebtoken");

//내 명함 정보 등록
exports.register = async (req, res) => {
  let { userId, position, organization, address, tell, email } = req.body;

  //파일 예외 처리 파일 정보가 있을 경우만 인자로 받음
  let photo = req.files && Object.keys(req.files).length > 0 ? req.files : null;
  let time = new Date();
  photo =
    photo != null
      ? "http://" +
        req.get("host") +
        "/" +
        +time.getTime() +
        photo["photo"][0].filename
      : null;

  // req 값이 있는지 검사
  if (
    !userId ||
    !position ||
    !organization ||
    !address ||
    !tell ||
    !email ||
    !photo
  ) {
    return res.send({
      isSuccess: false,
      message: "항목 중 null 값이 존재합니다.",
    });
  }

  // userId와 tell 타입(int) 검사
  if (typeof userId !== "number" || typeof tell !== "number") {
    return res.send({
      isSuccess: false,
      message: "userId와 tell은 정수(int)여야 합니다.",
    });
  }

  // position, organization, address, email 타입(string) 검사
  if (
    typeof position !== "string" ||
    typeof organization !== "string" ||
    typeof address !== "string" ||
    typeof email !== "string"
  ) {
    return res.send({
      isSuccess: false,
      message:
        "position, organization, address, email은 문자열(string)이어야 합니다.",
    });
  }

  // jwt 토큰 값 받고 id 값만 분리하기 - db에 user_id에 저장하기 위함
  const { access_token } = req.headers;
  //const [tokenType, tokenValue] = authorization.split(" ");
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);

  if (userId !== id) {
    return res.send({
      isSuccess: false,
      message: "올바른 토큰 값이 아닙니다.",
    });
  }

  const user_info = await userRepository.show_user(userId);
  if (user_info == null) {
    return res.send({
      isSuccess: false,
      message: "조회된 유저정보가 없습니다.",
    });
  }

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

//특정 명함 정보 조회
exports.inquiry = async (req, res) => {
  const cardId = Number(req.params.cardId);

  if (cardId == null) {
    return res.send({
      isSuccess: false,
      message: "card_id가 null 값입니다.",
    });
  }

  if (typeof cardId !== "number") {
    return res.send({
      isSuccess: false,
      message: "card_id는 정수(int)여야 합니다.",
    });
  }
  // 명함 정보 가져오기
  const item = await repository.show(cardId);
  if (item === null) {
    return res.send({
      isSuccess: false,
      message: "조회된 값이 없습니다(cardId를 확인해주세요)",
    });
  }
  //유저 정보 가져오기
  const user_info = await userRepository.show_user(item.user_id);
  if (user_info == null) {
    return res.send({
      isSuccess: false,
      message: "조회된 유저 정보가 없습니다.",
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

  return res.send(response);
};

//특정 명함 정보 리스트 반환
exports.inquiry_list = async (req, res) => {
  //user_name 값 가져오기
  const name = req.params.name;

  if (typeof name !== "string") {
    return res.send({
      isSuccess: false,
      message: "userName는 문자열(string)이여야 합니다.",
    });
  }

  const item_all = await repository.show_all_as_name(name);

  if (Object.keys(item_all).length == 0) {
    return res.send({
      isSuccess: false,
      message: "조회된 명함 정보가 없습니다.",
    });
  }

  res.send({
    isSuccess: true,
    result: item_all,
  });
};

//내 명함 정보 전체 조회
exports.inquiry_all = async (req, res) => {
  //user_id 값 가져오기
  const { access_token } = req.headers;
  let userId = Number(req.params.userId);
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);

  if (userId !== id) {
    return res.send({
      isSuccess: false,
      message: "올바른 토큰 값이 아닙니다.",
    });
  }

  if (typeof userId !== "number") {
    return res.send({
      isSuccess: false,
      message: "userId는 정수(int)여야 합니다.",
    });
  }

  const user_info = await userRepository.show_user(userId);
  if (user_info == null) {
    return res.send({
      isSuccess: false,
      message: "조회된 유저정보가 없습니다.",
    });
  }

  const item_all = await repository.show_all(id);

  if (Object.keys(item_all).length == 0) {
    return res.send({
      isSuccess: false,
      message: "조회된 명함 정보가 없습니다.",
    });
  }

  res.send({
    isSuccess: true,
    result: item_all,
  });
};

//내 명함 정보 업데이트
exports.update = async (req, res) => {
  const cardId = req.params.cardId;

  const { access_token } = req.headers;
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);
  let { userId, position, organization, address, tell, email } = req.body;

  //파일 예외 처리 파일 정보가 있을 경우만 인자로 받음
  let photo = req.files && Object.keys(req.files).length > 0 ? req.files : null;
  let time = new Date();
  photo =
    photo != null
      ? "http://" +
        req.get("host") +
        "/" +
        +time.getTime() +
        photo["photo"][0].filename
      : null;

  if (userId !== id) {
    return res.send({
      isSuccess: false,
      message: "올바른 토큰 값이 아닙니다.",
    });
  }
  const user_info = await userRepository.show_user(userId);
  if (user_info == null) {
    return res.send({
      isSuccess: false,
      message: "조회된 유저 정보가 없습니다.",
    });
  }

  //명함 정보 가져오기
  const item = await repository.show(cardId);

  //명함 정보 존재 여부 확인
  if (item == null) {
    return res.send({
      isSuccess: false,
      message: "조회된 명함 정보가 없습니다",
    });
  }

  // req 받은 userId와 명함에 저장된 userId의 일치 여부 확인
  if (user_info.id !== item.user_id) {
    return res.send({
      isSuccess: false,
      message: "명함을 등록한 유저정보와 일치하지 않습니다.",
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

  // userId와 tell 타입(int) 검사
  if (typeof userId !== "number" || typeof tell !== "number") {
    return res.send({
      isSuccess: false,
      message: "userId와 tell은 정수(int)여야 합니다.",
    });
  }

  // position, organization, address, email 타입(string) 검사
  if (
    typeof position !== "string" ||
    typeof organization !== "string" ||
    typeof address !== "string" ||
    typeof email !== "string"
  ) {
    return res.send({
      isSuccess: false,
      message:
        "position, organization, address, email은 문자열(string)이어야 합니다.",
    });
  }

  const { affectedRows } = await repository.update(
    cardId,
    position,
    organization,
    address,
    photo,
    tell,
    email
  );

  if (affectedRows > 0) {
    return res.send({ isSuccess: true });
  }
  return res.send({ isSuccess: false, message: "저장 실패" });
};

//내 명함 목록 삭제
exports.delete = async (req, res) => {
  const cardId = Number(req.params.cardId);
  const { access_token } = req.headers;
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);
  let { userId } = req.body;
  userId = Number(userId);

  if (userId !== id) {
    return res.send({
      isSuccess: false,
      message: "올바른 토큰 값이 아닙니다.",
    });
  }

  if (typeof userId !== "number" || typeof cardId !== "number") {
    return res.send({
      isSuccess: false,
      message: "userId와 cardId는 정수(int)여야 합니다.",
    });
  }

  const user_info = await userRepository.show_user(userId);
  if (user_info == null) {
    return res.send({
      isSuccess: false,
      message: "조회된 유저 정보가 없습니다.",
    });
  }

  const { affectedRows } = await repository.delete(cardId);

  if (affectedRows > 0) {
    res.send({ isSuccess: true });
  } else {
    res.send({ isSuccess: false, message: "삭제 실패" });
  }
};
