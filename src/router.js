require("dotenv").config();
const express = require("express");
const router = express.Router();
const logging = require("./middleware/logging");
const verify = require("./middleware/jwtVerify");

const multer = require("multer");
const upload = multer({ dest: "storage/" });

const webController = require("./web/controller");
const apiUserController = require("./api/user/controller");
const apiFeedCOntroller = require("./api/feed/controller");
const fileController = require("./api/file/controller");
const cardsController = require("./api/cards/controller");

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

router.post(
  "/api/cards",
  upload.fields([{ name: "file", maxCount: 1 }]),
  cardsController.register
);
router.get("/api/cards/:cardId", cardsController.inquiry);
router.post("/api/cards/update/:cardId", cardsController.update);
router.post("/api/cards/delete/:cardId", cardsController.delete);

module.exports = router;
