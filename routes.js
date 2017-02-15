module.exports = (app) =>{

  var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

  app.get("/", (req, res) => {
    res.redirect("/urls");
    //res.end("Hullo");
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  // app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
  // });

  // app.get("/hello", (req, res) => {
  //   res.end("<html><body>Hello <b>World</b></body></html>\n");
  // });

  app.get("/urls", (req, res) => {
   // let templateVars = { username: req.cookies["username"], urls: urlDatabase };
    let templateVars = { username: req.cookies["username"], urls: urlDatabase };
    res.render("urls_index", templateVars);

  });



  app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, urls: urlDatabase, username: req.cookies["username"] };
    res.render("urls_show", templateVars);
  });



  app.post("/urls", (req, res) => {
    //console.log(req.body);  // debug statement to see POST parameters
    //res.send("Ok");         // Respond with 'Ok' (we will replace this)
    let short = generateRandomString();
    urlDatabase[short] = req.body['longURL'];
    let templateVars = { shortURL: short, urls: urlDatabase, username: req.cookies["username"]};
    res.render("urls_show", templateVars);
   // console.log(urlDatabase);
  });


  app.post("/urls/:id/delete", (req, res) =>{
    delete urlDatabase[req.params.id];
    res.redirect('/urls');

  });

  app.post("/urls/:id/update", (req, res) =>{
    urlDatabase[req.params.id] = req.body['longURL'];
    res.redirect('/urls');
  });

  app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    console.log(longURL);
    res.redirect(longURL);
  });

  app.post("/login", (req, res) => {
    res.cookie('username', req.body['username']);
    //console.log(res.cookie(req.body['username']));
    res.redirect('/');
  });

  app.post("/logout", (req, res) => {
    res.clearCookie('username')
    res.redirect('/')
  });

  function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
};
