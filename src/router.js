require("dotenv").config();
const express = require("express");
const router = express.Router();
const logging = require("./middleware/logging");
const verify = require("./middleware/jwtVerify");
const headers = require("./middleware/header");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".png");
  },
});

const upload = multer({ storage: storage });

const userController = require("./api/user/controller");
const cardsController = require("./api/cards/controller");
const walletController = require("./api/wallet/controller");

// static file
router.use("/", express.static("./public"));
// CORS setting
router.use(headers);
// logging
router.use(logging);

// 유저 관련 api
// 회원가입
router.post("/api/users/register", userController.register);
// 로그인
router.post("/api/users/login", userController.login);
// 회원탈퇴
router.post("/api/users/delete", verify, userController.delete);

//명함 관련 api
router.post(
  "/api/cards/register",
  upload.fields([{ name: "photo", maxCount: 1 }]),
  cardsController.register
);
router.get("/api/cards/search/:cardId", cardsController.inquiry);
router.get("/api/cards/all/search/:userId", cardsController.inquiry_all);
router.post(
  "/api/cards/update/:cardId",
  upload.fields([{ name: "photo", maxCount: 1 }]),
  cardsController.update
);
router.post("/api/cards/delete/:cardId", cardsController.delete);
module.exports = router;

// 명함 지갑 관련 API

// 명함 지갑에 명함 등록 및 삭제
router.post("/api/wallets", verify, walletController.toggle);
// 내 명함 지갑의 모든 명함 조회
router.get(
  "/api/wallets/users/:userId",
  verify,
  walletController.findAllByUserId
);
