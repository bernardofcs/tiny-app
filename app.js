const router = require('./routes');
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

router(app);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

