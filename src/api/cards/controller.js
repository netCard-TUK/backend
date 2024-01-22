const repository = require("./repogitory");
const userRepository = require("../user/repogitory");
const jwt = require("jsonwebtoken");

//내 명함 정보 등록
exports.register = async (req, res) => {
  let { userId, position, organization, address, tell, email } = req.body;
  // 숫자 최소 1자리
  const numRegex = /^[0-9]+$/;
  if (!(numRegex.test(userId) && numRegex.test(tell))) {
    return res.send({
      isSuccess: false,
      message: "userId와 tell은 숫자만 입력 가능합니다.",
    });
  }
  userId = Number(userId);
  tell = Number(tell);

  const tokenUserId = req.user.id;

  // 숫자 최소 1자리
  const idRegex = /^[0-9]+$/;

  // userId 값 검증
  if (!idRegex.test(userId)) {
    return res.send({
      isSuccess: false,
      message: "userId가 잘못되었습니다.",
    });
  }

  userId = Number(userId);

  // files 값 검증
  if (!req.files || Object.keys(req.files).length === 0 || Object.keys(req.files).length > 1
      || !req.files.photo || req.files.photo.length > 1
  ) {
    return res.send(
        {
          isSuccess: false,
          message: "파일이 없거나 2개 이상입니다."
        }
    );
  }

  // 토큰 유저 아이디와 요청 유저 아이디가 다를 경우
  if (tokenUserId !== userId) {
    return res.send({
      isSuccess: false,
      message: "인증실패 : 토큰 유저 아이디와 요청 유저 아이디가 다릅니다.",
    });
  }

  // String 타입 + 띄어쓰기 검사
  const stringRegex = /^[a-zA-Z0-9ㄱ-ㅎ가-힣\s]+$/;
  // email 검사
  const emailRegex = /^[a-zA-Z0-9!@#$%^&*()?_~]+$/;

  // tell 타입 검사
  const tellRegex = /^[0-9]+$/;

  // position, organization, address, email 타입 검사
  if (
    !(position && organization && address && email) ||
    !stringRegex.test(position)||
    !stringRegex.test(organization)||
    !stringRegex.test(address) ||
    !tellRegex.test(tell) ||
    !emailRegex.test(email)
  ) {
    return res.send({
      isSuccess: false,
      message:
        "position, organization, address, email은 문자 이어야 합니다.",
    });
  }

  const user_info = await userRepository.show_user(userId);
  if (user_info == null) {
    return res.send({
      isSuccess: false,
      message: "조회된 유저정보가 없습니다.",
    });
  }

  // file upload
  let uploadPath = __dirname;

  // parse uploadPath
  uploadPath = uploadPath.split("/");

  // remove 3 last element
  uploadPath = uploadPath.slice(0, uploadPath.length - 3);

  // join uploadPath
  uploadPath = uploadPath.join("/") + "/public/" + req.files.photo.md5 + ".png";

  // 파일 URL
  const photo = req.protocol + '://' + req.get('host') + "/" + req.files.photo.md5 + ".png";

  await req.files.photo.mv(uploadPath, (err) => {
    if (err) {
      console.log(err);
      return res.send({
        isSuccess: false,
        message: "파일 업로드 실패",
      });
    }
  });

  //db에 저장 정상적으로 저장 시 ok / 실패 시 fail
  const { affectedRows, insertId } = await repository.create(
    userId,
    position,
    organization,
    address,
    photo,
    tell,
    email
  );

  if (affectedRows > 0) {
    return res.send({ isSuccess: true, cardId: insertId });
  }
  return res.send({ isSuccess: false, message: "등록 실패" });
};

//특정 명함 정보 조회
exports.inquiry = async (req, res) => {
  let cardId = req.params.cardId;

  // 숫자 최소 1자리
  const numRegex = /^[0-9]+$/;
  if (!numRegex.test(cardId)) {
    return res.send({
      isSuccess: false,
      message: "cardId는 숫자만 입력 가능합니다.",
    });
  }
  cardId = Number(cardId);

  if (cardId == null) {
    return res.send({
      isSuccess: false,
      message: "card_id가 null 값입니다.",
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
  if (user_info === null) {
    return res.send({
      isSuccess: true,
      result: item,
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
    name: user_info.name,
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
      message: "userName은 문자열(string)이여야 합니다.",
    });
  }

  const item_all = await repository.show_all_as_name(name);

  if (Object.keys(item_all).length == 0) {
    return res.send({
      isSuccess: true,
      result: item_all,
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
  let userId = req.params.userId;
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);

  // 숫자 최소 1자리
  const numRegex = /^[0-9]+$/;
  if (!numRegex.test(userId)) {
    return res.send({
      isSuccess: false,
      message: "userId는 숫자만 입력 가능합니다.",
    });
  }
  userId = Number(userId);

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
  let cardId = req.params.cardId;

  const { access_token } = req.headers;
  const { id } = jwt.verify(access_token, process.env.JWT_KEY);
  let { userId, position, organization, address, tell, email } = req.body;

  // 숫자 최소 1자리
  const numRegex = /^[0-9]+$/;
  if (!(numRegex.test(userId) && numRegex.test(cardId))) {
    return res.send({
      isSuccess: false,
      message: "userId와 cardId는 숫자만 입력 가능합니다.",
    });
  }
  userId = Number(userId);
  cardId = Number(cardId);

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
  tell ? (tell = tell) : (tell = item.tell);
  email ? (email = email) : (email = item.email);

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

  // 숫자 최소 1자리
  if (!numRegex.test(tell)) {
    console.log(userId, tell);
    console.log(typeof userId, typeof tell);
    return res.send({
      isSuccess: false,
      message: "tell은 숫자만 입력 가능합니다.",
    });
  }
  tell = Number(tell);

  const { affectedRows } = await repository.update(
    cardId,
    position,
    organization,
    address,
    tell,
    email
  );

  if (affectedRows > 0) {
    return res.send({ isSuccess: true });
  }
  return res.send({ isSuccess: false, message: "저장 실패" });
};

/**
 * 내 명함 목록 삭제
 * 미사용으로 주석 처리
 */
// exports.delete = async (req, res) => {
//   const cardId = Number(req.params.cardId);
//   const { access_token } = req.headers;
//   const { id } = jwt.verify(access_token, process.env.JWT_KEY);
//   let { userId } = req.body;
//   userId = Number(userId);

//   if (userId !== id) {
//     return res.send({
//       isSuccess: false,
//       message: "올바른 토큰 값이 아닙니다.",
//     });
//   }

//   if (typeof userId !== "number" || typeof cardId !== "number") {
//     return res.send({
//       isSuccess: false,
//       message: "userId와 cardId는 정수(int)여야 합니다.",
//     });
//   }

//   const user_info = await userRepository.show_user(userId);
//   if (user_info == null) {
//     return res.send({
//       isSuccess: false,
//       message: "조회된 유저 정보가 없습니다.",
//     });
//   }

//   const { affectedRows } = await repository.delete(cardId);

//   if (affectedRows > 0) {
//     res.send({ isSuccess: true });
//   } else {
//     res.send({ isSuccess: false, message: "삭제 실패" });
//   }
// };
