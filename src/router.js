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

const webController = require("./web/controller");
const apiUserController = require("./api/user/controller");
const apiFeedCOntroller = require("./api/feed/controller");
const fileController = require("./api/file/controller");
const cardsController = require("./api/cards/controller");

router.use("/", express.static("./public"));
router.use(headers);
router.use(logging);
router.post("/api/file", upload.single("file"), fileController.upload);
router.get("/api/file/:id", fileController.download);

router.get("/", webController.home);
router.get("/page/:page", webController.page);
router.get("/sitemap", webController.sitemap);

router.post("/api/user/register", apiUserController.register);

router.get("/api/feed", verify, apiFeedCOntroller.index);
router.post("/api/feed", verify, apiFeedCOntroller.store);
router.get("/api/feed/:id", verify, apiFeedCOntroller.show);
router.post("/api/feed/:id", verify, apiFeedCOntroller.update);
router.post("/api/feed/:id/delete", verify, apiFeedCOntroller.destroy);

//명함 관련 api
router.post(
  "/api/cards/register",
  upload.fields([{ name: "file", maxCount: 1 }]),
  cardsController.register
);
router.get("/api/cards/:cardId", cardsController.inquiry);
router.get("/api/cards_all", cardsController.inquiry_all);
router.get("/api/cards/search/:cardId", cardsController.inquiry_other);
router.post("/api/cards/update/:cardId", cardsController.update);
router.post("/api/cards/delete/:cardId", cardsController.delete);
module.exports = router;
