require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const router = require("./src/router");
const bodyParser = require("body-parser");
const hbs = require("express-hbs");

app.engine(
  "hbs",
  hbs.express4({
    defaultLayout: __dirname + "/views/layouts/web",
  })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extends: true }));

app.unsubscribe(express.static("public"));

app.use("/", router);

app.listen(port, () => {
  console.log(`웹서버 구동... ${port}`);
});
