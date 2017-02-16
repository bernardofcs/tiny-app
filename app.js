const router = require('./routes');
const express = require("express");
const cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'))
app.set("view engine", "ejs");

router(app);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

